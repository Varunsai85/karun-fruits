import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import GoogleSignInButton from "@/components/common/GoogleSignInButton";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", referralCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        referralCode: form.referralCode || undefined,
      });
      setRegisteredEmail(form.email);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon: Icon, type = "text", field, placeholder }) => (
    <div>
      <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">{label}</Label>
      <div className="relative mt-2">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
        <Input
          type={type}
          placeholder={placeholder}
          value={form[field]}
          onChange={update(field)}
          className="pl-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2A3A2C]"
          required
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0D1A10] flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-10">
          <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Create Account</h1>
          <p className="text-[#9AAA9C] text-sm mt-2 font-light">Join thousands of happy customers</p>
        </div>

        <AnimatePresence mode="wait">
          {registeredEmail ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-14 h-14 text-[#C17A35]" />
              </div>
              <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-2">Check Your Email</h2>
              <p className="text-[#9AAA9C] text-sm font-light mb-1">
                We've sent a verification link to
              </p>
              <p className="text-[#F5F0E8] font-medium mb-5">{registeredEmail}</p>
              <p className="text-[#9AAA9C] text-xs font-light leading-relaxed mb-6">
                Click the link in the email to activate your account. The link expires in 24 hours.
              </p>
              <Link
                to="/login"
                className="inline-block px-8 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-xl transition-colors text-sm"
              >
                Go to Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8"
            >
              <GoogleSignInButton onSuccess={({ user, token }) => { login(user, token); toast.success(`Welcome to Karun Fruits, ${user.name}!`); navigate("/"); }} />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#2A3A2C]" />
                <span className="text-[#5A6A5C] text-xs font-light tracking-wide">OR</span>
                <div className="flex-1 h-px bg-[#2A3A2C]" />
              </div>

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

                <Field label="Confirm Password" icon={Lock} field="confirmPassword" placeholder="Repeat your password" type="password" />

                <div>
                  <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">
                    Referral Code <span className="text-[#5A6A5C]">(optional)</span>
                  </Label>
                  <div className="relative mt-2">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
                    <Input
                      type="text"
                      placeholder="Enter referral code"
                      value={form.referralCode}
                      onChange={update("referralCode")}
                      className="pl-10 bg-[#0D1A10] border-[#2A3A2C] text-[#F5F0E8] placeholder:text-[#5A6A5C] focus-visible:ring-[#1E4620] focus-visible:border-[#2A3A2C] uppercase"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#C17A35] hover:bg-[#A86929] disabled:opacity-60 text-white font-light tracking-wide rounded-xl transition-colors mt-2"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-[#9AAA9C]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#C17A35] hover:text-[#A86929] transition-colors">
                  Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
