import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Home, Briefcase, Map } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";

const TYPE_ICONS = { HOME: Home, OFFICE: Briefcase, OTHER: Map };
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
];

const EMPTY_FORM = {
  name: "", addressLine1: "", addressLine2: "", city: "", state: "",
  pincode: "", phone: "", type: "HOME", isDefault: false,
};

export default function Addresses() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => userService.getAddresses().then((r) => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (data) => userService.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added");
      resetForm();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to add address"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated");
      resetForm();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update address"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed");
    },
    onError: () => toast.error("Failed to remove address"),
  });

  const defaultMutation = useMutation({
    mutationFn: (id) => userService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    },
  });

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
  }

  function openEdit(address) {
    setForm({
      name: address.name || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      phone: address.phone || "",
      type: address.type || "HOME",
      isDefault: address.isDefault || false,
    });
    setEditing(address.id);
    setShowForm(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing, data: form });
    } else {
      addMutation.mutate(form);
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-7">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-heading text-[#F5F0E8] text-2xl font-light">My Addresses</h2>
          {!showForm && addresses.length < 5 && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm font-light rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="border border-[#2A3A2C] rounded-xl p-6 mb-6 space-y-4 overflow-hidden"
            >
              <h3 className="font-heading text-[#F5F0E8] text-lg font-light">
                {editing ? "Edit Address" : "Add New Address"}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
              </div>

              <Field label="Address Line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} required />
              <Field label="Address Line 2 (optional)" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} />

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                <div>
                  <label className="text-xs text-[#9AAA9C] font-light block mb-1.5">State *</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                    className="w-full bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] rounded-xl px-3 py-2.5 text-sm font-light focus:outline-none focus:border-[#C17A35]/50"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <Field label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} required maxLength={6} />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-[#9AAA9C] font-light">Type:</span>
                {["HOME", "OFFICE", "OTHER"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-4 py-1.5 rounded-full text-xs font-light border transition-colors ${
                      form.type === t
                        ? "bg-[#C17A35]/20 border-[#C17A35] text-[#C17A35]"
                        : "border-[#2A3A2C] text-[#9AAA9C] hover:border-[#C17A35]/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[#C17A35]"
                />
                <span className="text-sm text-[#9AAA9C] font-light">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-7 py-2.5 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm font-light rounded-full transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editing ? "Update" : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-7 py-2.5 border border-[#2A3A2C] text-[#9AAA9C] hover:text-[#F5F0E8] text-sm font-light rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-28 bg-[#1D2B1F] rounded-xl animate-pulse" />)}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-14">
            <MapPin className="w-12 h-12 text-[#5A6A5C] mx-auto mb-4" />
            <h3 className="font-heading text-[#F5F0E8] text-xl font-light mb-2">No addresses saved</h3>
            <p className="text-[#9AAA9C] font-light text-sm">Add a delivery address to speed up checkout</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const Icon = TYPE_ICONS[address.type] || Home;
              return (
                <div
                  key={address.id}
                  className={`border rounded-xl p-5 transition-colors ${
                    address.isDefault
                      ? "border-[#C17A35]/50 bg-[#C17A35]/5"
                      : "border-[#2A3A2C] hover:border-[#2A3A2C]/80"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-[#9AAA9C] mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#F5F0E8] text-sm font-light">{address.name}</span>
                          {address.isDefault && (
                            <span className="flex items-center gap-1 text-[10px] text-[#C17A35] bg-[#C17A35]/15 border border-[#C17A35]/30 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-2.5 h-2.5" /> Default
                            </span>
                          )}
                          <span className="text-[10px] text-[#9AAA9C] border border-[#2A3A2C] px-2 py-0.5 rounded-full">
                            {address.type}
                          </span>
                        </div>
                        <p className="text-[#9AAA9C] text-sm font-light leading-relaxed">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                          <br />
                          {address.city}, {address.state} – {address.pincode}
                        </p>
                        <p className="text-[#9AAA9C] text-xs mt-1 font-light">{address.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!address.isDefault && (
                        <button
                          onClick={() => defaultMutation.mutate(address.id)}
                          className="text-xs text-[#9AAA9C] hover:text-[#C17A35] font-light transition-colors px-2 py-1"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(address)}
                        className="p-1.5 text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(address.id)}
                        className="p-1.5 text-[#9AAA9C] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Field({ label, value, onChange, required, maxLength }) {
  return (
    <div>
      <label className="text-xs text-[#9AAA9C] font-light block mb-1.5">{label} {required && "*"}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        className="w-full bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] rounded-xl px-3 py-2.5 text-sm font-light focus:outline-none focus:border-[#C17A35]/50"
      />
    </div>
  );
}
