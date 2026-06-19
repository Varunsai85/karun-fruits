import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, ShieldCheck, Ban } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

function Avatar({ name }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#C17A35]/20 flex items-center justify-center text-[#C17A35] font-medium text-sm flex-shrink-0">
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers", page],
    queryFn: () => api.get(`/admin/customers?page=${page}&size=20`),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => api.put(`/admin/users/${id}`, { active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("Customer status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const customers = data?.content || [];
  const total = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  const filtered = search
    ? customers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search))
    : customers;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#F5F0E8] text-2xl font-light">Customers</h1>
          <p className="text-[#9AAA9C] text-sm mt-0.5">{total} registered customers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="pl-9 pr-4 py-2 bg-[#162018] border border-[#2A3A2C] rounded-lg text-[#F5F0E8] text-sm placeholder:text-[#5A6A5C] focus:outline-none focus:border-[#C17A35] w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-[#2A3A2C] border-t-[#C17A35] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#9AAA9C]">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? "No customers match your search." : "No customers yet."}</p>
        </div>
      ) : (
        <div className="bg-[#162018] border border-[#2A3A2C] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A3A2C]">
                {["Customer", "Email", "Phone", "Loyalty Points", "Joined", "Verified", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[#9AAA9C] font-normal text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-[#2A3A2C]/50 hover:bg-[#1E2E20] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div>
                        <p className="text-[#F5F0E8] font-medium">{c.name}</p>
                        <p className="text-[#9AAA9C] text-xs">{c.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#9AAA9C]">{c.email}</td>
                  <td className="px-4 py-3 text-[#9AAA9C]">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-[#C17A35] font-medium">{c.loyaltyPoints}</td>
                  <td className="px-4 py-3 text-[#9AAA9C] text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.emailVerified ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-xs text-amber-400">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                      {c.active ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ id: c.id, active: !c.active })}
                      disabled={c.role === "ADMIN" || toggleMutation.isPending}
                      title={c.role === "ADMIN" ? "Cannot change admin status" : c.active ? "Ban user" : "Activate user"}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        c.active
                          ? "hover:bg-red-900/30 text-[#9AAA9C] hover:text-red-400"
                          : "hover:bg-emerald-900/30 text-[#9AAA9C] hover:text-emerald-400"
                      }`}
                    >
                      {c.active ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A3A2C]">
              <span className="text-[#9AAA9C] text-xs">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 text-xs bg-[#0D1A10] border border-[#2A3A2C] rounded text-[#9AAA9C] disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="px-3 py-1 text-xs bg-[#0D1A10] border border-[#2A3A2C] rounded text-[#9AAA9C] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
