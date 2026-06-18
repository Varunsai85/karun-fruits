import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle } from "lucide-react";
import SEO from "@/components/common/SEO";

const CONTACT_INFO = [
  { icon: MapPin, label: "Our Store", value: "Shop No.46, Gaumukh Bhavan, Yusuf Meher Ali Rd, Masjid Bandar, Mumbai - 400009" },
  { icon: Phone, label: "Phone / WhatsApp", value: "+91 81049 56871" },
  { icon: Mail, label: "Email", value: "karunfruits@gmail.com" },
  { icon: Clock, label: "Store Hours", value: "Mon–Sat: 9 AM – 9 PM\nSunday: 10 AM – 6 PM" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate form submission — wire up to backend email endpoint when ready
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  }

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Karun Fruits. We're here to help with orders, bulk enquiries, and any questions about our premium dry fruits."
        keywords="contact karun fruits, dry fruits customer service, bulk order enquiry"
      />
      <div className="bg-[#0D1A10] min-h-screen">
        {/* Header */}
        <section className="py-16 px-5 text-center border-b border-[#2A3A2C] bg-gradient-to-b from-[#1E4620]/20 to-transparent">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#C17A35] text-sm tracking-[0.3em] uppercase font-light mb-3">Get In Touch</p>
            <h1 className="font-heading text-5xl text-[#F5F0E8] font-light mb-4">Contact Us</h1>
            <p className="text-[#9AAA9C] font-light max-w-xl mx-auto">
              Have a question, need a bulk order, or just want to say hello? We'd love to hear from you.
            </p>
          </motion.div>
        </section>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid md:grid-cols-5 gap-10">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-4"
          >
            {CONTACT_INFO.map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C17A35]/15 border border-[#C17A35]/25 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#C17A35]" />
                </div>
                <div>
                  <p className="text-[#9AAA9C] text-xs font-light mb-1">{label}</p>
                  <p className="text-[#F5F0E8] text-sm font-light whitespace-pre-line">{value}</p>
                </div>
              </div>
            ))}

            <a
              href={`https://wa.me/918104956871?text=${encodeURIComponent("Hi! I have a question about Karun Fruits.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] rounded-xl p-5 hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-light">Chat with us on WhatsApp</span>
            </a>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3"
          >
            {submitted ? (
              <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-5" />
                </motion.div>
                <h3 className="font-heading text-[#F5F0E8] text-2xl font-light mb-3">Message Sent!</h3>
                <p className="text-[#9AAA9C] font-light">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-6 px-6 py-2.5 border border-[#2A3A2C] text-[#9AAA9C] hover:text-[#F5F0E8] text-sm font-light rounded-full transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-7 space-y-4">
                <h3 className="font-heading text-[#F5F0E8] text-xl font-light mb-5">Send us a message</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                  <FormField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <div>
                    <label className="text-xs text-[#9AAA9C] font-light block mb-1.5">Subject *</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                      className="w-full bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] rounded-xl px-3 py-2.5 text-sm font-light focus:outline-none focus:border-[#C17A35]/50"
                    >
                      <option value="">Select subject</option>
                      <option value="order">Order Enquiry</option>
                      <option value="bulk">Bulk / Corporate Order</option>
                      <option value="product">Product Information</option>
                      <option value="return">Return / Refund</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#9AAA9C] font-light block mb-1.5">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl px-3 py-2.5 text-sm font-light focus:outline-none focus:border-[#C17A35]/50 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

function FormField({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="text-xs text-[#9AAA9C] font-light block mb-1.5">{label} {required && "*"}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl px-3 py-2.5 text-sm font-light focus:outline-none focus:border-[#C17A35]/50"
      />
    </div>
  );
}
