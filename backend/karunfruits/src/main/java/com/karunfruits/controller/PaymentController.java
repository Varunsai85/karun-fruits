package com.karunfruits.controller;

import com.karunfruits.exception.BadRequestException;
import com.karunfruits.service.OrderService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(
            @RequestBody Map<String, Object> req) {
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            BigDecimal amount = new BigDecimal(req.get("amount").toString());
            int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();

            JSONObject orderOptions = new JSONObject();
            orderOptions.put("amount", amountInPaise);
            orderOptions.put("currency", "INR");
            orderOptions.put("receipt", "kf_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = client.orders.create(orderOptions);

            return ResponseEntity.ok(Map.of(
                    "id", razorpayOrder.get("id"),
                    "amount", amountInPaise,
                    "currency", "INR",
                    "key", razorpayKeyId
            ));
        } catch (RazorpayException e) {
            throw new BadRequestException("Payment initialization failed: " + e.getMessage());
        }
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @RequestBody Map<String, String> req) {
        String orderId = req.get("razorpay_order_id");
        String paymentId = req.get("razorpay_payment_id");
        String signature = req.get("razorpay_signature");

        try {
            String generated = hmacSha256(orderId + "|" + paymentId, razorpayKeySecret);
            if (!generated.equals(signature)) {
                throw new BadRequestException("Payment verification failed");
            }
            orderService.updatePaymentStatus(orderId, paymentId);
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            throw new BadRequestException("Payment verification failed");
        }
    }

    private String hmacSha256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(data.getBytes()));
    }
}
