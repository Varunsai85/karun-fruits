import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Menu, X, Phone, ChevronDown, LogOut, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Dry Fruits",     slug: "dry-fruits",     items: ["Almonds","Cashews","Pistachios","Walnuts","Dates","Raisins","Figs","Apricots"] },
  { name: "Seeds",          slug: "seeds",           items: ["Pumpkin Seeds","Sunflower Seeds","Chia Seeds","Flax Seeds","Makhana"] },
  { name: "Healthy Snacks", slug: "healthy-snacks",  items: [] },
  { name: "Gift Boxes",     slug: "gift-boxes",      items: [] },
  { name: "Combo Packs",    slug: "combo-packs",     items: [] },
];

const NAV_LINKS = [
  { label: "Home",       to: "/" },
  { label: "Shop",       to: null, dropdown: true },
  { label: "Gift Boxes", to: "/products?category=gift-boxes" },
  { label: "About",      to: "/about" },
];

export default function Header() {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [shopHover,      setShopHover]      = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === "/";

  const itemCount     = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // On home page the hero is dark — keep header transparent until scrolled
  const transparent = isHome && !scrolled;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top strip */}
      <div className="bg-[#0D1A10] text-[#9AAA9C] text-[11px] py-2 px-4 hidden md:block border-b border-[#2A3A2C]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="flex items-center gap-1.5 tracking-wide">
            <Phone className="w-3 h-3" /> 08104956871
            <span className="mx-3 opacity-30">|</span>
            Free delivery on orders above ₹499
          </span>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-[#F5F0E8] transition-colors tracking-wide">Track Order</Link>
            <span className="opacity-30">|</span>
            <a href="https://wa.me/918104956871" target="_blank" rel="noreferrer" className="hover:text-[#F5F0E8] transition-colors tracking-wide">WhatsApp</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          transparent
            ? "bg-transparent"
            : "bg-[#0D1A10]/98 backdrop-blur-md border-b border-[#2A3A2C]"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <div className="flex flex-col leading-none">
                <span className="label-luxury text-[#9AAA9C] group-hover:text-[#C17A35] transition-colors">
                  Est. 2005 · Mumbai
                </span>
                <span
                  className="font-heading text-[#F5F0E8] text-2xl lg:text-3xl font-light tracking-tight mt-0.5"
                  style={{ letterSpacing: "0.05em" }}
                >
                  KARUN <span className="font-medium">FRUITS</span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  <div
                    key="shop"
                    className="relative"
                    onMouseEnter={() => setShopHover(true)}
                    onMouseLeave={() => setShopHover(false)}
                  >
                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-light text-[#D0D8D2] hover:text-[#F5F0E8] tracking-wide transition-colors">
                      Shop <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${shopHover ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {shopHover && (
                        <motion.div
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] bg-[#0D1A10] border border-[#2A3A2C] rounded-2xl shadow-2xl overflow-hidden"
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className="grid grid-cols-3 gap-0">
                            {CATEGORIES.map((cat, i) => (
                              <div key={cat.slug} className={`p-5 ${i < CATEGORIES.length - 1 ? "border-r border-[#2A3A2C]" : ""}`}>
                                <Link
                                  to={`/products?category=${cat.slug}`}
                                  className="label-luxury text-[#C17A35] hover:text-[#D4913F] transition-colors block mb-3"
                                  onClick={() => setShopHover(false)}
                                >
                                  {cat.name}
                                </Link>
                                <ul className="space-y-1.5">
                                  {cat.items.map((item) => (
                                    <li key={item}>
                                      <Link
                                        to={`/products?category=${cat.slug}&q=${encodeURIComponent(item)}`}
                                        className="text-xs text-[#7A8F7C] hover:text-[#F5F0E8] transition-colors block"
                                        onClick={() => setShopHover(false)}
                                      >
                                        {item}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-[#2A3A2C] px-5 py-3 flex justify-between items-center">
                            <span className="text-xs text-[#7A8F7C]">Explore our complete range</span>
                            <Link to="/products" className="text-xs text-[#C17A35] hover:text-[#D4913F] font-medium transition-colors" onClick={() => setShopHover(false)}>
                              View All Products →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-4 py-2 text-sm font-light text-[#D0D8D2] hover:text-[#F5F0E8] tracking-wide transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors rounded-lg hover:bg-[#162018]"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => navigate(isAuthenticated ? "/account/wishlist" : "/login")}
                className="relative p-2 text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors rounded-lg hover:bg-[#162018]"
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C17A35] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors rounded-lg hover:bg-[#162018]"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C17A35] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-1 w-8 h-8 rounded-full bg-[#1E4620] border border-[#2D5A32] flex items-center justify-center text-[#F5F0E8] text-sm font-medium hover:bg-[#2D5A32] transition-colors">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8]">
                    <div className="px-3 py-2.5 border-b border-[#2A3A2C]">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-[#7A8F7C] mt-0.5">{user?.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/account")} className="hover:bg-[#162018] focus:bg-[#162018] text-[#D0D8D2] hover:text-white mt-1">
                      <User className="w-3.5 h-3.5 mr-2" /> My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account/orders")} className="hover:bg-[#162018] focus:bg-[#162018] text-[#D0D8D2] hover:text-white">
                      <Package className="w-3.5 h-3.5 mr-2" /> My Orders
                    </DropdownMenuItem>
                    {isAdmin?.() && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="hover:bg-[#162018] focus:bg-[#162018] text-[#D0D8D2] hover:text-white">
                        <Settings className="w-3.5 h-3.5 mr-2" /> Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#2A3A2C]" />
                    <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="hover:bg-[#162018] focus:bg-[#162018] text-red-400 hover:text-red-300 mb-1">
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" className="ml-1 hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 border border-[#2A3A2C] text-[#D0D8D2] hover:border-[#C17A35] hover:text-[#F5F0E8] text-sm font-light tracking-wide rounded-full transition-all">
                  Sign In
                </Link>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden ml-1 p-2 text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar slide-down */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-[#2A3A2C]"
              >
                <form onSubmit={handleSearch} className="flex gap-3 py-4">
                  <Input
                    autoFocus
                    placeholder="Search almonds, cashews, gift boxes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-[#162018] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#7A8F7C] focus-visible:ring-[#1E4620] focus-visible:border-[#2D5A32]"
                  />
                  <Button type="submit" className="bg-[#C17A35] hover:bg-[#A86929] text-white px-6 font-light tracking-wide">
                    Search
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-[#0D1A10] border-t border-[#2A3A2C]"
            >
              <div className="px-5 py-5 space-y-1">
                <Link to="/" className="block py-2.5 text-[#D0D8D2] font-light tracking-wide border-b border-[#2A3A2C]" onClick={() => setMobileOpen(false)}>Home</Link>
                <Link to="/products" className="block py-2.5 text-[#D0D8D2] font-light tracking-wide border-b border-[#2A3A2C]" onClick={() => setMobileOpen(false)}>All Products</Link>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="block py-2 pl-3 text-sm text-[#7A8F7C] hover:text-[#D0D8D2] transition-colors" onClick={() => setMobileOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
                <Link to="/about" className="block py-2.5 text-[#D0D8D2] font-light tracking-wide border-t border-[#2A3A2C]" onClick={() => setMobileOpen(false)}>About</Link>
                <div className="pt-3">
                  <a href="https://wa.me/918104956871" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#C17A35] hover:text-[#D4913F]">
                    WhatsApp: 08104956871
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
