package com.karunfruits.controller;

import com.karunfruits.entity.*;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    // ─── Stats ───────────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.ORDER_PLACED);
        long totalCustomers = userRepository.count();
        long lowStockProducts = productRepository.findByActiveTrue(PageRequest.of(0, Integer.MAX_VALUE))
                .stream().filter(p -> p.getStock() < 10).count();

        return ResponseEntity.ok(Map.of(
                "totalOrders", totalOrders,
                "pendingOrders", pendingOrders,
                "totalCustomers", totalCustomers,
                "lowStockProducts", lowStockProducts,
                "todaySales", 0,
                "totalRevenue", 0
        ));
    }

    @GetMapping("/orders/recent")
    public ResponseEntity<?> getRecentOrders() {
        return ResponseEntity.ok(
                orderRepository.findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent()
        );
    }

    // ─── Products ─────────────────────────────────────────────
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(
                search != null && !search.isBlank()
                        ? productRepository.search(search, pageable)
                        : productRepository.findAll(pageable)
        );
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Map<String, Object> body) {
        Long categoryId = body.get("categoryId") != null ? Long.valueOf(body.get("categoryId").toString()) : null;
        Category category = categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;

        String name = body.get("name").toString();
        Product product = Product.builder()
                .name(name)
                .slug(toSlug(name))
                .category(category)
                .price(new BigDecimal(body.get("price").toString()))
                .salePrice(body.get("salePrice") != null && !body.get("salePrice").toString().isBlank()
                        ? new BigDecimal(body.get("salePrice").toString()) : null)
                .stock(body.get("stock") != null ? Integer.parseInt(body.get("stock").toString()) : 0)
                .weight(body.get("weight") != null && !body.get("weight").toString().isBlank()
                        ? Integer.parseInt(body.get("weight").toString()) : null)
                .unit(body.getOrDefault("unit", "g").toString())
                .description(body.getOrDefault("description", "").toString())
                .sku(body.getOrDefault("sku", "").toString())
                .build();
        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (body.get("name") != null) product.setName(body.get("name").toString());
        if (body.get("price") != null) product.setPrice(new BigDecimal(body.get("price").toString()));
        if (body.get("salePrice") != null && !body.get("salePrice").toString().isBlank())
            product.setSalePrice(new BigDecimal(body.get("salePrice").toString()));
        if (body.get("stock") != null) product.setStock(Integer.parseInt(body.get("stock").toString()));
        if (body.get("description") != null) product.setDescription(body.get("description").toString());

        return ResponseEntity.ok(productRepository.save(product));
    }

    @PatchMapping("/products/{id}/toggle")
    public ResponseEntity<Product> toggleProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setActive(!product.isActive());
        return ResponseEntity.ok(productRepository.save(product));
    }

    // ─── Orders ───────────────────────────────────────────────
    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(orderRepository.findByStatus(Order.OrderStatus.valueOf(status), pageable));
        }
        return ResponseEntity.ok(orderRepository.findAll(pageable));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(body.get("status")));
        if (body.get("trackingNumber") != null && !body.get("trackingNumber").isBlank()) {
            order.setTrackingNumber(body.get("trackingNumber"));
        }
        return ResponseEntity.ok(orderRepository.save(order));
    }

    // ─── Customers ─────────────────────────────────────────────
    @GetMapping("/customers")
    public ResponseEntity<Page<User>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    // ─── Categories ─────────────────────────────────────────────
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category body) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(body.getName());
        category.setDescription(body.getDescription());
        category.setImageUrl(body.getImageUrl());
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    // ─── Coupons ──────────────────────────────────────────────
    @GetMapping("/coupons")
    public ResponseEntity<?> getCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── User profile update ─────────────────────────────────
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (body.get("active") != null) user.setActive((Boolean) body.get("active"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    private String toSlug(String text) {
        return text.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "")
                + "-" + System.currentTimeMillis() % 10000;
    }
}
