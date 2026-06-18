package com.karunfruits.controller;

import com.karunfruits.entity.Product;
import com.karunfruits.entity.Review;
import com.karunfruits.entity.User;
import com.karunfruits.exception.BadRequestException;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.ProductRepository;
import com.karunfruits.repository.ReviewRepository;
import com.karunfruits.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping("/{productId}/reviews")
    public ResponseEntity<Page<Review>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(reviewRepository.findByProductIdAndApprovedTrue(productId, pageable));
    }

    @PostMapping("/{productId}/reviews")
    public ResponseEntity<Review> addReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        int rating = Integer.parseInt(body.get("rating").toString());
        if (rating < 1 || rating > 5) throw new BadRequestException("Rating must be between 1 and 5");

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(body.get("comment") != null ? body.get("comment").toString() : null)
                .build();

        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @DeleteMapping("/{productId}/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not authorized to delete this review");
        }
        reviewRepository.delete(review);
        return ResponseEntity.noContent().build();
    }
}
