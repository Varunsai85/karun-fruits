import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

const EMPTY = { name: "", description: "", imageUrl: "", sortOrder: 0 };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data }
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get("/admin/categories"),
  });

  const saveMutation = useMutation({
    mutationFn: ({ mode, id, data }) =>
      mode === "edit" ? api.put(`/admin/categories/${id}`, data) : api.post("/admin/categories", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(modal?.mode === "edit" ? "Category updated" : "Category created");
      closeModal();
    },
    onError: () => toast.error("Failed to save category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const openCreate = () => { setForm(EMPTY); setModal({ mode: "create" }); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description || "", imageUrl: cat.imageUrl || "", sortOrder: cat.sortOrder }); setModal({ mode: "edit", id: cat.id }); };
  const closeModal = () => setModal(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Category name is required"); return; }
    saveMutation.mutate({ mode: modal.mode, id: modal.id, data: form });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F5F0E8] text-2xl font-light">Categories</h1>
          <p className="text-[#9AAA9C] text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-[#2A3A2C] border-t-[#C17A35] rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-[#9AAA9C]">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No categories yet. Add your first one.</p>
        </div>
      ) : (
        <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3A2C]">
                <th className="text-left px-4 py-3 text-[#9AAA9C] font-normal">Name</th>
                <th className="text-left px-4 py-3 text-[#9AAA9C] font-normal">Slug</th>
                <th className="text-left px-4 py-3 text-[#9AAA9C] font-normal">Description</th>
                <th className="text-center px-4 py-3 text-[#9AAA9C] font-normal">Sort</th>
                <th className="text-center px-4 py-3 text-[#9AAA9C] font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-[#2A3A2C]/50 hover:bg-[#1E2E20] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#2A3A2C] flex items-center justify-center">
                          <Tag className="w-4 h-4 text-[#5A6A5C]" />
                        </div>
                      )}
                      <span className="text-[#F5F0E8] font-medium">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#9AAA9C] font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-[#9AAA9C] max-w-[200px] truncate">{cat.description || "—"}</td>
                  <td className="px-4 py-3 text-center text-[#9AAA9C]">{cat.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.active ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                      {cat.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-[#2A3A2C] rounded-lg text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(cat.id)} className="p-1.5 hover:bg-red-900/30 rounded-lg text-[#9AAA9C] hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#F5F0E8] font-medium">{modal.mode === "edit" ? "Edit Category" : "New Category"}</h2>
              <button onClick={closeModal} className="text-[#9AAA9C] hover:text-[#F5F0E8]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {[
                { label: "Name *", key: "name", placeholder: "e.g. Almonds" },
                { label: "Description", key: "description", placeholder: "Short description" },
                { label: "Image URL", key: "imageUrl", placeholder: "https://..." },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[#9AAA9C] text-xs mb-1">{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border border-[#2A3A2C] rounded-lg text-[#9AAA9C] hover:text-[#F5F0E8] text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-2 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 rounded-lg text-white text-sm transition-colors">
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="text-[#F5F0E8] mb-2">Delete this category?</p>
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
