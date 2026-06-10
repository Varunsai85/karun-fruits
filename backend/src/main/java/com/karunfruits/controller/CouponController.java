package com.karunfruits.controller;

import com.karunfruits.entity.Coupon;
import com.karunfruits.exception.BadRequestException;
import com.karunfruits.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;

    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyCoupon(@RequestBody Map<String, Object> req) {
        String code = (String) req.get("code");
        BigDecimal amount = new BigDecimal(req.get("amount").toString());

        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Invalid or expired coupon code"));

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }

        if (coupon.getMinOrderAmount() != null && amount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount ₹" + coupon.getMinOrderAmount() + " required");
        }

        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = amount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (coupon.getMaxDiscount() != null) discount = discount.min(coupon.getMaxDiscount());
        } else {
            discount = coupon.getDiscountValue();
        }

        return ResponseEntity.ok(Map.of(
                "code", code,
                "discount", discount,
                "discountType", coupon.getDiscountType()
        ));
    }
}
