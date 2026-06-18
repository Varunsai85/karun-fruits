import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { toast.error("Invalid reset link"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] bg-[#0D1A10] flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <p className="text-[#9AAA9C] mb-4">Invalid reset link.</p>
          <Link to="/forgot-password" className="text-[#C17A35] hover:text-[#A86929]">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

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
            <span className="label-luxury text-[#9AAA9C] block mb-0.5">Est. 2005 · Mumbai</span>
            <span className="font-heading text-[#F5F0E8] text-2xl font-light tracking-widest">
              KARUN <span className="font-medium">FRUITS</span>
            </span>
          </Link>
          <div className="h-px w-16 bg-[#C17A35]/40 mx-auto mb-6" />
          <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">New Password</h1>
          <p className="text-[#9AAA9C] text-sm mt-2 font-light">Enter a strong new password</p>
        </div>

        <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h2 className="font-heading text-[#F5F0E8] text-xl font-light mb-2">
                  Password Updated!
                </h2>
                <p className="text-[#9AAA9C] text-sm font-light mb-6">
                  Your password has been reset. Redirecting you to sign in…
                </p>
                <Link
                  to="/login"
                  className="inline-block px-8 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-xl transition-colors text-sm"
                >
                  Sign In
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">New Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
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

                <div>
                  <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
                    <Input
                      type="password"
                      placeholder="Repeat your new password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="pl-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2A3A2C]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 text-white font-light tracking-wide rounded-xl transition-colors"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="text-center text-sm text-[#9AAA9C]">
                  <Link to="/login" className="text-[#C17A35] hover:text-[#A86929] transition-colors">
                    Back to Sign In
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
