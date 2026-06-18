package com.karunfruits.controller;

import com.karunfruits.dto.response.AnalyticsResponse;
import com.karunfruits.entity.*;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    private final BannerRepository bannerRepository;

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

    // ─── Analytics ─────────────────────────────────────────────
    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(defaultValue = "30d") String period) {
        int days = switch (period) {
            case "7d" -> 7;
            case "90d" -> 90;
            default -> 30;
        };
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        List<AnalyticsResponse.DailyStat> dailyRevenue = orderRepository.getDailyRevenue(startDate)
                .stream()
                .map(row -> new AnalyticsResponse.DailyStat(
                        row[0].toString(),
                        new BigDecimal(row[1].toString()),
                        ((Number) row[2]).longValue()))
                .toList();

        List<AnalyticsResponse.TopProduct> topProducts = orderRepository.getTopProducts(startDate)
                .stream()
                .map(row -> new AnalyticsResponse.TopProduct(
                        row[0].toString(),
                        ((Number) row[1]).longValue(),
                        new BigDecimal(row[2].toString())))
                .toList();

        Map<String, Long> ordersByStatus = orderRepository.countByStatusGrouped()
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Order.OrderStatus) row[0]).name(),
                        row -> ((Number) row[1]).longValue()));

        Map<String, BigDecimal> revenueByPaymentMethod = orderRepository.revenueByPaymentMethod()
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Order.PaymentMethod) row[0]).name(),
                        row -> new BigDecimal(row[1].toString())));

        BigDecimal totalRevenue = dailyRevenue.stream()
                .map(AnalyticsResponse.DailyStat::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = dailyRevenue.stream()
                .mapToLong(AnalyticsResponse.DailyStat::getOrders)
                .sum();

        return ResponseEntity.ok(AnalyticsResponse.builder()
                .dailyRevenue(dailyRevenue)
                .topProducts(topProducts)
                .ordersByStatus(ordersByStatus)
                .revenueByPaymentMethod(revenueByPaymentMethod)
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .build());
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
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(userRepository.findAll(pageable));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (body.get("active") != null) user.setActive((Boolean) body.get("active"));
        return ResponseEntity.ok(userRepository.save(user));
    }

    // ─── Categories ─────────────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll(Sort.by("sortOrder").ascending()));
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, Object> body) {
        Category category = new Category();
        category.setName(body.get("name").toString());
        category.setSlug(body.get("name").toString().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        if (body.get("description") != null) category.setDescription(body.get("description").toString());
        if (body.get("imageUrl") != null) category.setImageUrl(body.get("imageUrl").toString());
        if (body.get("sortOrder") != null) category.setSortOrder(Integer.parseInt(body.get("sortOrder").toString()));
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (body.get("name") != null) {
            category.setName(body.get("name").toString());
            category.setSlug(body.get("name").toString().toLowerCase().replaceAll("[^a-z0-9]+", "-"));
        }
        if (body.get("description") != null) category.setDescription(body.get("description").toString());
        if (body.get("imageUrl") != null) category.setImageUrl(body.get("imageUrl").toString());
        if (body.get("sortOrder") != null) category.setSortOrder(Integer.parseInt(body.get("sortOrder").toString()));
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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

    @PutMapping("/coupons/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @RequestBody Coupon body) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setCode(body.getCode());
        coupon.setDiscountType(body.getDiscountType());
        coupon.setDiscountValue(body.getDiscountValue());
        coupon.setMinOrderAmount(body.getMinOrderAmount());
        coupon.setMaxDiscount(body.getMaxDiscount());
        coupon.setUsageLimit(body.getUsageLimit());
        coupon.setExpiresAt(body.getExpiresAt());
        coupon.setActive(body.isActive());
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Banners ──────────────────────────────────────────────
    @GetMapping("/banners")
    public ResponseEntity<List<Banner>> getBanners() {
        return ResponseEntity.ok(bannerRepository.findAllByOrderBySortOrderAsc());
    }

    @PostMapping("/banners")
    public ResponseEntity<Banner> createBanner(@RequestBody Map<String, Object> body) {
        Banner banner = Banner.builder()
                .title(body.get("title").toString())
                .subtitle(body.get("subtitle") != null ? body.get("subtitle").toString() : null)
                .imageUrl(body.get("imageUrl").toString())
                .link(body.get("link") != null ? body.get("link").toString() : null)
                .sortOrder(body.get("sortOrder") != null ? Integer.parseInt(body.get("sortOrder").toString()) : 0)
                .build();
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));
        if (body.get("title") != null) banner.setTitle(body.get("title").toString());
        if (body.get("subtitle") != null) banner.setSubtitle(body.get("subtitle").toString());
        if (body.get("imageUrl") != null) banner.setImageUrl(body.get("imageUrl").toString());
        if (body.get("link") != null) banner.setLink(body.get("link").toString());
        if (body.get("sortOrder") != null) banner.setSortOrder(Integer.parseInt(body.get("sortOrder").toString()));
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PatchMapping("/banners/{id}/toggle")
    public ResponseEntity<Banner> toggleBanner(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner not found"));
        banner.setActive(!banner.isActive());
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String toSlug(String text) {
        return text.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "")
                + "-" + System.currentTimeMillis() % 10000;
    }
}
