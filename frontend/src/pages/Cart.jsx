import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, ArrowRight, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderService } from "@/services/orderService";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function Cart() {
  const navigate = useNavigate();
  const [couponCode, setCouponCode]     = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const { items, removeItem, updateQuantity, getSubtotal, getTotal, applyCoupon, removeCoupon, coupon, couponDiscount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const subtotal = getSubtotal();
  const shipping = subtotal >= 499 ? 0 : 50;
  const total    = getTotal();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await orderService.applyCoupon(couponCode.trim(), subtotal);
      applyCoupon(couponCode.trim(), res.discount);
      toast.success(`Coupon applied! You saved ${formatPrice(res.discount)}`);
    } catch (err) {
      toast.error(err?.message || "Invalid or expired coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate("/login?redirect=/checkout"); return; }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[#0D1A10] flex items-center justify-center px-4">
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-heading text-[#F5F0E8] text-3xl font-light mb-3">Your cart is empty</h2>
          <p className="text-[#9AAA9C] mb-8 font-light">Add some premium dry fruits to get started</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors">
            <ShoppingBag className="w-4 h-4" /> Explore Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1A10]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full border border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35] hover:text-[#F5F0E8] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Shopping Cart</h1>
            <p className="text-[#9AAA9C] text-sm font-light mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0 }}
                  layout
                  className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-4 flex gap-4"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#1D2B1F]">
                    <img
                      src={item.product?.imageUrl || item.product?.images?.[0]?.url || "/placeholder-product.jpg"}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/products/${item.product?.slug || item.product?.id}`}
                          className="font-heading text-[#F5F0E8] text-lg font-light hover:text-[#C17A35] transition-colors line-clamp-2"
                        >
                          {item.product?.name}
                        </Link>
                        {item.variant && <p className="text-xs text-[#9AAA9C] mt-0.5">{item.variant.name}</p>}
                        {item.product?.weight && (
                          <p className="text-xs text-[#9AAA9C] mt-0.5">{item.product.weight}{item.product.unit}</p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.key)} className="text-[#5A6A5C] hover:text-red-400 transition-colors ml-2">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-[#2A3A2C] rounded-xl overflow-hidden">
                        <button className="px-3 py-2 text-[#9AAA9C] hover:text-[#F5F0E8] hover:bg-[#1D2B1F] transition-colors" onClick={() => updateQuantity(item.key, item.quantity - 1)}>
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm text-[#F5F0E8] font-light">{item.quantity}</span>
                        <button className="px-3 py-2 text-[#9AAA9C] hover:text-[#F5F0E8] hover:bg-[#1D2B1F] transition-colors" onClick={() => updateQuantity(item.key, item.quantity + 1)}>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-heading text-[#C17A35] text-xl font-light">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-[#9AAA9C] hover:text-[#C17A35] transition-colors font-light mt-2">
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-5">
              <h3 className="font-heading text-[#F5F0E8] text-lg font-light flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-[#C17A35]" /> Coupon Code
              </h3>
              {coupon ? (
                <div className="flex items-center justify-between bg-[#1E4620]/40 border border-[#2A3A2C] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#C17A35]">{coupon}</p>
                    <p className="text-xs text-[#9AAA9C] mt-0.5">Saved {formatPrice(couponDiscount)}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-[#5A6A5C] hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SAVE10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="flex-1 px-4 py-2.5 bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl text-sm font-light focus:outline-none focus:border-[#2A3A2C]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode}
                    className="px-5 py-2.5 bg-[#1E4620] hover:bg-[#C17A35] disabled:opacity-50 text-[#F5F0E8] text-sm font-light rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-5">
              <h3 className="font-heading text-[#F5F0E8] text-xl font-light mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#9AAA9C]">
                  <span className="font-light">Subtotal ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-light">Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#9AAA9C]">
                  <span className="font-light">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#C17A35]">
                    Add {formatPrice(499 - subtotal)} more for free delivery
                  </p>
                )}
                <div className="h-px bg-[#2A3A2C] my-1" />
                <div className="flex justify-between">
                  <span className="text-[#F5F0E8] font-medium">Total</span>
                  <span className="font-heading text-[#C17A35] text-xl font-light">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                className="w-full mt-6 py-3.5 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-center text-[#5A6A5C] mt-3">
                🔒 Secured by Razorpay · SSL Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
