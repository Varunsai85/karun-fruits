package com.karunfruits.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.karunfruits.dto.request.LoginRequest;
import com.karunfruits.dto.request.RegisterRequest;
import com.karunfruits.dto.response.AuthResponse;
import com.karunfruits.entity.User;
import com.karunfruits.exception.BadRequestException;
import com.karunfruits.repository.UserRepository;
import com.karunfruits.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (req.getPhone() != null && userRepository.existsByPhone(req.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .referralCode(generateReferralCode(req.getName()))
                .referredBy(req.getReferralCode())
                .verificationToken(verificationToken)
                .build();

        userRepository.save(user);

        if (req.getReferralCode() != null && !req.getReferralCode().isBlank()) {
            userRepository.findByReferralCode(req.getReferralCode()).ifPresent(referrer -> {
                referrer.setLoyaltyPoints(referrer.getLoyaltyPoints() + 50);
                userRepository.save(referrer);
            });
        }

        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
        notificationService.sendVerificationEmail(user.getEmail(), user.getName(), verificationUrl);

        return AuthResponse.builder()
                .message("Account created! Please check your email to verify your account.")
                .build();
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.isEmailVerified()) {
            throw new BadRequestException("EMAIL_NOT_VERIFIED");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, token);
    }

    public AuthResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification link"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, jwt);
    }

    public AuthResponse resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email"));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        userRepository.save(user);

        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
        notificationService.sendVerificationEmail(user.getEmail(), user.getName(), verificationUrl);

        return AuthResponse.builder()
                .message("Verification email resent. Please check your inbox.")
                .build();
    }

    public AuthResponse forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            notificationService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetUrl);
        });
        // Same message always to prevent email enumeration
        return AuthResponse.builder()
                .message("If an account exists with this email, a password reset link has been sent.")
                .build();
    }

    public AuthResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset link"));

        if (user.getPasswordResetTokenExpiry() == null ||
                user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This password reset link has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return AuthResponse.builder()
                .message("Password reset successfully. You can now log in.")
                .build();
    }

    public AuthResponse googleLogin(String idTokenString) {
        GoogleIdToken.Payload payload = verifyGoogleIdToken(idTokenString);

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.setGoogleId(googleId);
                            existing.setEmailVerified(true);
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> {
                            User newUser = User.builder()
                                    .name(name != null ? name : email.split("@")[0])
                                    .email(email)
                                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                                    .googleId(googleId)
                                    .emailVerified(true)
                                    .referralCode(generateReferralCode(name != null ? name : email))
                                    .build();
                            return userRepository.save(newUser);
                        }));

        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, jwt);
    }

    public AuthResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return buildAuthResponse(user, token);
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier.Builder builder = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance());

            if (!googleClientId.isBlank()) {
                builder.setAudience(Collections.singletonList(googleClientId));
            }

            GoogleIdToken idToken = builder.build().verify(idTokenString);

            if (idToken == null) {
                throw new BadRequestException("Invalid Google token");
            }

            GoogleIdToken.Payload pl = idToken.getPayload();
            if (!Boolean.TRUE.equals(pl.getEmailVerified())) {
                throw new BadRequestException("Google account email is not verified");
            }

            return pl;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify Google token: " + e.getMessage());
        }
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole().name())
                        .loyaltyPoints(user.getLoyaltyPoints())
                        .referralCode(user.getReferralCode())
                        .build())
                .build();
    }

    private String generateReferralCode(String name) {
        return name.substring(0, Math.min(3, name.length())).toUpperCase()
                + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}
