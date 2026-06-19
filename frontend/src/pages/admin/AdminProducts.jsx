import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Eye, EyeOff, X, Package } from "lucide-react";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/admin/Skeletons";

const EMPTY_FORM = { name: "", categoryId: "", price: "", salePrice: "", weight: "", unit: "g", stock: "", description: "", sku: "", active: true };

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | { mode: "create" | "edit" }
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => api.get("/admin/products", { params: { search, size: 50 } }),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories"),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingProduct
      ? api.put(`/admin/products/${editingProduct.id}`, data)
      : api.post("/admin/products", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editingProduct ? "Product updated!" : "Product created!");
      setModal(null);
    },
    onError: () => toast.error("Failed to save product"),
  });

  const toggleMutation = useMutation({
    mutationFn: (product) => api.patch(`/admin/products/${product.id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const products = data?.content || [];

  const openCreate = () => { setEditingProduct(null); setForm(EMPTY_FORM); setModal({ mode: "create" }); };
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, categoryId: p.category?.id || "", price: p.price, salePrice: p.salePrice || "", weight: p.weight || "", unit: p.unit || "g", stock: p.stock, description: p.description || "", sku: p.sku || "", active: p.active });
    setModal({ mode: "edit" });
  };

  const update = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F5F0E8] text-2xl font-light">Products</h1>
          <p className="text-[#9AAA9C] text-sm mt-0.5">{products.length} products</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl p-4 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-lg text-sm focus:outline-none focus:border-[#C17A35]"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-[#9AAA9C]">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No products yet. Add your first one.</p>
        </div>
      ) : (
        <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A3A2C]">
                  {["Product", "Category", "Price", "Stock", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[#9AAA9C] font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[#2A3A2C]/50 hover:bg-[#1E2E20] transition-colors">
                    <td className="px-4 py-3 text-[#F5F0E8] font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-[#9AAA9C]">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#C17A35]">{formatPrice(p.salePrice || p.price)}</span>
                      {p.salePrice && <span className="text-xs text-[#5A6A5C] line-through ml-1">{formatPrice(p.price)}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.stock === 0 ? "text-red-400" : p.stock < 10 ? "text-orange-400" : "text-emerald-400"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-[#2A3A2C] rounded-lg text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleMutation.mutate(p)} className="p-1.5 hover:bg-[#2A3A2C] rounded-lg text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors">
                          {p.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#F5F0E8] font-medium">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setModal(null)} className="text-[#9AAA9C] hover:text-[#F5F0E8]"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[#9AAA9C] text-xs mb-1">Product Name *</label>
                <input value={form.name} onChange={update("name")} placeholder="e.g. Premium California Almonds"
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
              </div>
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Category *</label>
                <select value={form.categoryId} onChange={update("categoryId")}
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]">
                  <option value="">Select Category</option>
                  {(Array.isArray(categories) ? categories : []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">SKU</label>
                <input value={form.sku} onChange={update("sku")} placeholder="e.g. ALM-500G"
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
              </div>
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Price (₹) *</label>
                <input type="number" value={form.price} onChange={update("price")} placeholder="599"
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
              </div>
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Sale Price (₹)</label>
                <input type="number" value={form.salePrice} onChange={update("salePrice")} placeholder="499 (optional)"
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
              </div>
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Weight</label>
                <input type="number" value={form.weight} onChange={update("weight")} placeholder="500"
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
              </div>
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Unit</label>
                <select value={form.unit} onChange={update("unit")}
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C17A35]">
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="pcs">Pieces</option>
                </select>
              </div>
              <div>
                <label className="block text-[#9AAA9C] text-xs mb-1">Stock *</label>
                <input type="number" value={form.stock} onChange={update("stock")} placeholder="50"
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[#9AAA9C] text-xs mb-1">Description</label>
                <textarea value={form.description} onChange={update("description")} rows={4}
                  placeholder="Describe the product..."
                  className="w-full bg-[#0D1A10] border border-[#2A3A2C] rounded-lg px-3 py-2 text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35] resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-[#2A3A2C] rounded-lg text-[#9AAA9C] hover:text-[#F5F0E8] text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                className="flex-1 py-2 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 rounded-lg text-white text-sm transition-colors"
              >
                {saveMutation.isPending ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
