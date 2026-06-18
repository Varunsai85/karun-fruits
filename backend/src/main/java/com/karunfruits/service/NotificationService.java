package com.karunfruits.service;

import com.karunfruits.entity.Order;
import com.karunfruits.entity.OrderItem;
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
    public void sendVerificationEmail(String email, String name, String verificationUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(email);
            helper.setSubject("Verify Your Email | Karun Fruits");
            helper.setText(buildVerificationEmailHtml(name, verificationUrl), true);
            mailSender.send(message);
            log.info("Verification email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email: {}", e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String email, String name, String resetUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(email);
            helper.setSubject("Reset Your Password | Karun Fruits");
            helper.setText(buildPasswordResetEmailHtml(name, resetUrl), true);
            mailSender.send(message);
            log.info("Password reset email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
        }
    }

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

    private String buildVerificationEmailHtml(String name, String verificationUrl) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #C8860A, #8B4513); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Karun Fruits</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Premium Dry Fruits</p>
              </div>
              <div style="background: #FDF8F0; padding: 30px;">
                <h2 style="color: #3D2000;">Hello, %s!</h2>
                <p style="color: #8B6914;">Thank you for creating an account with Karun Fruits. Please verify your email address to get started.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="%s" style="background: #C8860A; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                    Verify Email Address
                  </a>
                </div>
                <p style="color: #8B6914; font-size: 13px;">This link expires in 24 hours. If you did not create an account, please ignore this email.</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">If the button doesn't work, copy and paste this URL:<br/>
                  <a href="%s" style="color: #C8860A; word-break: break-all;">%s</a>
                </p>
              </div>
              <div style="background: #3D2000; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="color: #C8A060; margin: 0; font-size: 12px;">© 2024 Karun Fruits | Mumbai, Maharashtra</p>
              </div>
            </div>
            """.formatted(name, verificationUrl, verificationUrl, verificationUrl);
    }

    private String buildPasswordResetEmailHtml(String name, String resetUrl) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #C8860A, #8B4513); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Karun Fruits</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Premium Dry Fruits</p>
              </div>
              <div style="background: #FDF8F0; padding: 30px;">
                <h2 style="color: #3D2000;">Password Reset Request</h2>
                <p style="color: #8B6914;">Hi %s, we received a request to reset your password. Click the button below to set a new password.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="%s" style="background: #C8860A; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #8B6914; font-size: 13px;">This link expires in 1 hour. If you did not request a password reset, please ignore this email — your password will remain unchanged.</p>
                <p style="color: #999; font-size: 12px; margin-top: 20px;">If the button doesn't work, copy and paste this URL:<br/>
                  <a href="%s" style="color: #C8860A; word-break: break-all;">%s</a>
                </p>
              </div>
              <div style="background: #3D2000; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                <p style="color: #C8A060; margin: 0; font-size: 12px;">© 2024 Karun Fruits | Mumbai, Maharashtra</p>
              </div>
            </div>
            """.formatted(name, resetUrl, resetUrl, resetUrl);
    }

    private String buildOrderEmailHtml(Order order) {
        StringBuilder itemRows = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                double lineTotal = item.getPrice().multiply(
                        java.math.BigDecimal.valueOf(item.getQuantity())).doubleValue();
                itemRows.append("""
                    <tr>
                      <td style="padding:10px 8px;border-bottom:1px solid #E8D5B5;color:#3D2000;">%s</td>
                      <td style="padding:10px 8px;border-bottom:1px solid #E8D5B5;text-align:center;color:#8B6914;">×%d</td>
                      <td style="padding:10px 8px;border-bottom:1px solid #E8D5B5;text-align:right;color:#3D2000;">₹%.0f</td>
                    </tr>
                    """.formatted(item.getProductName(), item.getQuantity(), lineTotal));
            }
        }

        String discountRow = order.getDiscount() != null && order.getDiscount().doubleValue() > 0
                ? "<tr><td colspan='2' style='padding:6px 8px;color:#8B6914;font-size:13px;'>Discount (%s)</td><td style='padding:6px 8px;text-align:right;color:#27884A;font-size:13px;'>−₹%.0f</td></tr>"
                  .formatted(order.getCouponCode() != null ? order.getCouponCode() : "applied", order.getDiscount().doubleValue())
                : "";

        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#C8860A,#8B4513);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
                <h1 style="color:white;margin:0;font-size:28px;letter-spacing:2px;">KARUN FRUITS</h1>
                <p style="color:rgba(255,255,255,0.8);margin:5px 0 0;font-size:13px;">Premium Dry Fruits · Mumbai</p>
              </div>
              <div style="background:#FDF8F0;padding:30px;">
                <h2 style="color:#3D2000;margin-top:0;">Order Confirmed! 🎉</h2>
                <p style="color:#8B6914;margin-bottom:20px;">Thank you for your order. We've received it and will dispatch it soon.</p>

                <div style="background:white;border-radius:10px;padding:16px 20px;margin-bottom:20px;border:1px solid #E8D5B5;">
                  <p style="margin:0 0 4px;font-size:13px;color:#8B6914;">Order Number</p>
                  <p style="margin:0;font-size:18px;font-weight:bold;color:#C8860A;">%s</p>
                </div>

                <table style="width:100%%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;border:1px solid #E8D5B5;">
                  <thead>
                    <tr style="background:#FDF0DC;">
                      <th style="padding:10px 8px;text-align:left;color:#3D2000;font-size:13px;">Item</th>
                      <th style="padding:10px 8px;text-align:center;color:#3D2000;font-size:13px;">Qty</th>
                      <th style="padding:10px 8px;text-align:right;color:#3D2000;font-size:13px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    %s
                    <tr><td colspan='3' style='padding:4px;'></td></tr>
                    <tr><td colspan='2' style='padding:6px 8px;color:#8B6914;font-size:13px;'>Subtotal</td><td style='padding:6px 8px;text-align:right;font-size:13px;color:#3D2000;'>₹%.0f</td></tr>
                    <tr><td colspan='2' style='padding:6px 8px;color:#8B6914;font-size:13px;'>Shipping</td><td style='padding:6px 8px;text-align:right;font-size:13px;color:#3D2000;'>%s</td></tr>
                    %s
                    <tr style="background:#FDF0DC;">
                      <td colspan='2' style='padding:10px 8px;font-weight:bold;color:#3D2000;'>Total</td>
                      <td style='padding:10px 8px;text-align:right;font-weight:bold;font-size:16px;color:#C8860A;'>₹%.0f</td>
                    </tr>
                  </tbody>
                </table>

                <div style="margin-top:20px;padding:16px;background:white;border-radius:10px;border:1px solid #E8D5B5;font-size:13px;color:#8B6914;">
                  <p style="margin:0 0 4px;"><strong style="color:#3D2000;">Payment:</strong> %s</p>
                  <p style="margin:0;"><strong style="color:#3D2000;">Deliver to:</strong> %s, %s, %s – %s</p>
                </div>

                <p style="margin-top:20px;color:#8B6914;font-size:13px;">
                  Track your order at
                  <a href="https://karunfruits.com/track-order" style="color:#C8860A;">karunfruits.com/track-order</a>
                </p>
              </div>
              <div style="background:#3D2000;padding:20px;text-align:center;border-radius:0 0 12px 12px;">
                <p style="color:#C8A060;margin:0;font-size:12px;">© 2024 Karun Fruits | Shop No.46, Masjid Bandar, Mumbai 400009</p>
              </div>
            </div>
            """.formatted(
                order.getOrderNumber(),
                itemRows.toString(),
                order.getSubtotal().doubleValue(),
                order.getShippingCharge() != null && order.getShippingCharge().doubleValue() == 0 ? "FREE" : "₹" + (order.getShippingCharge() != null ? order.getShippingCharge().intValue() : 50),
                discountRow,
                order.getTotal().doubleValue(),
                order.getPaymentMethod(),
                order.getAddressName(), order.getAddressCity(), order.getAddressState(), order.getAddressPincode());
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
