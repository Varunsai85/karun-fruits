package com.karunfruits.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AnalyticsResponse {

    private List<DailyStat> dailyRevenue;
    private List<TopProduct> topProducts;
    private Map<String, Long> ordersByStatus;
    private Map<String, BigDecimal> revenueByPaymentMethod;
    private BigDecimal totalRevenue;
    private long totalOrders;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class DailyStat {
        private String date;
        private BigDecimal revenue;
        private long orders;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class TopProduct {
        private String name;
        private long quantity;
        private BigDecimal revenue;
    }
}
