package com.karunfruits.repository;

import com.karunfruits.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    java.util.Optional<User> findByReferralCode(String referralCode);
    long countByReferredBy(String referredBy);
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    Optional<User> findByGoogleId(String googleId);
}
