import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingCart, Users, Package, TrendingUp, AlertCircle, Clock, CheckCircle } from "lucide-react";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";
import { Block, TableSkeleton } from "@/components/admin/Skeletons";

const STATUS_STYLES = {
  ORDER_PLACED: "bg-[#1a2a4a] text-[#7aacd8]", CONFIRMED: "bg-[#1a1a3a] text-[#8a8ad8]",
  PACKED: "bg-[#2a2a1a] text-[#C17A35]", SHIPPED: "bg-[#2a1a1a] text-[#d87a5a]",
  DELIVERED: "bg-[#1a2a1a] text-[#6DAA6D]", CANCELLED: "bg-[#2a1a1a] text-red-400",
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats"),
  });
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => api.get("/admin/orders/recent"),
  });

  const s      = stats || {};
  const orders = Array.isArray(recentOrders) ? recentOrders : [];

  const statCards = [
    { label: "Total Revenue",    value: formatPrice(s.totalRevenue),          icon: TrendingUp,  color: "text-[#C17A35]",  bg: "bg-[#C17A35]/10", sub: `Today: ${formatPrice(s.todaySales)}` },
    { label: "Total Orders",     value: s.totalOrders?.toLocaleString(),       icon: ShoppingCart,color: "text-blue-400",   bg: "bg-blue-500/10",  sub: `${s.pendingOrders} pending` },
    { label: "Customers",        value: s.totalCustomers?.toLocaleString(),    icon: Users,       color: "text-purple-400", bg: "bg-purple-500/10",sub: "Registered users" },
    { label: "Low Stock",        value: s.lowStockProducts,                    icon: AlertCircle, color: "text-red-400",    bg: "bg-red-500/10",   sub: "Need restock" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="label-luxury text-[#7A8F7C] block mb-1">Overview</span>
          <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Dashboard</h1>
        </div>
        <span className="label-luxury text-[#C17A35] px-4 py-2 bg-[#162018] border border-[#2A3A2C] rounded-full">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Block key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <p className="font-heading text-[#F5F0E8] text-2xl font-light">{card.value}</p>
              <p className="text-sm text-[#9AAA9C] mt-0.5 font-light">{card.label}</p>
              <p className="text-xs text-[#5A6A5C] mt-0.5 font-light">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6">
          <h2 className="font-heading text-[#F5F0E8] text-xl font-light mb-5">Recent Orders</h2>
          {ordersLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A3A2C]">
                  {["Order #","Customer","Amount","Status"].map((h) => (
                    <th key={h} className="text-left py-2.5 label-luxury text-[#7A8F7C]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#2A3A2C] hover:bg-[#1D2B1F] transition-colors">
                    <td className="py-3 text-[#D0D8D2] font-light text-xs">{order.orderNumber}</td>
                    <td className="py-3 text-[#D0D8D2] font-light">{order.user?.name || order.addressName}</td>
                    <td className="py-3 text-[#C17A35] font-light">{formatPrice(order.total)}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-light ${STATUS_STYLES[order.status] || ""}`}>
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-5">
            <h2 className="font-heading text-[#F5F0E8] text-xl font-light mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Add New Product",     icon: Package,     to: "/admin/products" },
                { label: "View Pending Orders", icon: Clock,       to: "/admin/orders?status=pending" },
                { label: "Add Coupon",          icon: CheckCircle, to: "/admin/coupons" },
              ].map(({ label, icon: Icon, to }) => (
                <a key={label} href={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1D2B1F] transition-colors text-sm font-light text-[#9AAA9C] hover:text-[#F5F0E8]">
                  <div className="w-8 h-8 rounded-lg bg-[#1D2B1F] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#C17A35]" />
                  </div>
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-[#1E4620] border border-[#2D5A32] rounded-2xl p-5">
            <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-1">Need Help?</h3>
            <p className="text-sm text-[#7A9F7C] mb-4 font-light">Contact support for any admin panel issues.</p>
            <a href="https://wa.me/918104956871" target="_blank" rel="noreferrer"
              className="text-sm text-white bg-[#C17A35] hover:bg-[#A86929] px-4 py-2 rounded-full inline-block transition-colors font-light">
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
