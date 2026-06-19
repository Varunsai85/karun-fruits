import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/services/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/admin/Skeletons";

const ALL_STATUSES = ["ALL","ORDER_PLACED","CONFIRMED","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"];
const STATUS_STYLES = {
  ORDER_PLACED: "bg-[#1a2a4a] text-[#7aacd8]", CONFIRMED: "bg-[#1a1a3a] text-[#8a8ad8]",
  PACKED: "bg-[#2a2a1a] text-[#C17A35]", SHIPPED: "bg-[#2a1a1a] text-[#d87a5a]",
  OUT_FOR_DELIVERY: "bg-[#2a1a3a] text-[#a87ad8]", DELIVERED: "bg-[#1a2a1a] text-[#6DAA6D]",
  CANCELLED: "bg-[#2a1a1a] text-red-400",
};
export default function AdminOrders() {
  const qc = useQueryClient();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus]       = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", search, statusFilter],
    queryFn: () => api.get("/admin/orders", { params: { search, status: statusFilter !== "ALL" ? statusFilter : undefined, size: 50 } }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, tracking }) => api.put(`/admin/orders/${id}/status`, { status, trackingNumber: tracking }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Order updated!"); setSelectedOrder(null); },
    onError: () => toast.error("Failed to update order"),
  });

  const orders = data?.content || [];

  const openOrder = (order) => { setSelectedOrder(order); setNewStatus(order.status); setTrackingNumber(order.trackingNumber || ""); };

  return (
    <div>
      <div className="mb-8">
        <span className="label-luxury text-[#7A8F7C] block mb-1">Manage</span>
        <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Orders</h1>
      </div>

      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-5 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
          <input
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl font-light text-sm focus:outline-none focus:border-[#2D5A32]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-[#0D1A10] border-[#2A3A2C] text-[#D0D8D2]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[#162018] border-[#2A3A2C]">
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-[#D0D8D2] focus:bg-[#1D2B1F]">
                {s === "ALL" ? "All Orders" : s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : (
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#2A3A2C]">
              <tr>
                {["Order","Customer","Amount","Payment","Status","Date","Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 label-luxury text-[#7A8F7C]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[#2A3A2C] hover:bg-[#1D2B1F] transition-colors">
                  <td className="px-5 py-4 text-[#D0D8D2] font-light text-xs">{order.orderNumber}</td>
                  <td className="px-5 py-4">
                    <p className="text-[#F5F0E8] font-light">{order.user?.name}</p>
                    <p className="text-xs text-[#7A8F7C] mt-0.5">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#C17A35] font-light">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4 text-[#7A8F7C] font-light text-xs">{order.paymentMethod}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-light ${STATUS_STYLES[order.status] || ""}`}>
                      {order.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#7A8F7C] font-light text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openOrder(order)}
                      className="px-3 py-1.5 border border-[#2D5A32] text-[#9AAA9C] hover:border-[#C17A35] hover:text-[#F5F0E8] text-xs font-light rounded-lg transition-all"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg bg-[#162018] border-[#2A3A2C] text-[#F5F0E8]">
          <DialogHeader>
            <DialogTitle className="font-heading text-[#F5F0E8] font-light text-xl">
              Order: {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5">
              <div className="bg-[#0D1A10] border border-[#2A3A2C] rounded-xl p-4 text-sm space-y-2">
                <p className="flex justify-between"><span className="text-[#7A8F7C] font-light">Customer</span><span className="text-[#F5F0E8]">{selectedOrder.user?.name}</span></p>
                <p className="flex justify-between"><span className="text-[#7A8F7C] font-light">Amount</span><span className="text-[#C17A35]">{formatPrice(selectedOrder.total)}</span></p>
                <p className="flex justify-between"><span className="text-[#7A8F7C] font-light">Payment</span><span className="text-[#F5F0E8]">{selectedOrder.paymentMethod}</span></p>
              </div>

              <div>
                <p className="label-luxury text-[#C17A35] mb-3">Items</p>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-[#2A3A2C]">
                    <span className="text-[#D0D8D2] font-light">{item.productName} × {item.quantity}</span>
                    <span className="text-[#C17A35] font-light">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="label-luxury text-[#9AAA9C] block mb-2">Update Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#162018] border-[#2A3A2C]">
                    {ALL_STATUSES.filter((s) => s !== "ALL").map((s) => (
                      <SelectItem key={s} value={s} className="text-[#D0D8D2] focus:bg-[#1D2B1F]">{s.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="label-luxury text-[#9AAA9C] block mb-2">Tracking Number</label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2.5 bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl font-light text-sm focus:outline-none focus:border-[#2D5A32]"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 border border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35] text-sm font-light rounded-xl transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => updateMutation.mutate({ id: selectedOrder.id, status: newStatus, tracking: trackingNumber })}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2.5 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 text-white text-sm font-light rounded-xl transition-colors"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Order"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
