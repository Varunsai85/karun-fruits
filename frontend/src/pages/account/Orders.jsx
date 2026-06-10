import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, ChevronRight, Search } from "lucide-react";
import { orderService } from "@/services/orderService";
import { formatPrice, formatDate } from "@/lib/utils";

const STATUS_STYLES = {
  ORDER_PLACED:    "bg-[#1a2a4a] text-[#7aacd8] border border-[#2a3a5a]",
  CONFIRMED:       "bg-[#1a1a3a] text-[#8a8ad8] border border-[#2a2a5a]",
  PACKED:          "bg-[#2a2a1a] text-[#C17A35] border border-[#3a3a2a]",
  SHIPPED:         "bg-[#2a1a1a] text-[#d87a5a] border border-[#4a2a2a]",
  OUT_FOR_DELIVERY:"bg-[#2a1a3a] text-[#a87ad8] border border-[#3a2a4a]",
  DELIVERED:       "bg-[#1a2a1a] text-green-600 border border-[#2a4a2a]",
  CANCELLED:       "bg-[#2a1a1a] text-red-400 border border-[#4a2a2a]",
  REFUNDED:        "bg-[#1a1a1a] text-[#9AAA9C] border border-[#2a2a2a]",
};
const STATUS_LABELS = {
  ORDER_PLACED: "Order Placed", CONFIRMED: "Confirmed", PACKED: "Packed",
  SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered", CANCELLED: "Cancelled", REFUNDED: "Refunded",
};

const MOCK_ORDERS = [
  { id: 1, orderNumber: "KF-1733001234", createdAt: "2024-12-01", status: "DELIVERED",    total: 998, items: [{ productName: "California Almonds 500g", quantity: 2 }] },
  { id: 2, orderNumber: "KF-1733005678", createdAt: "2024-12-05", status: "SHIPPED",      total: 499, items: [{ productName: "Medjool Dates 500g",      quantity: 1 }] },
  { id: 3, orderNumber: "KF-1733009012", createdAt: "2024-12-08", status: "ORDER_PLACED", total: 749, items: [{ productName: "Iranian Pistachios 250g", quantity: 1 }] },
];

export default function Orders() {
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", page],
    queryFn: () => orderService.getAll({ page, size: 10 }),
    placeholderData: { content: MOCK_ORDERS, totalPages: 1 },
  });

  const orders   = data?.content || MOCK_ORDERS;
  const filtered = search ? orders.filter((o) => o.orderNumber.toLowerCase().includes(search.toLowerCase())) : orders;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-7">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-heading text-[#F5F0E8] text-2xl font-light">My Orders</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5A6A5C]" />
            <input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl text-sm font-light focus:outline-none focus:border-[#2A3A2C] w-52"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-20 bg-[#1D2B1F] rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-14 h-14 text-[#5A6A5C] mx-auto mb-4" />
            <h3 className="font-heading text-[#F5F0E8] text-xl font-light mb-2">No orders yet</h3>
            <p className="text-[#9AAA9C] mb-6 font-light">Your orders will appear here after you shop</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-7 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <div key={order.id} className="border border-[#2A3A2C] rounded-xl p-4 hover:border-[#C17A35]/40 transition-colors">
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-[#F5F0E8] font-light text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-[#9AAA9C] mt-0.5 font-light">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-light px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || ""}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <Link to={`/track-order?order=${order.orderNumber}`} className="text-[#5A6A5C] hover:text-[#C17A35] transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9AAA9C] font-light truncate max-w-[60%]">
                    {order.items?.map((i) => `${i.productName} × ${i.quantity}`).join(", ")}
                  </span>
                  <span className="font-heading text-[#C17A35] text-lg font-light">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
