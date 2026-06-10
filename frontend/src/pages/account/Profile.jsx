import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { toast } from "sonner";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/users/profile", form);
      updateUser(res);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-7">
        <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-7">My Profile</h2>
        <div className="space-y-5 max-w-md">
          <div>
            <label className="flex items-center gap-2 text-xs font-light tracking-widest uppercase text-[#9AAA9C] mb-2">
              <User className="w-3.5 h-3.5 text-[#C17A35]" /> Full Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] rounded-xl font-light focus:outline-none focus:border-[#2A3A2C]"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-light tracking-widest uppercase text-[#9AAA9C] mb-2">
              <Mail className="w-3.5 h-3.5 text-[#C17A35]" /> Email Address
            </label>
            <input
              value={user?.email}
              disabled
              className="w-full px-4 py-3 bg-[#0D1A10] border border-[#2A3A2C] text-[#5A6A5C] rounded-xl font-light cursor-not-allowed"
            />
            <p className="text-xs text-[#5A6A5C] mt-1.5 font-light">Email cannot be changed</p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-light tracking-widest uppercase text-[#9AAA9C] mb-2">
              <Phone className="w-3.5 h-3.5 text-[#C17A35]" /> Phone Number
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              maxLength={10}
              className="w-full px-4 py-3 bg-[#0D1A10] border border-[#2A3A2C] text-[#F5F0E8] rounded-xl font-light focus:outline-none focus:border-[#2A3A2C]"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-7 py-3 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 text-white font-light tracking-wide rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
