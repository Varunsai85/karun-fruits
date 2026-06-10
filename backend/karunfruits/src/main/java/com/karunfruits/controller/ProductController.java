package com.karunfruits.controller;

import com.karunfruits.entity.Product;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<Page<Product>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = switch (sort) {
            case "price-asc" -> "price";
            case "price-desc" -> "price";
            case "newest" -> "createdAt";
            case "rating" -> "rating";
            default -> "createdAt";
        };
        if (sort.equals("price-asc")) dir = Sort.Direction.ASC;
        if (sort.equals("price-desc")) dir = Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortField));

        Page<Product> products;
        if (search != null && !search.isBlank()) {
            products = productRepository.search(search, pageable);
        } else if (category != null && !category.isBlank()) {
            products = productRepository.findByCategory(category, pageable);
        } else {
            products = productRepository.findByActiveTrue(pageable);
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productRepository.findById(id)
                .filter(Product::isActive)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Product> getBySlug(@PathVariable String slug) {
        return productRepository.findBySlug(slug)
                .filter(Product::isActive)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeatured() {
        return ResponseEntity.ok(productRepository.findByActiveTrueAndFeaturedTrue());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Product>> getTrending() {
        return ResponseEntity.ok(productRepository.findByActiveTrueAndBestsellerTrue());
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<Product>> getNewArrivals() {
        return ResponseEntity.ok(productRepository.findNewArrivals(PageRequest.of(0, 8)));
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        List<Product> related = productRepository.findRelated(
                product.getCategory().getId(), id, PageRequest.of(0, 6));
        return ResponseEntity.ok(related);
    }
}
