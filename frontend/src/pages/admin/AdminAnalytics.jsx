import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import api from "@/services/api";
import { Block } from "@/components/admin/Skeletons";

const PERIODS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

const STATUS_COLORS = {
  ORDER_PLACED: "#C17A35", CONFIRMED: "#3B82F6", PACKED: "#8B5CF6",
  SHIPPED: "#06B6D4", OUT_FOR_DELIVERY: "#F59E0B", DELIVERED: "#10B981",
  CANCELLED: "#EF4444", REFUNDED: "#6B7280",
};

const PM_COLORS = ["#C17A35", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-5">
      <p className="text-[#9AAA9C] text-xs tracking-wide mb-1">{label}</p>
      <p className="text-[#F5F0E8] text-2xl font-light">{value}</p>
      {sub && <p className="text-[#5A6A5C] text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: () => api.get(`/admin/analytics?period=${period}`),
  });

  const statusPieData = data?.ordersByStatus
    ? Object.entries(data.ordersByStatus).map(([name, value]) => ({ name, value }))
    : [];

  const pmPieData = data?.revenueByPaymentMethod
    ? Object.entries(data.revenueByPaymentMethod).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#F5F0E8] text-2xl font-light">Sales Analytics</h1>
          <p className="text-[#9AAA9C] text-sm mt-0.5">Revenue trends and performance insights</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                period === p.value
                  ? "bg-[#C17A35] text-white"
                  : "bg-[#162018] border border-[#2A3A2C] text-[#9AAA9C] hover:text-[#F5F0E8]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Block className="h-24" />
            <Block className="h-24" />
          </div>
          <Block className="h-56" />
          <Block className="h-44" />
          <div className="grid grid-cols-3 gap-4">
            <Block className="h-64 col-span-2" />
            <Block className="h-64" />
          </div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Revenue"
              value={`₹${Number(data?.totalRevenue || 0).toLocaleString("en-IN")}`}
              sub={`Last ${period === "7d" ? "7" : period === "30d" ? "30" : "90"} days`}
            />
            <StatCard
              label="Total Orders"
              value={(data?.totalOrders || 0).toLocaleString()}
              sub="Excludes cancelled & refunded"
            />
          </div>

          {/* Revenue chart */}
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-5">
            <h2 className="text-[#F5F0E8] text-sm font-medium mb-4">Daily Revenue (₹)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.dailyRevenue || []} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C17A35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C17A35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3A2C" />
                <XAxis dataKey="date" tick={{ fill: "#9AAA9C", fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: "#9AAA9C", fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#0D1A10", border: "1px solid #2A3A2C", borderRadius: 8, color: "#F5F0E8" }}
                  formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C17A35" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily orders chart */}
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-5">
            <h2 className="text-[#F5F0E8] text-sm font-medium mb-4">Daily Orders</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.dailyRevenue || []} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3A2C" />
                <XAxis dataKey="date" tick={{ fill: "#9AAA9C", fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: "#9AAA9C", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0D1A10", border: "1px solid #2A3A2C", borderRadius: 8, color: "#F5F0E8" }}
                  formatter={v => [v, "Orders"]}
                />
                <Bar dataKey="orders" fill="#C17A35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top products + pie charts */}
          <div className="grid grid-cols-3 gap-4">
            {/* Top products */}
            <div className="col-span-2 bg-[#162018] border border-[#2A3A2C] rounded-xl p-5">
              <h2 className="text-[#F5F0E8] text-sm font-medium mb-4">Top Selling Products</h2>
              {(data?.topProducts || []).length === 0 ? (
                <p className="text-[#9AAA9C] text-sm">No data available</p>
              ) : (
                <div className="space-y-3">
                  {(data?.topProducts || []).map((p, i) => {
                    const maxQty = data.topProducts[0]?.quantity || 1;
                    const pct = Math.round((p.quantity / maxQty) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[#F5F0E8] text-sm truncate max-w-[60%]">{p.name}</span>
                          <span className="text-[#9AAA9C] text-xs">{p.quantity} units · ₹{Number(p.revenue).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="h-1.5 bg-[#2A3A2C] rounded-full overflow-hidden">
                          <div className="h-full bg-[#C17A35] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Orders by status pie */}
            <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-5">
              <h2 className="text-[#F5F0E8] text-sm font-medium mb-4">Orders by Status</h2>
              {statusPieData.length === 0 ? (
                <p className="text-[#9AAA9C] text-sm">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" paddingAngle={2}>
                        {statusPieData.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.name] || "#9AAA9C"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#0D1A10", border: "1px solid #2A3A2C", borderRadius: 8, color: "#F5F0E8", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1">
                    {statusPieData.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.name] || "#9AAA9C" }} />
                          <span className="text-[#9AAA9C]">{s.name.replace(/_/g, " ")}</span>
                        </div>
                        <span className="text-[#F5F0E8]">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Revenue by payment method */}
          {pmPieData.length > 0 && (
            <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-5">
              <h2 className="text-[#F5F0E8] text-sm font-medium mb-4">Revenue by Payment Method</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pmPieData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A2C" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#9AAA9C", fontSize: 11 }} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9AAA9C", fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ background: "#0D1A10", border: "1px solid #2A3A2C", borderRadius: 8, color: "#F5F0E8" }}
                    formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  {pmPieData.map((_, i) => (
                    <Bar key={i} dataKey="value" fill={PM_COLORS[i % PM_COLORS.length]} radius={[0, 4, 4, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
