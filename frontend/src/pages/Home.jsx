import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Award, RefreshCw, Star } from "lucide-react";
import ProductCard from "@/components/common/ProductCard";
import { productService } from "@/services/productService";

const CATEGORIES = [
  { name: "Almonds",    slug: "almonds",    emoji: "🌰" },
  { name: "Cashews",    slug: "cashews",    emoji: "🥜" },
  { name: "Pistachios", slug: "pistachios", emoji: "💚" },
  { name: "Walnuts",    slug: "walnuts",    emoji: "🧠" },
  { name: "Dates",      slug: "dates",      emoji: "🫘" },
  { name: "Seeds",      slug: "seeds",      emoji: "🌿" },
  { name: "Makhana",    slug: "makhana",    emoji: "⚪" },
  { name: "Gift Boxes", slug: "gift-boxes", emoji: "🎁" },
];

const WHY_US = [
  { Icon: Award,       title: "Premium Quality",   body: "Sourced from the finest farms across India and worldwide." },
  { Icon: Truck,       title: "Pan India Delivery", body: "Fast, reliable delivery to every pin code in India." },
  { Icon: ShieldCheck, title: "100% Natural",       body: "No preservatives, no artificial colors or flavors." },
  { Icon: RefreshCw,   title: "Easy Returns",       body: "Not satisfied? Return within 7 days, no questions asked." },
];

const TESTIMONIALS = [
  { name: "Priya Mehta",  city: "Delhi",     rating: 5, text: "Exceptional quality! The Kashmiri almonds are the best I have ever tasted. Packaging is beautiful too." },
  { name: "Rajesh Kumar", city: "Bangalore", rating: 5, text: "Ordered the gift box for Diwali — my family loved it. Fresh, premium, and delivered on time." },
  { name: "Anita Sharma", city: "Mumbai",    rating: 5, text: "Been ordering for 2 years. Consistent quality, fair prices. Their dates are absolutely divine." },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export default function Home() {
  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: productService.getFeatured,
    select: (d) => (d?.data ?? d)?.slice(0, 8),
  });

  const { data: trending } = useQuery({
    queryKey: ["products", "trending"],
    queryFn: productService.getTrending,
    select: (d) => (d?.data ?? d)?.slice(0, 4),
  });

  return (
    <div className="bg-[#0D1A10]">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1208] via-[#0D1A10] to-[#162018]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(193,122,53,0.12),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="h-px w-12 bg-[#C17A35]/60" />
              <span className="label-luxury text-[#C17A35]">Premium Dry Fruits · Mumbai · Est. 2005</span>
              <span className="h-px w-12 bg-[#C17A35]/60" />
            </div>

            <h1 className="font-heading text-[#F5F0E8] text-5xl sm:text-6xl lg:text-8xl font-light leading-none tracking-tight mb-6">
              Nature's Finest,<br />
              <em className="italic font-light text-[#C17A35]">Delivered Fresh</em>
            </h1>

            <p className="text-[#9AAA9C] text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
              Hand-selected premium dry fruits, seeds, and healthy snacks sourced
              from the world's finest growing regions. Pure. Natural. Exceptional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors"
              >
                Explore Our Range <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?category=gift-boxes"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#2A3A2C] text-[#D0D8D2] hover:border-[#C17A35] hover:text-[#F5F0E8] font-light tracking-wide rounded-full transition-all"
              >
                Shop Gift Boxes
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#5A6A5C]">
          <span className="label-luxury text-[10px]">Scroll</span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-[#5A6A5C] to-transparent"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────── */}
      <section className="border-y border-[#2A3A2C] bg-[#162018]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2 text-[#7A8F7C] text-xs font-light tracking-widest uppercase">
            {["Free Delivery above ₹499", "100% Natural & Pure", "Est. 2005 Mumbai", "Pan India Delivery", "20,000+ Happy Customers"].map((t, i) => (
              <span key={t} className="flex items-center gap-3">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-[#C17A35] opacity-60" />}
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <span className="label-luxury text-[#C17A35] block mb-3">Browse by Category</span>
            <h2 className="font-heading text-[#F5F0E8] text-4xl sm:text-5xl font-light">Our Collections</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2.5 p-4 bg-[#162018] border border-[#2A3A2C] rounded-2xl hover:border-[#C17A35]/50 hover:shadow-md transition-all text-center"
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs text-[#7A8F7C] group-hover:text-[#F5F0E8] transition-colors font-light leading-tight">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8 border-t border-[#2A3A2C] bg-[#0D1A10]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4" {...fadeUp}>
            <div>
              <span className="label-luxury text-[#C17A35] block mb-3">Handpicked For You</span>
              <h2 className="font-heading text-[#F5F0E8] text-4xl sm:text-5xl font-light">Featured Products</h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-[#7A8F7C] hover:text-[#C17A35] transition-colors font-light tracking-wide">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {featured?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#162018] border border-[#2A3A2C] rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[#1D2B1F]" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-[#1D2B1F] rounded w-1/3" />
                    <div className="h-5 bg-[#1D2B1F] rounded w-3/4" />
                    <div className="h-4 bg-[#1D2B1F] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Gift Boxes Banner ─────────────────────────────────────── */}
      <section className="py-6 px-5 sm:px-8 bg-[#0D1A10]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-[#162018] border border-[#2A3A2C] px-8 py-16 text-center"
            {...fadeUp}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(193,122,53,0.1),transparent)]" />
            <div className="relative z-10">
              <span className="label-luxury text-[#C17A35] block mb-4">Occasion Ready</span>
              <h2 className="font-heading text-[#F5F0E8] text-4xl sm:text-5xl font-light mb-4">
                Curated Gift Boxes
              </h2>
              <p className="text-[#9AAA9C] text-lg font-light max-w-xl mx-auto mb-8">
                Thoughtfully arranged premium dry fruit hampers for Diwali, Eid, weddings,
                and every celebration worth remembering.
              </p>
              <Link
                to="/products?category=gift-boxes"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors"
              >
                Shop Gift Boxes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8 border-t border-[#2A3A2C]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <span className="label-luxury text-[#C17A35] block mb-3">Our Promise</span>
            <h2 className="font-heading text-[#F5F0E8] text-4xl sm:text-5xl font-light">Why Karun Fruits</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map(({ Icon, title, body }, i) => (
              <motion.div
                key={title}
                className="text-center p-7 bg-[#162018] border border-[#2A3A2C] rounded-2xl hover:border-[#C17A35]/40 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="w-12 h-12 rounded-full border border-[#2A3A2C] bg-[#1D2B1F] flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-5 h-5 text-[#C17A35]" />
                </div>
                <h3 className="font-heading text-[#F5F0E8] text-xl font-light mb-2">{title}</h3>
                <p className="text-sm text-[#7A8F7C] leading-relaxed font-light">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending ─────────────────────────────────────────────── */}
      {trending?.length > 0 && (
        <section className="py-20 px-5 sm:px-8 border-t border-[#2A3A2C] bg-[#162018]">
          <div className="max-w-7xl mx-auto">
            <motion.div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4" {...fadeUp}>
              <div>
                <span className="label-luxury text-[#C17A35] block mb-3">Most Loved</span>
                <h2 className="font-heading text-[#F5F0E8] text-4xl sm:text-5xl font-light">Trending Now</h2>
              </div>
              <Link to="/products?sort=trending" className="inline-flex items-center gap-2 text-sm text-[#7A8F7C] hover:text-[#C17A35] transition-colors font-light tracking-wide">
                See All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trending.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8 border-t border-[#2A3A2C]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <span className="label-luxury text-[#C17A35] block mb-3">What Customers Say</span>
            <h2 className="font-heading text-[#F5F0E8] text-4xl sm:text-5xl font-light">Loved by Thousands</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="p-7 bg-[#162018] border border-[#2A3A2C] rounded-2xl hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className="w-3.5 h-3.5" fill={n <= t.rating ? "#C17A35" : "none"} stroke={n <= t.rating ? "#C17A35" : "#2A3A2C"} />
                  ))}
                </div>
                <p className="text-[#9AAA9C] text-sm leading-relaxed font-light italic mb-5">"{t.text}"</p>
                <div>
                  <span className="text-[#F5F0E8] text-sm font-medium">{t.name}</span>
                  <span className="text-[#7A8F7C] text-xs ml-2">· {t.city}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8 text-center border-t border-[#2A3A2C] bg-[#162018]">
        <motion.div className="max-w-2xl mx-auto" {...fadeUp}>
          <span className="label-luxury text-[#C17A35] block mb-4">Start Your Journey</span>
          <h2 className="font-heading text-[#F5F0E8] text-4xl sm:text-6xl font-light mb-5">
            Taste the Difference
          </h2>
          <p className="text-[#9AAA9C] text-lg font-light mb-10">
            Join over 20,000 customers who trust Karun Fruits for their premium dry fruit needs.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full text-lg transition-colors"
          >
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
