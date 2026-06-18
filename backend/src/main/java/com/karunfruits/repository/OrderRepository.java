package com.karunfruits.repository;

import com.karunfruits.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    long countByStatus(Order.OrderStatus status);
    long countByUserId(Long userId);

    @Query(value = """
            SELECT TO_CHAR(o.created_at, 'YYYY-MM-DD') AS sale_date,
                   COALESCE(SUM(o.total), 0)            AS revenue,
                   COUNT(*)                             AS order_count
            FROM orders o
            WHERE o.created_at >= :startDate
              AND o.status NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
            ORDER BY sale_date
            """, nativeQuery = true)
    List<Object[]> getDailyRevenue(@Param("startDate") LocalDateTime startDate);

    @Query(value = """
            SELECT oi.product_name,
                   SUM(oi.quantity)              AS total_qty,
                   SUM(oi.price * oi.quantity)   AS total_rev
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= :startDate
              AND o.status NOT IN ('CANCELLED', 'REFUNDED')
            GROUP BY oi.product_name
            ORDER BY total_qty DESC
            LIMIT 10
            """, nativeQuery = true)
    List<Object[]> getTopProducts(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT o.paymentMethod, SUM(o.total) FROM Order o WHERE o.paymentStatus = com.karunfruits.entity.Order.PaymentStatus.PAID GROUP BY o.paymentMethod")
    List<Object[]> revenueByPaymentMethod();
}
