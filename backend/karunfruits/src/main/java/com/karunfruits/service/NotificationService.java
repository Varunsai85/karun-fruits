package com.karunfruits.service;

import com.karunfruits.entity.Order;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Async
    public void sendOrderConfirmationEmail(Order order, String recipientEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(recipientEmail);
            helper.setSubject("Order Confirmed – " + order.getOrderNumber() + " | Karun Fruits");
            helper.setText(buildOrderEmailHtml(order), true);
            mailSender.send(message);
            log.info("Order confirmation email sent for {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email: {}", e.getMessage());
        }
    }

    @Async
    public void sendOrderSms(Order order, String phone) {
        if (twilioAccountSid.isBlank() || twilioAuthToken.isBlank()) return;
        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            String body = String.format(
                "✅ Karun Fruits: Your order %s has been placed! Total: ₹%.0f. Track at karunfruits.com/track-order",
                order.getOrderNumber(), order.getTotal().doubleValue()
            );
            Message.creator(new PhoneNumber("+91" + phone), new PhoneNumber(twilioPhoneNumber), body).create();
            log.info("SMS sent for order {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send SMS: {}", e.getMessage());
        }
    }

    @Async
    public void sendShippingNotification(Order order, String recipientEmail, String phone) {
        sendShippingEmail(order, recipientEmail);
        if (phone != null && !phone.isBlank()) sendShippingSms(order, phone);
    }

    private void sendShippingEmail(Order order, String recipientEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(recipientEmail);
            helper.setSubject("Your Order is Shipped! 🚚 – " + order.getOrderNumber());
            helper.setText(buildShippingEmailHtml(order), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send shipping email: {}", e.getMessage());
        }
    }

    private void sendShippingSms(Order order, String phone) {
        if (twilioAccountSid.isBlank()) return;
        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            String body = String.format(
                "🚚 Karun Fruits: Order %s shipped! Tracking: %s. Delivery in 2-3 days.",
                order.getOrderNumber(), order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A"
            );
            Message.creator(new PhoneNumber("+91" + phone), new PhoneNumber(twilioPhoneNumber), body).create();
        } catch (Exception e) {
            log.error("Failed to send shipping SMS: {}", e.getMessage());
        }
    }

    private String buildOrderEmailHtml(Order order) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #C8860A, #8B4513); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Karun Fruits</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Premium Dry Fruits</p>
              </div>
              <div style="background: #FDF8F0; padding: 30px;">
                <h2 style="color: #3D2000;">Order Confirmed! 🎉</h2>
                <p style="color: #8B6914;">Thank you for your order. We've received it and are preparing it for dispatch.</p>
                <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; border: 1px solid #E8D5B5;">
                  <p><strong>Order Number:</strong> %s</p>
                  <p><strong>Total Amount:</strong> ₹%.0f</p>
                  <p><strong>Payment:</strong> %s</p>
                </div>
                <p style="color: #8B6914;">You can track your order at <a href="https://karunfruits.com/track-order" style="color: #C8860A;">karunfruits.com</a></p>
              </div>
              <div style="background: #3D2000; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="color: #C8A060; margin: 0; font-size: 12px;">© 2024 Karun Fruits | Mumbai, Maharashtra</p>
              </div>
            </div>
            """.formatted(order.getOrderNumber(), order.getTotal().doubleValue(), order.getPaymentMethod());
    }

    private String buildShippingEmailHtml(Order order) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #C8860A, #8B4513); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0;">Karun Fruits</h1>
              </div>
              <div style="background: #FDF8F0; padding: 30px;">
                <h2 style="color: #3D2000;">Your Order is on Its Way! 🚚</h2>
                <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; border: 1px solid #E8D5B5;">
                  <p><strong>Order:</strong> %s</p>
                  <p><strong>Tracking Number:</strong> %s</p>
                  <p><strong>Carrier:</strong> %s</p>
                </div>
                <p style="color: #8B6914;">Expected delivery in 2-4 business days.</p>
              </div>
            </div>
            """.formatted(order.getOrderNumber(),
                order.getTrackingNumber() != null ? order.getTrackingNumber() : "Will be updated soon",
                order.getShippingCarrier() != null ? order.getShippingCarrier() : "Our courier partner");
    }
}
