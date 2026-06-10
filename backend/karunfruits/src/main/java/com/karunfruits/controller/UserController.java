package com.karunfruits.controller;

import com.karunfruits.entity.User;
import com.karunfruits.exception.ResourceNotFoundException;
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

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (body.get("name") != null) user.setName(body.get("name"));
        if (body.get("phone") != null) user.setPhone(body.get("phone"));
        return ResponseEntity.ok(userRepository.save(user));
    }
}
