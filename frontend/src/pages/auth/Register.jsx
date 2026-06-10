import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await authService.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.user, res.token);
      toast.success("Welcome to Karun Fruits!");
      navigate("/");
    } catch (err) {
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon: Icon, type = "text", field, placeholder, extra }) => (
    <div>
      <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">{label}</Label>
      <div className="relative mt-2">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
        <Input
          type={type}
          placeholder={placeholder}
          value={form[field]}
          onChange={update(field)}
          className="pl-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2D5A32]"
          required
          {...extra}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] bg-[#0D1A10] flex items-center justify-center px-4 py-16">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <span className="label-luxury text-[#7A8F7C] block mb-0.5">Est. 2005 · Mumbai</span>
            <span className="font-heading text-[#F5F0E8] text-2xl font-light tracking-widest">
              KARUN <span className="font-medium">FRUITS</span>
            </span>
          </Link>
          <div className="h-px w-16 bg-[#C17A35]/40 mx-auto mb-6" />
          <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Create Account</h1>
          <p className="text-[#7A8F7C] text-sm mt-2 font-light">Join thousands of happy customers</p>
        </div>

        <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name"       icon={User}  field="name"            placeholder="John Doe" />
            <Field label="Email Address"   icon={Mail}  field="email"           placeholder="you@example.com" type="email" />
            <Field label="Phone Number"    icon={Phone} field="phone"           placeholder="9876543210" />

            <div>
              <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={update("password")}
                  className="pl-10 pr-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2D5A32]"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A5C] hover:text-[#9AAA9C] transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Field label="Confirm Password" icon={Lock} field="confirmPassword" placeholder="Repeat your password" type="password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 text-white font-light tracking-wide rounded-xl transition-colors mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#7A8F7C]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#C17A35] hover:text-[#D4913F] transition-colors">Sign In</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
