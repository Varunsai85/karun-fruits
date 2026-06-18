package com.karunfruits.controller;

import com.karunfruits.entity.User;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.OrderRepository;
import com.karunfruits.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User user = getUser(userDetails);
        if (body.get("name") != null) user.setName(body.get("name"));
        if (body.get("phone") != null) user.setPhone(body.get("phone"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/loyalty")
    public ResponseEntity<Map<String, Object>> getLoyaltyInfo(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        long totalOrders = orderRepository.countByUserId(user.getId());
        return ResponseEntity.ok(Map.of(
                "points", user.getLoyaltyPoints(),
                "totalOrders", totalOrders,
                "equivalentValue", user.getLoyaltyPoints() / 10
        ));
    }

    @GetMapping("/referral")
    public ResponseEntity<Map<String, Object>> getReferralInfo(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        String code = user.getReferralCode() != null ? user.getReferralCode() : "";
        long referrals = code.isBlank() ? 0 : userRepository.countByReferredBy(code);
        return ResponseEntity.ok(Map.of(
                "referralCode", code,
                "referralCount", referrals,
                "pointsEarned", referrals * 50
        ));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
