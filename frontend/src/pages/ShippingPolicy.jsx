import { motion } from "framer-motion";
import { Truck, Clock, MapPin, Package, AlertCircle, RefreshCw } from "lucide-react";
import SEO from "@/components/common/SEO";

const HIGHLIGHTS = [
  { icon: Truck, label: "Free Shipping", value: "On orders above ₹499" },
  { icon: Clock, label: "Standard Delivery", value: "4–7 business days" },
  { icon: MapPin, label: "Coverage", value: "Pan India" },
  { icon: Package, label: "Secure Packaging", value: "Vacuum sealed packs" },
];

const SECTIONS = [
  {
    title: "Shipping Charges",
    content: `• Free shipping on all orders above ₹499
• Flat ₹50 shipping charge on orders below ₹499
• Express delivery charges vary by location and are shown at checkout
• Heavy or bulky orders (above 5 kg) may incur additional charges`,
  },
  {
    title: "Delivery Timelines",
    content: `• Standard delivery: 4–7 business days from order confirmation
• Express delivery: 2–3 business days (available in select cities)
• Metro cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata): 2–4 days
• Tier 2 cities: 4–6 days
• Remote areas: 6–10 days
Note: Business days exclude Sundays and public holidays.`,
  },
  {
    title: "Order Processing",
    content: `• Orders placed before 2 PM IST on business days are processed the same day
• Orders placed after 2 PM or on weekends/holidays are processed the next business day
• You will receive an order confirmation email and SMS immediately after successful payment
• Shipping confirmation with tracking details is sent once your order is dispatched`,
  },
  {
    title: "Tracking Your Order",
    content: `Once your order is dispatched, you will receive:
• SMS notification with tracking link
• Email with AWB (Airway Bill) number
• You can track your order on the Track Order page on our website
• Alternatively, track directly on the courier partner's website using the AWB number`,
  },
  {
    title: "Delivery Attempts",
    content: `• Our courier partners attempt delivery up to 3 times
• If no one is available to receive the package, a delivery notice will be left
• After 3 failed attempts, the package is returned to our warehouse
• Return shipping charges may apply for re-delivery
• Please ensure someone is available at the delivery address or provide alternative contact information`,
  },
  {
    title: "Damaged or Missing Packages",
    content: `If your package arrives damaged:
• Take photos/video of the damaged packaging and products before opening
• Contact us within 48 hours at karunfruits@gmail.com with photos and your order number
• We will arrange a replacement or refund as per our Return Policy
• We are not responsible for damages caused by the customer after delivery`,
  },
  {
    title: "International Shipping",
    content: `Currently, we only ship within India. International shipping is not available at this time. We are working on expanding our delivery coverage and will update this policy when international shipping becomes available.`,
  },
];

export default function ShippingPolicy() {
  return (
    <>
      <SEO
        title="Shipping Policy"
        description="Learn about Karun Fruits' shipping charges, delivery timelines, order tracking, and return policies for pan-India delivery."
        keywords="karun fruits shipping, delivery policy, free shipping dry fruits"
      />
      <div className="bg-[#0D1A10] min-h-screen">
        {/* Header */}
        <section className="py-14 px-5 text-center border-b border-[#2A3A2C] bg-gradient-to-b from-[#1E4620]/20 to-transparent">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#C17A35] text-sm tracking-[0.3em] uppercase font-light mb-3">Delivery Information</p>
            <h1 className="font-heading text-5xl text-[#F5F0E8] font-light mb-3">Shipping Policy</h1>
            <p className="text-[#9AAA9C] font-light">Last updated: June 2025</p>
          </motion.div>
        </section>

        {/* Highlights */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {HIGHLIGHTS.map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-5 text-center"
              >
                <Icon className="w-6 h-6 text-[#C17A35] mx-auto mb-3" />
                <p className="text-[#F5F0E8] text-sm font-light mb-0.5">{value}</p>
                <p className="text-[#9AAA9C] text-xs font-light">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Info note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 bg-[#C17A35]/10 border border-[#C17A35]/20 rounded-xl p-4 mb-10"
          >
            <AlertCircle className="w-4 h-4 text-[#C17A35] mt-0.5 shrink-0" />
            <p className="text-sm text-[#9AAA9C] font-light">
              All our products are packed in vacuum-sealed pouches to maintain freshness during transit.
              If you notice any tampering with the packaging upon delivery, please refuse the package or contact us immediately.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="max-w-3xl mx-auto space-y-8">
            {SECTIONS.map(({ title, content }, i) => (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
              >
                <h2 className="font-heading text-[#F5F0E8] text-xl font-light mb-3 flex items-center gap-3">
                  <span className="text-[#C17A35] font-heading text-lg">{i + 1}.</span>
                  {title}
                </h2>
                <div className="text-[#9AAA9C] text-sm font-light leading-relaxed whitespace-pre-line pl-6 border-l border-[#2A3A2C]">
                  {content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Returns CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-10 bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 flex items-start gap-4"
          >
            <RefreshCw className="w-5 h-5 text-[#C17A35] mt-0.5 shrink-0" />
            <div>
              <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-1">Easy Returns</h3>
              <p className="text-[#9AAA9C] text-sm font-light">
                Not satisfied? We offer hassle-free returns within 7 days for damaged or incorrect items.
                See our{" "}
                <a href="/terms" className="text-[#C17A35] hover:underline">Terms & Conditions</a>{" "}
                for details, or contact us at{" "}
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
