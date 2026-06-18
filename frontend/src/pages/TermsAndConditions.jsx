import { motion } from "framer-motion";
import SEO from "@/components/common/SEO";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: `By accessing and using karunfruits.com, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website or services.`,
  },
  {
    title: "Products and Pricing",
    content: `• All prices are listed in Indian Rupees (INR) inclusive of applicable taxes
• Prices are subject to change without notice
• We reserve the right to modify or discontinue products at any time
• Product images are for illustrative purposes; actual products may vary slightly in appearance
• All products are subject to availability`,
  },
  {
    title: "Orders and Payment",
    content: `• Orders are confirmed only after successful payment verification
• We accept UPI, credit/debit cards, net banking (via Razorpay), and Cash on Delivery (COD)
• COD orders are subject to availability and may require a minimum order value
• We reserve the right to cancel orders if payment verification fails or stock is unavailable
• In case of order cancellation, refunds are processed within 5–7 business days`,
  },
  {
    title: "Shipping and Delivery",
    content: `• We offer pan-India delivery through our logistics partners
• Standard delivery: 4–7 business days; Express delivery: 2–3 business days (where available)
• Free shipping on orders above ₹499; ₹50 shipping charge below that
• Delivery times are estimates and may vary due to unforeseen circumstances
• We are not liable for delays caused by courier partners or natural calamities`,
  },
  {
    title: "Returns and Refunds",
    content: `• Products can be returned within 7 days of delivery if found damaged, defective, or incorrect
• Perishable items cannot be returned once opened
• To initiate a return, contact us within 7 days at karunfruits@gmail.com with your order number and photos
• Refunds are processed to the original payment method within 5–7 business days
• Shipping charges are non-refundable unless the return is due to our error`,
  },
  {
    title: "User Accounts",
    content: `• You are responsible for maintaining the confidentiality of your account credentials
• You must provide accurate and complete information during registration
• We reserve the right to suspend or terminate accounts that violate these terms
• You may not use another user's account without their explicit permission`,
  },
  {
    title: "Coupons and Promotions",
    content: `• Coupons are valid for a limited time and subject to specific conditions
• Only one coupon can be applied per order
• Coupons cannot be combined with other offers unless explicitly stated
• We reserve the right to cancel orders where coupons have been used fraudulently
• Loyalty points are non-transferable and cannot be converted to cash`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website, including text, images, logos, and graphics, is the property of Karun Fruits and is protected by copyright laws. Unauthorized reproduction or distribution of any content is strictly prohibited.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, Karun Fruits shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid for the specific order in question.`,
  },
  {
    title: "Governing Law",
    content: `These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.`,
  },
];

export default function TermsAndConditions() {
  return (
    <>
      <SEO
        title="Terms & Conditions"
        description="Read the terms and conditions governing your use of Karun Fruits website and services."
      />
      <div className="bg-[#0D1A10] min-h-screen">
        <section className="py-14 px-5 text-center border-b border-[#2A3A2C] bg-gradient-to-b from-[#1E4620]/20 to-transparent">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-5xl text-[#F5F0E8] font-light mb-3">Terms & Conditions</h1>
            <p className="text-[#9AAA9C] font-light">Last updated: June 2025</p>
          </motion.div>
        </section>

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-[#162018] border border-[#C17A35]/20 rounded-xl p-5 mb-10 text-[#9AAA9C] text-sm font-light leading-relaxed">
              Please read these Terms and Conditions carefully before using the Karun Fruits website. These terms constitute a legally binding agreement between you and{" "}
              <strong className="text-[#F5F0E8]">Karun Fruits</strong>.
            </div>

            <div className="space-y-8">
              {SECTIONS.map(({ title, content }, i) => (
                <section key={i}>
                  <h2 className="font-heading text-[#F5F0E8] text-xl font-light mb-3 flex items-center gap-3">
                    <span className="text-[#C17A35] font-heading text-lg">{i + 1}.</span>
                    {title}
                  </h2>
                  <div className="text-[#9AAA9C] text-sm font-light leading-relaxed whitespace-pre-line pl-6 border-l border-[#2A3A2C]">
                    {content}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 bg-[#162018] border border-[#2A3A2C] rounded-xl p-6">
              <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-2">Questions?</h3>
              <p className="text-[#9AAA9C] text-sm font-light">
                For questions about these terms, contact us at{" "}
                <a href="mailto:karunfruits@gmail.com" className="text-[#C17A35] hover:underline">
                  karunfruits@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
