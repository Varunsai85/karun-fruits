import { motion } from "framer-motion";
import { RotateCcw, Clock, ShieldCheck, Banknote, AlertCircle, Mail } from "lucide-react";
import SEO from "@/components/common/SEO";

const HIGHLIGHTS = [
  { icon: Clock, label: "Return Window", value: "7 days from delivery" },
  { icon: ShieldCheck, label: "Eligible For", value: "Damaged or wrong items" },
  { icon: Banknote, label: "Refund Time", value: "5–7 business days" },
  { icon: RotateCcw, label: "Replacement", value: "Free pickup & exchange" },
];

const SECTIONS = [
  {
    title: "Return Eligibility",
    content: `• Returns are accepted within 7 days of delivery
• Item must be damaged, defective, expired, or different from what was ordered
• Unopened items in original packaging are eligible for return
• Due to the perishable nature of dry fruits, we cannot accept returns for opened/consumed products unless they are damaged or defective
• Gift boxes and combo packs must be returned with all included items intact`,
  },
  {
    title: "Non-Returnable Items",
    content: `• Products that have been opened, used, or consumed (unless damaged/defective)
• Items without original packaging or labels
• Products purchased during clearance or final sale, unless damaged
• Customized or personalized gift hampers`,
  },
  {
    title: "How to Request a Return",
    content: `• Go to My Account > Orders and select the item you want to return
• Or contact us at karunfruits@gmail.com with your order number and photos of the issue
• Our team will review your request within 24–48 hours
• Once approved, a pickup will be scheduled, or you may be asked to ship the item back
• Please keep the item securely packed until pickup`,
  },
  {
    title: "Refunds",
    content: `• Refunds are processed once the returned item is received and inspected
• Refunds are credited to the original payment method within 5–7 business days
• For COD orders, refunds are issued via bank transfer or UPI
• Shipping charges are non-refundable unless the return is due to our error
• Loyalty points earned on the returned item will be reversed`,
  },
  {
    title: "Replacements",
    content: `• If you received a damaged, expired, or incorrect item, we offer a free replacement
• Replacement requests must be raised within 48 hours of delivery, with photos
• Replacement orders are shipped at no additional cost
• If the item is out of stock, a full refund will be issued instead`,
  },
  {
    title: "Cancellations",
    content: `• Orders can be cancelled free of charge before they are shipped
• Once an order is shipped, it cannot be cancelled but can be returned after delivery as per this policy
• To cancel, go to My Account > Orders, or contact us as soon as possible`,
  },
];

export default function ReturnPolicy() {
  return (
    <>
      <SEO
        title="Return Policy"
        description="Learn about Karun Fruits' return, replacement, and refund policy for dry fruits orders."
        keywords="karun fruits return policy, refund policy, replacement dry fruits"
      />
      <div className="bg-[#0D1A10] min-h-screen">
        {/* Header */}
        <section className="py-14 px-5 text-center border-b border-[#2A3A2C] bg-gradient-to-b from-[#1E4620]/20 to-transparent">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#C17A35] text-sm tracking-[0.3em] uppercase font-light mb-3">Customer Care</p>
            <h1 className="font-heading text-5xl text-[#F5F0E8] font-light mb-3">Return Policy</h1>
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
              Since our products are perishable food items, please inspect your order immediately upon delivery.
              Report any damage, defect, or mismatch within 48 hours for the fastest resolution.
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

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-10 bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 flex items-start gap-4"
          >
            <Mail className="w-5 h-5 text-[#C17A35] mt-0.5 shrink-0" />
            <div>
              <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-1">Need Help?</h3>
              <p className="text-[#9AAA9C] text-sm font-light">
                Our support team is here to help with returns, replacements, or refunds.
                Reach out to us at{" "}
                <a href="mailto:karunfruits@gmail.com" className="text-[#C17A35] hover:underline">
                  karunfruits@gmail.com
                </a>{" "}
                and we'll resolve it as quickly as possible.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
