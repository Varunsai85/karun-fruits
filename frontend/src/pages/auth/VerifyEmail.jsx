import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        login(res.data.user, res.data.token);
        setStatus("success");
        setTimeout(() => navigate("/"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(
          err?.response?.data?.message || "Invalid or expired verification link."
        );
      });
  }, [token]);

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
          <div className="h-px w-16 bg-[#C17A35]/40 mx-auto" />
        </div>

        <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-10 text-center">
          {status === "loading" && (
            <>
              <Loader className="w-12 h-12 text-[#C17A35] animate-spin mx-auto mb-4" />
              <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-2">Verifying…</h2>
              <p className="text-[#9AAA9C] text-sm font-light">Please wait while we verify your email.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
              <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-2">Email Verified!</h2>
              <p className="text-[#9AAA9C] text-sm font-light mb-6">
                Your account is now active. Redirecting you to the home page…
              </p>
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-xl transition-colors text-sm"
              >
                Go to Home
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-2">Verification Failed</h2>
              <p className="text-[#9AAA9C] text-sm font-light mb-6">{errorMsg}</p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-block px-8 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-xl transition-colors text-sm"
                >
                  Back to Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-[#9AAA9C] hover:text-[#F5F0E8] transition-colors"
                >
                  Create a new account
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
