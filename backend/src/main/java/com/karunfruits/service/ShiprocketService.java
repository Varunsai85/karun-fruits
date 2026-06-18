package com.karunfruits.service;

import com.karunfruits.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ShiprocketService {

    private static final String BASE_URL = "https://apiv2.shiprocket.in/v1/external";

    @Value("${shiprocket.email:}")
    private String email;

    @Value("${shiprocket.password:}")
    private String password;

    private String cachedToken;
    private LocalDateTime tokenExpiry;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getToken() {
        if (cachedToken != null && tokenExpiry != null && LocalDateTime.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }
        try {
            Map<String, String> body = Map.of("email", email, "password", password);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    BASE_URL + "/auth/login", body, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                cachedToken = (String) response.getBody().get("token");
                tokenExpiry = LocalDateTime.now().plusHours(23);
                return cachedToken;
            }
        } catch (Exception e) {
            log.error("Failed to fetch Shiprocket token: {}", e.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> createShipment(Order order) {
        String token = getToken();
        if (token == null) {
            log.warn("Shiprocket token unavailable — skipping shipment creation for order {}", order.getOrderNumber());
            return Map.of("error", "Shiprocket unavailable");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("order_id", order.getOrderNumber());
        body.put("order_date", order.getCreatedAt().toString().substring(0, 10));
        body.put("pickup_location", "Primary");
        body.put("channel_id", "");
        body.put("billing_customer_name", order.getAddressName());
        body.put("billing_last_name", "");
        body.put("billing_address", order.getAddressLine1());
        body.put("billing_address_2", order.getAddressLine2() != null ? order.getAddressLine2() : "");
        body.put("billing_city", order.getAddressCity());
        body.put("billing_pincode", order.getAddressPincode());
        body.put("billing_state", order.getAddressState());
        body.put("billing_country", "India");
        body.put("billing_email", order.getUser().getEmail());
        body.put("billing_phone", order.getAddressPhone());
        body.put("shipping_is_billing", true);
        body.put("payment_method", order.getPaymentMethod() == Order.PaymentMethod.COD ? "COD" : "Prepaid");
        body.put("sub_total", order.getTotal().doubleValue());
        body.put("length", 15);
        body.put("breadth", 10);
        body.put("height", 10);
        body.put("weight", 0.5);

        List<Map<String, Object>> orderItems = order.getItems().stream()
                .map(item -> {
                    Map<String, Object> i = new HashMap<>();
                    i.put("name", item.getProductName());
                    i.put("sku", "KF-" + item.getProduct().getId());
                    i.put("units", item.getQuantity());
                    i.put("selling_price", item.getPrice().doubleValue());
                    return i;
                }).toList();
        body.put("order_items", orderItems);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    BASE_URL + "/orders/create/adhoc",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class);
            return response.getBody() != null ? response.getBody() : Map.of();
        } catch (Exception e) {
            log.error("Failed to create Shiprocket shipment: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> trackShipment(String awbCode) {
        String token = getToken();
        if (token == null) return Map.of("error", "Shiprocket unavailable");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    BASE_URL + "/courier/track/awb/" + awbCode,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class);
            return response.getBody() != null ? response.getBody() : Map.of();
        } catch (Exception e) {
            log.error("Failed to track shipment {}: {}", awbCode, e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }
}
