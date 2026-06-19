import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

const EMPTY = {
  code: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "",
  maxDiscount: "", usageLimit: 0, expiresAt: "", active: true,
};

function fmt(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No expiry"; }

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => api.get("/admin/coupons"),
  });

  const saveMutation = useMutation({
    mutationFn: ({ mode, id, data }) =>
      mode === "edit" ? api.put(`/admin/coupons/${id}`, data) : api.post("/admin/coupons", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success(modal?.mode === "edit" ? "Coupon updated" : "Coupon created");
      setModal(null);
    },
    onError: () => toast.error("Failed to save coupon"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
      setDeleteId(null);
    },
  });

  const openCreate = () => { setForm(EMPTY); setModal({ mode: "create" }); };
  const openEdit = (c) => {
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || "", maxDiscount: c.maxDiscount || "",
      usageLimit: c.usageLimit, expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "", active: c.active,
    });
    setModal({ mode: "edit", id: c.id });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) { toast.error("Code and discount value are required"); return; }
    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
      expiresAt: form.expiresAt ? form.expiresAt + "T23:59:59" : null,
    };
    saveMutation.mutate({ mode: modal.mode, id: modal.id, data: payload });
  };

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F5F0E8] text-2xl font-light">Coupons</h1>
          <p className="text-[#9AAA9C] text-sm mt-0.5">{coupons.length} coupons</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-[#2A3A2C] border-t-[#C17A35] rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-[#9AAA9C]">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No coupons yet.</p>
        </div>
      ) : (
        <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3A2C]">
                {["Code", "Discount", "Min Order", "Used", "Expires", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#9AAA9C] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-[#2A3A2C]/50 hover:bg-[#1E2E20] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#C17A35] font-medium">{c.code}</td>
                  <td className="px-4 py-3 text-[#F5F0E8]">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    {c.maxDiscount && c.discountType === "PERCENTAGE" && (
                      <span className="text-[#9AAA9C] text-xs ml-1">(max ₹{c.maxDiscount})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#9AAA9C]">{c.minOrderAmount ? `₹${c.minOrderAmount}` : "—"}</td>
                  <td className="px-4 py-3 text-[#9AAA9C]">
                    {c.usedCount}{c.usageLimit > 0 ? `/${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[#9AAA9C]">{fmt(c.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-[#2A3A2C] rounded-lg text-[#9AAA9C] hover:text-[#F5F0E8]"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-red-900/30 rounded-lg text-[#9AAA9C] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#F5F0E8] font-medium">{modal.mode === "edit" ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setModal(null)} className="text-[#9AAA9C] hover:text-[#F5F0E8]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Code *</label>
                <input value={form.code} onChange={f("code")} placeholder="SAVE20" className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm uppercase placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AAA9C] text-xs mb-1">Discount Type</label>
                  <select value={form.discountType} onChange={f("discountType")} className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#9AAA9C] text-xs mb-1">Discount Value *</label>
                  <input type="number" value={form.discountValue} onChange={f("discountValue")} placeholder={form.discountType === "PERCENTAGE" ? "20" : "50"} className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AAA9C] text-xs mb-1">Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={f("minOrderAmount")} placeholder="500" className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]" />
                </div>
                {form.discountType === "PERCENTAGE" && (
                  <div>
                    <label className="block text-[#9AAA9C] text-xs mb-1">Max Discount (₹)</label>
                    <input type="number" value={form.maxDiscount} onChange={f("maxDiscount")} placeholder="200" className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9AAA9C] text-xs mb-1">Usage Limit (0 = unlimited)</label>
                  <input type="number" value={form.usageLimit} onChange={f("usageLimit")} className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]" />
                </div>
                <div>
                  <label className="block text-[#9AAA9C] text-xs mb-1">Expires On</label>
                  <input type="date" value={form.expiresAt} onChange={f("expiresAt")} className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={f("active")} className="rounded" />
                <span className="text-[#9AAA9C] text-sm">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-[#2A3A2C] rounded-lg text-[#9AAA9C] text-sm">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 rounded-lg text-white text-sm">
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="text-[#F5F0E8] mb-2">Delete this coupon?</p>
            <p className="text-[#9AAA9C] text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-[#2A3A2C] rounded-lg text-[#9AAA9C] text-sm">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg text-white text-sm">
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
