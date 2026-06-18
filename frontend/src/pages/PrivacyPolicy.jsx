import { motion } from "framer-motion";
import SEO from "@/components/common/SEO";

const SECTIONS = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly, including:
• Personal details (name, email, phone number) when you create an account or place an order
• Delivery addresses for order fulfillment
• Payment information processed securely via Razorpay (we do not store card details)
• Order history and preferences
• Communications you send us`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your information to:
• Process and deliver your orders
• Send order confirmations and shipping updates via email and SMS
• Provide customer support
• Send promotional offers (you may opt out at any time)
• Improve our website and services
• Comply with legal obligations`,
  },
  {
    title: "Information Sharing",
    content: `We do not sell your personal information. We may share it with:
• Delivery partners (Shiprocket) to fulfill your orders
• Payment gateways (Razorpay) for secure transaction processing
• SMS providers (Twilio) for order notifications
• Legal authorities when required by law`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard security measures including:
• SSL/TLS encryption for all data transmission
• Secure password hashing (bcrypt)
• JWT-based authentication with 24-hour token expiry
• Regular security audits
However, no method of transmission over the Internet is 100% secure.`,
  },
  {
    title: "Cookies",
    content: `We use essential cookies and localStorage for:
• Keeping you logged in (JWT tokens)
• Remembering your cart and wishlist
• Analyzing website performance
You can disable cookies in your browser settings, but this may affect functionality.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to:
• Access the personal information we hold about you
• Correct inaccurate information
• Delete your account and associated data
• Opt out of marketing communications
• Lodge a complaint with the relevant authority
To exercise these rights, contact us at karunfruits@gmail.com`,
  },
  {
    title: "Children's Privacy",
    content: `Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on our website. Your continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Read Karun Fruits' privacy policy to understand how we collect, use, and protect your personal information."
      />
      <div className="bg-[#0D1A10] min-h-screen">
        <section className="py-14 px-5 text-center border-b border-[#2A3A2C] bg-gradient-to-b from-[#1E4620]/20 to-transparent">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-5xl text-[#F5F0E8] font-light mb-3">Privacy Policy</h1>
            <p className="text-[#9AAA9C] font-light">Last updated: June 2025</p>
          </motion.div>
        </section>

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-[#162018] border border-[#C17A35]/20 rounded-xl p-5 mb-10 text-[#9AAA9C] text-sm font-light leading-relaxed">
              <strong className="text-[#F5F0E8]">Karun Fruits</strong> ("we", "us", "our") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our website at{" "}
              <span className="text-[#C17A35]">karunfruits.com</span>.
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
              <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-2">Contact Us</h3>
              <p className="text-[#9AAA9C] text-sm font-light">
                For privacy-related queries, email us at{" "}
                <a href="mailto:karunfruits@gmail.com" className="text-[#C17A35] hover:underline">
                  karunfruits@gmail.com
                </a>{" "}
                or write to Shop No.46, Gaumukh Bhavan, Yusuf Meher Ali Rd, Masjid Bandar, Mumbai - 400009.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
