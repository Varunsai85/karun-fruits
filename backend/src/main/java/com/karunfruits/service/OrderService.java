package com.karunfruits.service;

import com.karunfruits.entity.*;
import com.karunfruits.exception.BadRequestException;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public Order createOrder(Long userId, CreateOrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.Item item : req.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.productId()));

            if (product.getStock() < item.quantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }

            BigDecimal price = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(item.quantity())));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .productImage(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl())
                    .quantity(item.quantity())
                    .price(price)
                    .build();
            orderItems.add(orderItem);

            product.setStock(product.getStock() - item.quantity());
            productRepository.save(product);
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (req.couponCode() != null) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(req.couponCode())
                    .orElseThrow(() -> new BadRequestException("Invalid coupon code"));
            discount = calculateDiscount(coupon, subtotal);
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal shippingCharge = subtotal.compareTo(new BigDecimal("499")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("50");

        BigDecimal total = subtotal.subtract(discount).add(shippingCharge);

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .subtotal(subtotal)
                .discount(discount)
                .shippingCharge(shippingCharge)
                .total(total)
                .couponCode(req.couponCode())
                .paymentMethod(Order.PaymentMethod.valueOf(req.paymentMethod()))
                .addressName(req.address().name())
                .addressLine1(req.address().line1())
                .addressLine2(req.address().line2())
                .addressCity(req.address().city())
                .addressState(req.address().state())
                .addressPincode(req.address().pincode())
                .addressPhone(req.address().phone())
                .build();

        Order saved = orderRepository.save(order);
        for (OrderItem item : orderItems) {
            item.setOrder(saved);
        }
        saved.getItems().addAll(orderItems);
        Order finalOrder = orderRepository.save(saved);

        // Award 1 loyalty point per ₹10 spent (rounded down)
        int pointsEarned = total.intValue() / 10;
        if (pointsEarned > 0) {
            user.setLoyaltyPoints(user.getLoyaltyPoints() + pointsEarned);
            userRepository.save(user);
        }

        return finalOrder;
    }

    public Page<Order> getUserOrders(Long userId, int page, int size) {
        return orderRepository.findByUserId(userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    public Order trackOrder(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Transactional
    public Order updatePaymentStatus(String razorpayOrderId, String paymentId) {
        return orderRepository.findAll().stream()
                .filter(o -> razorpayOrderId.equals(o.getRazorpayOrderId()))
                .findFirst()
                .map(order -> {
                    order.setRazorpayPaymentId(paymentId);
                    order.setPaymentStatus(Order.PaymentStatus.PAID);
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount for this coupon is ₹" + coupon.getMinOrderAmount());
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (coupon.getMaxDiscount() != null) {
                discount = discount.min(coupon.getMaxDiscount());
            }
        } else {
            discount = coupon.getDiscountValue();
        }
        return discount;
    }

    private String generateOrderNumber() {
        return "KF-" + System.currentTimeMillis();
    }

    public record CreateOrderRequest(
            List<Item> items,
            String couponCode,
            String paymentMethod,
            AddressInfo address
    ) {
        public record Item(Long productId, Long variantId, int quantity) {}
        public record AddressInfo(String name, String line1, String line2,
                                  String city, String state, String pincode, String phone) {}
    }
}
