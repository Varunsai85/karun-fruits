import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const EMPTY_FORM = { name: "", categoryId: "", price: "", salePrice: "", weight: "", unit: "g", stock: "", description: "", sku: "", active: true };

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data } = useQuery({
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
      setShowModal(false);
    },
    onError: () => toast.error("Failed to save product"),
  });

  const toggleMutation = useMutation({
    mutationFn: (product) => api.patch(`/admin/products/${product.id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const products = data?.content || [];

  const openCreate = () => { setEditingProduct(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, categoryId: p.category?.id || "", price: p.price, salePrice: p.salePrice || "", weight: p.weight || "", unit: p.unit || "g", stock: p.stock, description: p.description || "", sku: p.sku || "", active: p.active });
    setShowModal(true);
  };

  const update = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3D2000]">Products</h1>
        <Button className="bg-[#C8860A] hover:bg-[#8B4513] text-white gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8D5B5] p-5 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6914]" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8D5B5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5ECD7] border-b border-[#E8D5B5]">
              <tr>
                <th className="text-left px-5 py-3 text-[#8B6914] font-semibold">Product</th>
                <th className="text-left px-5 py-3 text-[#8B6914] font-semibold">Category</th>
                <th className="text-left px-5 py-3 text-[#8B6914] font-semibold">Price</th>
                <th className="text-left px-5 py-3 text-[#8B6914] font-semibold">Stock</th>
                <th className="text-left px-5 py-3 text-[#8B6914] font-semibold">Status</th>
                <th className="text-left px-5 py-3 text-[#8B6914] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[#F5ECD7] hover:bg-[#FDF8F0] transition-colors">
                  <td className="px-5 py-4 font-medium text-[#3D2000]">{p.name}</td>
                  <td className="px-5 py-4 text-[#8B6914]">{p.category?.name}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-[#C8860A]">{formatPrice(p.salePrice || p.price)}</span>
                    {p.salePrice && <span className="text-xs text-[#8B6914] line-through ml-1">{formatPrice(p.price)}</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-medium ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-orange-500" : "text-green-600"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge className={p.active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"}>
                      {p.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#8B6914] hover:text-[#C8860A]" onClick={() => openEdit(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#8B6914] hover:text-[#C8860A]"
                        onClick={() => toggleMutation.mutate(p)}>
                        {p.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#3D2000]">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4 py-4">
            <div className="sm:col-span-2">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={update("name")} placeholder="e.g. Premium California Almonds"
                className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
            </div>
            <div>
              <Label>Category *</Label>
              <select value={form.categoryId} onChange={update("categoryId")}
                className="mt-1 w-full h-10 px-3 rounded-md border border-[#E8D5B5] text-sm focus:outline-none focus:ring-2 focus:ring-[#C8860A] bg-white">
                <option value="">Select Category</option>
                {(Array.isArray(categories) ? categories : []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>SKU</Label>
              <Input value={form.sku} onChange={update("sku")} placeholder="e.g. ALM-500G"
                className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
            </div>
            <div>
              <Label>Price (₹) *</Label>
              <Input type="number" value={form.price} onChange={update("price")} placeholder="599"
                className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
            </div>
            <div>
              <Label>Sale Price (₹)</Label>
              <Input type="number" value={form.salePrice} onChange={update("salePrice")} placeholder="499 (optional)"
                className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
            </div>
            <div>
              <Label>Weight</Label>
              <Input type="number" value={form.weight} onChange={update("weight")} placeholder="500"
                className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
            </div>
            <div>
              <Label>Unit</Label>
              <select value={form.unit} onChange={update("unit")}
                className="mt-1 w-full h-10 px-3 rounded-md border border-[#E8D5B5] text-sm focus:outline-none focus:ring-2 focus:ring-[#C8860A] bg-white">
                <option value="g">Grams (g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="pcs">Pieces</option>
              </select>
            </div>
            <div>
              <Label>Stock *</Label>
              <Input type="number" value={form.stock} onChange={update("stock")} placeholder="50"
                className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A]" />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={update("description")} rows={4}
                placeholder="Describe the product..." className="mt-1 border-[#E8D5B5] focus-visible:ring-[#C8860A] resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1 bg-[#C8860A] hover:bg-[#8B4513] text-white"
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
