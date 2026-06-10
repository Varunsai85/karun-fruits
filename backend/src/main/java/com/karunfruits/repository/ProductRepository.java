package com.karunfruits.repository;

import com.karunfruits.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByActiveTrue(Pageable pageable);

    List<Product> findByActiveTrueAndFeaturedTrue();

    List<Product> findByActiveTrueAndBestsellerTrue();

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.slug = :slug")
    Page<Product> findByCategory(@Param("slug") String categorySlug, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:minPrice IS NULL OR COALESCE(p.salePrice, p.price) >= :minPrice) AND " +
           "(:maxPrice IS NULL OR COALESCE(p.salePrice, p.price) <= :maxPrice)")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice,
                                    @Param("maxPrice") BigDecimal maxPrice,
                                    Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.isNew = true ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId AND p.id != :productId")
    List<Product> findRelated(@Param("categoryId") Long categoryId, @Param("productId") Long productId, Pageable pageable);
}
