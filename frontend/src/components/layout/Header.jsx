import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, LogOut, Package, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shopHover,   setShopHover]   = useState(false);

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

  const transparent = isHome && !scrolled;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const textColor  = transparent ? "text-[#F5F0E8]"  : "text-[#F5F0E8]";
  const mutedColor = transparent ? "text-[#9AAA9C]"   : "text-[#9AAA9C]";
  const hoverBg    = "hover:bg-[#1E2A1E]";
  const iconColor  = "text-[#9AAA9C] hover:text-[#F5F0E8]";

  return (
    <>
      {/* Main header */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          transparent
            ? "bg-transparent"
            : "bg-[#0D1A10]/98 backdrop-blur-md border-b border-[#2A3A2C] shadow-lg"
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
                <span className={`label-luxury ${mutedColor} group-hover:text-[#C17A35] transition-colors`}>
                  Est. 2005 · Mumbai
                </span>
                <span
                  className={`font-heading ${textColor} text-2xl lg:text-3xl font-light tracking-tight mt-0.5`}
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
                    <button className={`flex items-center gap-1 px-4 py-2 text-sm font-light ${textColor} tracking-wide transition-colors ${hoverBg} rounded-lg`}>
                      Shop <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${shopHover ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {shopHover && (
                        <motion.div
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] bg-[#162018] border border-[#2A3A2C] rounded-2xl shadow-2xl overflow-hidden"
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
                          <div className="border-t border-[#2A3A2C] px-5 py-3 flex justify-between items-center bg-[#0D1A10]">
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
                    className={`px-4 py-2 text-sm font-light ${textColor} tracking-wide transition-colors ${hoverBg} rounded-lg`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 ${iconColor} transition-colors rounded-lg ${hoverBg}`}
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={() => navigate(isAuthenticated ? "/account/wishlist" : "/login")}
                className={`relative p-2 ${iconColor} transition-colors rounded-lg ${hoverBg}`}
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C17A35] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className={`relative p-2 ${iconColor} transition-colors rounded-lg ${hoverBg}`}
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

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-1 w-8 h-8 rounded-full bg-[#C17A35] border border-[#A86929] flex items-center justify-center text-white text-sm font-medium hover:bg-[#A86929] transition-colors">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-[#162018] border-[#2A3A2C] text-[#F5F0E8]">
                    <div className="px-3 py-2.5 border-b border-[#2A3A2C]">
                      <p className="text-sm font-medium text-[#F5F0E8]">{user?.name}</p>
                      <p className="text-xs text-[#9AAA9C] mt-0.5">{user?.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/account")} className="hover:bg-[#1D2B1F] focus:bg-[#1D2B1F] text-[#D0D8D2] mt-1">
                      <User className="w-3.5 h-3.5 mr-2" /> My Account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/account/orders")} className="hover:bg-[#1D2B1F] focus:bg-[#1D2B1F] text-[#D0D8D2]">
                      <Package className="w-3.5 h-3.5 mr-2" /> My Orders
                    </DropdownMenuItem>
                    {isAdmin?.() && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="hover:bg-[#1D2B1F] focus:bg-[#1D2B1F] text-[#D0D8D2]">
                        <Settings className="w-3.5 h-3.5 mr-2" /> Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#2A3A2C]" />
                    <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="hover:bg-[#1D2B1F] focus:bg-[#1D2B1F] text-red-400 mb-1">
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" className="ml-1 hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 border border-[#2A3A2C] text-[#D0D8D2] hover:border-[#C17A35] hover:text-[#C17A35] text-sm font-light tracking-wide rounded-full transition-all">
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden ml-1 p-2 ${iconColor} transition-colors`}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
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
                    className="flex-1 bg-[#162018] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#C17A35] focus-visible:border-[#C17A35]"
                  />
                  <button type="submit" className="px-6 py-2 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-lg transition-colors">
                    Search
                  </button>
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
              className="lg:hidden overflow-hidden bg-[#162018] border-t border-[#2A3A2C] shadow-lg"
            >
              <div className="px-5 py-5 space-y-1">
                <Link to="/" className="block py-2.5 text-[#F5F0E8] font-light tracking-wide border-b border-[#2A3A2C]" onClick={() => setMobileOpen(false)}>Home</Link>
                <Link to="/products" className="block py-2.5 text-[#F5F0E8] font-light tracking-wide border-b border-[#2A3A2C]" onClick={() => setMobileOpen(false)}>All Products</Link>
                {CATEGORIES.map((cat) => (
                  <Link key={cat.slug} to={`/products?category=${cat.slug}`} className="block py-2 pl-3 text-sm text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors" onClick={() => setMobileOpen(false)}>
                    {cat.name}
                  </Link>
                ))}
                <Link to="/about" className="block py-2.5 text-[#F5F0E8] font-light tracking-wide border-t border-[#2A3A2C]" onClick={() => setMobileOpen(false)}>About</Link>
                <div className="pt-3">
                  <a href="https://wa.me/918104956871" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#C17A35] hover:text-[#D4913F]">
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
