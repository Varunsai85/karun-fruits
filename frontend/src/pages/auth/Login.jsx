import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import GoogleSignInButton from "@/components/common/GoogleSignInButton";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    setUnverifiedEmail(null);
    try {
      const res = await authService.login(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(redirect);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      if (msg === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(form.email);
      } else {
        toast.error(msg || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendLoading(true);
    try {
      await authService.resendVerification(unverifiedEmail);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend email");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0D1A10] flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Welcome Back</h1>
          <p className="text-[#9AAA9C] text-sm mt-2 font-light">Sign in to your account</p>
        </div>

        <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8">
          {/* Email not verified banner */}
          {unverifiedEmail && (
            <div className="mb-5 p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl text-sm">
              <p className="text-amber-300 font-medium mb-1">Email not verified</p>
              <p className="text-amber-200/80 text-xs mb-3">
                Please check your inbox for the verification link sent to{" "}
                <span className="font-medium">{unverifiedEmail}</span>.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="text-xs text-amber-300 hover:text-amber-200 underline underline-offset-2 disabled:opacity-50 transition-colors"
              >
                {resendLoading ? "Sending..." : "Resend verification email"}
              </button>
            </div>
          )}

          {/* Google Sign-In */}
          <GoogleSignInButton onSuccess={({ user, token }) => { login(user, token); toast.success(`Welcome, ${user.name}!`); navigate(redirect); }} />
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#2A3A2C]" />
            <span className="text-[#5A6A5C] text-xs font-light tracking-wide">OR</span>
            <div className="flex-1 h-px bg-[#2A3A2C]" />
          </div>

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
                  className="pl-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2A3A2C]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#C17A35] hover:text-[#A86929] transition-colors"
                >
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
                  className="pl-10 pr-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2A3A2C]"
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

          <div className="mt-6 text-center text-sm text-[#9AAA9C]">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#C17A35] hover:text-[#A86929] transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
