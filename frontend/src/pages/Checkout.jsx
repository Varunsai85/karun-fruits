import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, CreditCard, Package, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Confirm", icon: Package },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Goa", "Gujarat", "Haryana",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

const PAYMENT_METHODS = [
  { id: "RAZORPAY", label: "Pay Online", sub: "UPI / Cards / Net Banking / Wallets", icon: "💳" },
  { id: "COD", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: "💵" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    name: "", line1: "", line2: "", city: "", state: "", pincode: "", phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [placedOrder, setPlacedOrder] = useState(null);

  const { items, getSubtotal, getTotal, coupon, couponDiscount, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => userService.getAddresses().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const prefillAddress = (saved) => {
    setAddress({
      name: saved.name || user?.name || "",
      line1: saved.line1 || "",
      line2: saved.line2 || "",
      city: saved.city || "",
      state: saved.state || "",
      pincode: saved.pincode || "",
      phone: saved.phone || user?.phone || "",
    });
  };

  const subtotal = getSubtotal();
  const shipping = subtotal >= 499 ? 0 : 50;
  const total = getTotal();

  const updateAddress = (field) => (e) => setAddress((a) => ({ ...a, [field]: e.target.value }));

  const validateAddress = () => {
    const required = ["name", "line1", "city", "state", "pincode", "phone"];
    for (const f of required) {
      if (!address[f]?.trim()) { toast.error(`Please fill in ${f}`); return false; }
    }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error("Enter a valid 6-digit pincode"); return false; }
    if (!/^[6-9]\d{9}$/.test(address.phone)) { toast.error("Enter a valid 10-digit phone number"); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id ?? null,
          quantity: i.quantity,
        })),
        couponCode: coupon ?? null,
        paymentMethod,
        address: { name: address.name, line1: address.line1, line2: address.line2,
          city: address.city, state: address.state, pincode: address.pincode, phone: address.phone },
      };

      if (paymentMethod === "COD") {
        const order = await orderService.create(orderData);
        setPlacedOrder(order);
        clearCart();
        setStep(3);
        return;
      }

      // Razorpay flow
      const rzpOrder = await orderService.createRazorpayOrder({ amount: total });

      await new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "Karun Fruits",
          description: "Premium Dry Fruits",
          order_id: rzpOrder.id,
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
          theme: { color: "#C8860A" },
          handler: async (response) => {
            try {
              await orderService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              const order = await orderService.create({ ...orderData, razorpayOrderId: rzpOrder.id });
              setPlacedOrder(order);
              clearCart();
              setStep(3);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (e) => reject(new Error(e.error?.description)));
        rzp.open();
      });
    } catch (err) {
      if (err?.message !== "Payment cancelled") {
        toast.error(err?.message || "Order failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Order Confirmed
  if (step === 3 && placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-bold text-[#3D2000] mb-2" style={{ fontFamily: "serif" }}>
            Order Placed! 🎉
          </h1>
          <p className="text-[#8B6914] mb-2">Thank you for shopping with Karun Fruits.</p>
          <p className="text-[#8B6914] mb-6">
            Order ID: <span className="font-semibold text-[#3D2000]">{placedOrder.orderNumber}</span>
          </p>
          <div className="bg-[#F5ECD7] rounded-2xl p-5 mb-8 text-left">
            <p className="text-sm font-semibold text-[#3D2000] mb-2">Delivery Address</p>
            <p className="text-sm text-[#8B6914]">{address.name}</p>
            <p className="text-sm text-[#8B6914]">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
            <p className="text-sm text-[#8B6914]">{address.city}, {address.state} – {address.pincode}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-[#C8860A] hover:bg-[#8B4513] text-white gap-2"
              onClick={() => navigate("/account/orders")}>
              Track Order
            </Button>
            <Button variant="outline" className="border-[#C8860A] text-[#C8860A]"
              onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[#3D2000] mb-8" style={{ fontFamily: "serif" }}>Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.id ? "text-[#C8860A]" : "text-[#8B6914]"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step > s.id ? "bg-[#C8860A] text-white" : step === s.id ? "bg-[#C8860A] text-white ring-4 ring-[#C8860A]/20" : "bg-[#F5ECD7] text-[#8B6914]"
              }`}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className="hidden sm:block text-sm font-medium">{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-2 transition-all ${step > s.id ? "bg-[#C8860A]" : "bg-[#E8D5B5]"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="address"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-2xl border border-[#E8D5B5] p-6">
                  <h2 className="text-lg font-bold text-[#3D2000] mb-5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C8860A]" /> Delivery Address
                  </h2>

                  {/* Saved addresses picker */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm text-[#8B6914] font-medium mb-3">Saved Addresses</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {savedAddresses.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => prefillAddress(a)}
                            className="text-left p-3 rounded-xl border border-[#E8D5B5] hover:border-[#C8860A] hover:bg-[#FFF8F0] transition-all text-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-[#3D2000]">{a.name}</span>
                              {a.isDefault && (
                                <span className="text-xs bg-[#C8860A]/10 text-[#C8860A] px-1.5 py-0.5 rounded-md">Default</span>
                              )}
                            </div>
                            <p className="text-[#8B6914] text-xs leading-relaxed line-clamp-2">
                              {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} – {a.pincode}
                            </p>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-[#E8D5B5]" />
                        <span className="text-[#8B6914] text-xs">or fill manually</span>
                        <div className="flex-1 h-px bg-[#E8D5B5]" />
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-[#3D2000]">Full Name *</Label>
                      <Input placeholder="Recipient's full name" value={address.name} onChange={updateAddress("name")}
                        className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[#3D2000]">Address Line 1 *</Label>
                      <Input placeholder="Flat / House No., Building, Street" value={address.line1} onChange={updateAddress("line1")}
                        className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-[#3D2000]">Address Line 2</Label>
                      <Input placeholder="Area, Colony, Locality (optional)" value={address.line2} onChange={updateAddress("line2")}
                        className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
                    </div>
                    <div>
                      <Label className="text-[#3D2000]">City *</Label>
                      <Input placeholder="City" value={address.city} onChange={updateAddress("city")}
                        className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
                    </div>
                    <div>
                      <Label className="text-[#3D2000]">State *</Label>
                      <select value={address.state} onChange={updateAddress("state")}
                        className="mt-1 w-full h-10 px-3 rounded-md border border-[#E8D5B5] text-sm focus:outline-none focus:ring-2 focus:ring-[#C8860A] bg-white text-[#3D2000]">
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-[#3D2000]">Pincode *</Label>
                      <Input placeholder="6-digit pincode" value={address.pincode} onChange={updateAddress("pincode")}
                        maxLength={6} className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
                    </div>
                    <div>
                      <Label className="text-[#3D2000]">Phone Number *</Label>
                      <Input placeholder="10-digit mobile number" value={address.phone} onChange={updateAddress("phone")}
                        maxLength={10} className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 bg-[#C8860A] hover:bg-[#8B4513] text-white py-5 font-semibold rounded-xl gap-2"
                    onClick={() => { if (validateAddress()) setStep(2); }}
                  >
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="payment"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-white rounded-2xl border border-[#E8D5B5] p-6">
                  <h2 className="text-lg font-bold text-[#3D2000] mb-5 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#C8860A]" /> Payment Method
                  </h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {PAYMENT_METHODS.map((m) => (
                      <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === m.id ? "border-[#C8860A] bg-[#FDF8F0]" : "border-[#E8D5B5] hover:border-[#C8860A]/50"
                      }`}>
                        <RadioGroupItem value={m.id} className="text-[#C8860A]" />
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <p className="font-semibold text-[#3D2000]">{m.label}</p>
                          <p className="text-sm text-[#8B6914]">{m.sub}</p>
                        </div>
                        {paymentMethod === m.id && m.id === "RAZORPAY" && (
                          <div className="ml-auto flex gap-1">
                            <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" className="h-6" />
                            <img src="https://img.icons8.com/color/32/mastercard.png" alt="MC" className="h-6" />
                            <img src="https://img.icons8.com/color/32/bhim-upi.png" alt="UPI" className="h-6" />
                          </div>
                        )}
                      </label>
                    ))}
                  </RadioGroup>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1 border-[#E8D5B5]" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-[#C8860A] hover:bg-[#8B4513] text-white py-5 font-semibold rounded-xl"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : paymentMethod === "COD" ? `Place Order · ${formatPrice(total)}` : `Pay · ${formatPrice(total)}`}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-[#8B6914] mt-3">🔒 Your payment is secured with SSL encryption</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary sidebar */}
        <div className="bg-white rounded-2xl border border-[#E8D5B5] p-5 h-fit sticky top-24">
          <h3 className="font-bold text-[#3D2000] mb-4">Order Summary ({items.length} items)</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.map((item) => (
              <div key={item.key} className="flex gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5ECD7] flex-shrink-0">
                  <img src={item.product.imageUrl || "/placeholder-product.jpg"} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#3D2000] font-medium line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-[#8B6914]">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-[#C8860A] flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator className="bg-[#E8D5B5] mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#8B6914]">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span><span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#8B6914]">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
            </div>
            <Separator className="bg-[#E8D5B5]" />
            <div className="flex justify-between font-bold text-base text-[#3D2000]">
              <span>Total</span>
              <span className="text-[#C8860A]">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
