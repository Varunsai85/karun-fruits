import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Heart, Award, Truck, Leaf } from "lucide-react";
import SEO from "@/components/common/SEO";

const VALUES = [
  { icon: Leaf, title: "100% Natural", desc: "No artificial preservatives, colors, or additives. Pure, natural goodness in every pack." },
  { icon: Award, title: "Premium Quality", desc: "Carefully sourced from the finest farms and regions to deliver exceptional taste and nutrition." },
  { icon: Truck, title: "Pan India Delivery", desc: "Fresh, vacuum-sealed packs delivered to your doorstep anywhere in India." },
  { icon: Heart, title: "Family Trusted", desc: "Over a decade of serving Mumbai families with the finest dry fruits and healthy snacks." },
];

const TEAM = [
  { name: "Karun Sharma", role: "Founder & CEO", initials: "KS" },
  { name: "Priya Sharma", role: "Head of Quality", initials: "PS" },
  { name: "Rahul Mehra", role: "Logistics Manager", initials: "RM" },
];

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Karun Fruits — Mumbai's trusted source for premium dry fruits, seeds, and healthy snacks since over a decade."
        keywords="about karun fruits, dry fruits mumbai, premium nuts india"
      />
      <div className="bg-[#0D1A10] min-h-screen">
        {/* Hero */}
        <section className="relative py-20 px-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E4620]/30 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-[#C17A35] text-sm tracking-[0.3em] uppercase font-light mb-4">Our Story</p>
              <h1 className="font-heading text-5xl md:text-6xl text-[#F5F0E8] font-light leading-tight mb-6">
                Nature's Finest,<br />Delivered to You
              </h1>
              <p className="text-[#9AAA9C] text-lg font-light leading-relaxed max-w-2xl mx-auto">
                For over a decade, Karun Fruits has been Mumbai's most trusted destination for premium dry fruits,
                seeds, and healthy snacks. What started as a small shop in Masjid Bandar has grown into a
                pan-India destination for health-conscious families.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story section */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8 h-72 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-heading text-8xl text-[#C17A35]/20 font-light mb-3">10+</div>
                  <p className="text-[#F5F0E8] text-xl font-heading font-light">Years of Excellence</p>
                  <p className="text-[#9AAA9C] text-sm font-light mt-2">Serving families across India</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              <h2 className="font-heading text-3xl text-[#F5F0E8] font-light">From Mumbai to Your Doorstep</h2>
              <p className="text-[#9AAA9C] font-light leading-relaxed">
                Founded in the heart of Mumbai's historic Masjid Bandar market, Karun Fruits began with a
                simple mission — to make premium quality dry fruits accessible to every Indian household.
              </p>
              <p className="text-[#9AAA9C] font-light leading-relaxed">
                We source our products directly from the finest farms in India, Iran, Afghanistan, and California,
                ensuring that every almond, cashew, and date that reaches your table is of the highest quality.
              </p>
              <p className="text-[#9AAA9C] font-light leading-relaxed">
                Today, we serve thousands of customers across India with over 100+ products, all packed fresh
                in vacuum-sealed pouches to preserve their natural flavor and nutritional value.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#162018] border-y border-[#2A3A2C] py-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-12">
              <p className="text-[#C17A35] text-sm tracking-[0.3em] uppercase font-light mb-3">Why Choose Us</p>
              <h2 className="font-heading text-4xl text-[#F5F0E8] font-light">Our Values</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0D1A10] border border-[#2A3A2C] rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#C17A35]/15 border border-[#C17A35]/25 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-[#C17A35]" />
                  </div>
                  <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-2">{title}</h3>
                  <p className="text-[#9AAA9C] text-sm font-light leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
          <div className="text-center mb-12">
            <p className="text-[#C17A35] text-sm tracking-[0.3em] uppercase font-light mb-3">The People Behind</p>
            <h2 className="font-heading text-4xl text-[#F5F0E8] font-light">Our Team</h2>
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            {TEAM.map(({ name, role, initials }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8 text-center w-52"
              >
                <div className="w-16 h-16 rounded-full bg-[#1E4620] border border-[#2A3A2C] flex items-center justify-center mx-auto mb-4 font-heading text-[#F5F0E8] text-xl font-light">
                  {initials}
                </div>
                <h3 className="font-heading text-[#F5F0E8] text-lg font-light">{name}</h3>
                <p className="text-[#9AAA9C] text-sm font-light mt-1">{role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact info */}
        <section className="bg-[#162018] border-t border-[#2A3A2C] py-12">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="font-heading text-3xl text-[#F5F0E8] font-light mb-8">Visit Us</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: MapPin, label: "Address", value: "Shop No.46, Gaumukh Bhavan, Yusuf Meher Ali Rd, Masjid Bandar, Mumbai - 400009" },
                { icon: Phone, label: "Phone", value: "+91 81049 56871" },
                { icon: Mail, label: "Email", value: "karunfruits@gmail.com" },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="bg-[#0D1A10] border border-[#2A3A2C] rounded-xl p-5">
                  <Icon className="w-5 h-5 text-[#C17A35] mx-auto mb-3" />
                  <p className="text-[#9AAA9C] text-xs font-light mb-1">{label}</p>
                  <p className="text-[#F5F0E8] text-sm font-light">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
