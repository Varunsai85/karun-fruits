import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Image, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { CardListSkeleton } from "@/components/admin/Skeletons";

const EMPTY = { title: "", subtitle: "", imageUrl: "", link: "", sortOrder: 0 };

export default function AdminBanners() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => api.get("/admin/banners"),
  });

  const saveMutation = useMutation({
    mutationFn: ({ mode, id, data }) =>
      mode === "edit" ? api.put(`/admin/banners/${id}`, data) : api.post("/admin/banners", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success(modal?.mode === "edit" ? "Banner updated" : "Banner created");
      setModal(null);
    },
    onError: () => toast.error("Failed to save banner"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/banners/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted");
      setDeleteId(null);
    },
  });

  const openCreate = () => { setForm(EMPTY); setModal({ mode: "create" }); };
  const openEdit = (b) => {
    setForm({ title: b.title, subtitle: b.subtitle || "", imageUrl: b.imageUrl, link: b.link || "", sortOrder: b.sortOrder });
    setModal({ mode: "edit", id: b.id });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim()) { toast.error("Title and image URL are required"); return; }
    saveMutation.mutate({ mode: modal.mode, id: modal.id, data: form });
  };

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F5F0E8] text-2xl font-light">Banners</h1>
          <p className="text-[#9AAA9C] text-sm mt-0.5">{banners.length} banners</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {isLoading ? (
        <CardListSkeleton rows={3} />
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-[#9AAA9C]">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No banners yet. Add your first banner.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map(b => (
            <div key={b.id} className={`bg-[#162018] border rounded-xl overflow-hidden flex ${b.active ? "border-[#2A3A2C]" : "border-[#2A3A2C]/50 opacity-60"}`}>
              <div className="w-40 h-24 bg-[#0D1A10] flex-shrink-0 overflow-hidden">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-[#5A6A5C]" />
                  </div>
                )}
              </div>
              <div className="flex-1 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[#F5F0E8] font-medium">{b.title}</p>
                  {b.subtitle && <p className="text-[#9AAA9C] text-sm mt-0.5">{b.subtitle}</p>}
                  {b.link && (
                    <p className="text-[#C17A35] text-xs mt-1 font-mono truncate max-w-xs">{b.link}</p>
                  )}
                  <p className="text-[#5A6A5C] text-xs mt-1">Sort: {b.sortOrder}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleMutation.mutate(b.id)} className="text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors">
                    {b.active ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-[#2A3A2C] rounded-lg text-[#9AAA9C] hover:text-[#F5F0E8]">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(b.id)} className="p-1.5 hover:bg-red-900/30 rounded-lg text-[#9AAA9C] hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#F5F0E8] font-medium">{modal.mode === "edit" ? "Edit Banner" : "New Banner"}</h2>
              <button onClick={() => setModal(null)} className="text-[#9AAA9C] hover:text-[#F5F0E8]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: "Title *", key: "title", placeholder: "Summer Sale — Up to 30% Off" },
                { label: "Subtitle", key: "subtitle", placeholder: "On premium almonds & cashews" },
                { label: "Image URL *", key: "imageUrl", placeholder: "https://..." },
                { label: "Link (optional)", key: "link", placeholder: "/products?category=cashews" },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-[#9AAA9C] text-xs mb-1">{field.label}</label>
                  <input value={form[field.key]} onChange={f(field.key)} placeholder={field.placeholder}
                    className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
                </div>
              ))}
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]" />
              </div>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" className="w-full h-24 object-cover rounded-lg border border-[#2A3A2C]" onError={e => e.target.style.display = "none"} />
              )}
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
            <p className="text-[#F5F0E8] mb-2">Delete this banner?</p>
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
