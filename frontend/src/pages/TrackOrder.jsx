import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, Truck, Clock } from "lucide-react";
import { orderService } from "@/services/orderService";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_STEPS  = ["ORDER_PLACED","CONFIRMED","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED"];
const STATUS_LABELS = {
  ORDER_PLACED: "Order Placed", CONFIRMED: "Confirmed", PACKED: "Packed",
  SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered",
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order,       setOrder]       = useState(null);
  const [loading,     setLoading]     = useState(false);

  const handleTrack = async () => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    try {
      const data = await orderService.getByOrderNumber(orderNumber.trim());
      setOrder(data);
    } catch {
      toast.error("Order not found. Please check the order number.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-[#0D1A10]">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <span className="label-luxury text-[#C17A35] block mb-4">Real-time Updates</span>
            <h1 className="font-heading text-[#F5F0E8] text-4xl font-light mb-3">Track Your Order</h1>
            <p className="text-[#7A8F7C] font-light">Enter your order number to get live delivery status</p>
          </div>

          <div className="flex gap-3 mb-10">
            <input
              type="text"
              placeholder="Enter Order Number (e.g. KF-2024-001234)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              className="flex-1 px-4 py-3 bg-[#162018] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl font-light focus:outline-none focus:border-[#2D5A32]"
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 text-white font-light tracking-wide rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" /> {loading ? "Searching..." : "Track"}
            </button>
          </div>

          {order && (
            <motion.div
              className="bg-[#162018] border border-[#2A3A2C] rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Order header */}
              <div className="bg-[#1E4620] border-b border-[#2D5A32] px-6 py-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="label-luxury text-[#9AAA9C] mb-1">Order Number</p>
                    <p className="font-heading text-[#F5F0E8] text-xl font-light">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="label-luxury text-[#9AAA9C] mb-1">Order Date</p>
                    <p className="text-[#D0D8D2] font-light">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Progress tracker */}
                <div className="relative mb-10">
                  <div className="absolute top-5 left-5 right-5 h-px bg-[#2A3A2C]" />
                  <div
                    className="absolute top-5 left-5 h-px bg-[#C17A35] transition-all duration-1000"
                    style={{ width: currentStep > 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }}
                  />
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, idx) => (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all border ${
                          idx <= currentStep
                            ? "bg-[#C17A35] border-[#C17A35] text-white"
                            : "bg-[#0D1A10] border-[#2A3A2C] text-[#5A6A5C]"
                        }`}>
                          {idx < currentStep ? <CheckCircle className="w-5 h-5" /> :
                           idx === currentStep ? <Truck className="w-5 h-5" /> :
                           <Clock className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] text-center text-[#7A8F7C] max-w-14 leading-tight hidden sm:block font-light">
                          {STATUS_LABELS[step]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="bg-[#1E4620]/40 border border-[#2D5A32] rounded-xl p-4 mb-5">
                    <p className="label-luxury text-[#9AAA9C] mb-1">Tracking Number</p>
                    <p className="font-heading text-[#F5F0E8] text-lg font-light">{order.trackingNumber}</p>
                    {order.shippingCarrier && <p className="text-xs text-[#7A9F7C] mt-1">via {order.shippingCarrier}</p>}
                  </div>
                )}

                {/* Items */}
                <div>
                  <h3 className="label-luxury text-[#C17A35] mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm py-2.5 border-b border-[#2A3A2C]">
                        <div>
                          <p className="text-[#F5F0E8] font-light">{item.productName}</p>
                          <p className="text-[#7A8F7C] text-xs mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-[#C17A35] font-light">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
