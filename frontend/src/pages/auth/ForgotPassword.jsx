import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!email) { setFormError("Please enter your email address"); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setFormError(err?.message || "Something went wrong. Please try again.");
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
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <span className="label-luxury text-[#9AAA9C] block mb-0.5">Est. 2005 · Mumbai</span>
            <span className="font-heading text-[#F5F0E8] text-2xl font-light tracking-widest">
              KARUN <span className="font-medium">FRUITS</span>
            </span>
          </Link>
          <div className="h-px w-16 bg-[#C17A35]/40 mx-auto mb-6" />
          <h1 className="font-heading text-[#F5F0E8] text-3xl font-light">Reset Password</h1>
          <p className="text-[#9AAA9C] text-sm mt-2 font-light">
            We'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <CheckCircle className="w-12 h-12 text-[#C17A35] mx-auto mb-4" />
                <h2 className="font-heading text-[#F5F0E8] text-xl font-light mb-2">Check Your Email</h2>
                <p className="text-[#9AAA9C] text-sm font-light mb-1">
                  If an account exists for
                </p>
                <p className="text-[#F5F0E8] font-medium mb-4">{email}</p>
                <p className="text-[#9AAA9C] text-xs font-light leading-relaxed mb-6">
                  you'll receive a password reset link shortly. The link expires in 1 hour.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-8 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-xl transition-colors text-sm"
                >
                  Back to Sign In
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
                {formError && (
                  <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-sm">
                    <p className="text-red-300">{formError}</p>
                  </div>
                )}

                <div>
                  <Label className="text-[#9AAA9C] text-xs font-light tracking-wide">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A5C]" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center text-sm text-[#9AAA9C]">
                  Remembered your password?{" "}
                  <Link to="/login" className="text-[#C17A35] hover:text-[#A86929] transition-colors">
                    Sign In
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
