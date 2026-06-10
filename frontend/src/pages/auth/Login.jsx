import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate(redirect);
    } catch (err) {
      toast.error(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#0D1A10] flex items-center justify-center px-4 py-16">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <span className="label-luxury text-[#7A8F7C] block mb-0.5">Est. 2005 · Mumbai</span>
            <span className="font-heading text-[#F5F0E8] text-2xl font-light tracking-widest">
              KARUN <span className="font-medium">FRUITS</span>
            </span>
          </Link>
          <div className="h-px w-16 bg-[#C17A35]/40 mx-auto mb-6" />
          <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Welcome Back</h1>
          <p className="text-[#7A8F7C] text-sm mt-2 font-light">Sign in to your account</p>
        </div>

        <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">Email Address</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2D5A32]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">Password</Label>
                <Link to="/forgot-password" className="text-xs text-[#C17A35] hover:text-[#D4913F] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-10 pr-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2D5A32]"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A5C] hover:text-[#9AAA9C] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 text-white font-light tracking-wide rounded-xl transition-colors mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#7A8F7C]">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#C17A35] hover:text-[#D4913F] transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
