import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Users, Star, Share2 } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";

export default function Referral() {
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["referral"],
    queryFn: () => userService.getReferralInfo().then((r) => r.data),
  });

  const referralCode = data?.referralCode ?? "";
  const referralCount = data?.referralCount ?? 0;
  const pointsEarned = data?.pointsEarned ?? 0;

  const referralLink = `https://karunfruits.com/register?ref=${referralCode}`;

  function copyCode() {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success("Referral link copied!");
    });
  }

  function shareWhatsApp() {
    const msg = encodeURIComponent(
      `Shop premium dry fruits & healthy snacks at Karun Fruits! Use my referral code *${referralCode}* to get a special welcome bonus.\n\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#1E4620] to-[#162018] border border-[#2A3A2C] rounded-2xl p-7">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-1">Refer & Earn</h2>
            <p className="text-[#9AAA9C] text-sm font-light">Share Karun Fruits with friends and earn 50 loyalty points per referral</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#C17A35]/20 border border-[#C17A35]/30 flex items-center justify-center">
            <Gift className="w-6 h-6 text-[#C17A35]" />
          </div>
        </div>

        {/* Stats row */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0D1A10]/60 border border-[#2A3A2C] rounded-xl p-4 text-center">
              <Users className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <p className="font-heading text-2xl font-light text-green-400">{referralCount}</p>
              <p className="text-[#9AAA9C] text-xs font-light">Friends Referred</p>
            </div>
            <div className="bg-[#0D1A10]/60 border border-[#2A3A2C] rounded-xl p-4 text-center">
              <Star className="w-5 h-5 text-[#C17A35] mx-auto mb-2" />
              <p className="font-heading text-2xl font-light text-[#C17A35]">{pointsEarned}</p>
              <p className="text-[#9AAA9C] text-xs font-light">Points Earned</p>
            </div>
          </div>
        )}
      </div>

      {/* Referral code */}
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6">
        <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-4">Your Referral Code</h3>
        {isLoading ? (
          <div className="h-14 bg-[#1D2B1F] rounded-xl animate-pulse" />
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#0D1A10] border border-[#2A3A2C] rounded-xl px-5 py-3.5 font-mono text-[#C17A35] text-lg tracking-[0.3em] font-light">
              {referralCode || "—"}
            </div>
            <button
              onClick={copyCode}
              disabled={!referralCode}
              className="flex items-center gap-2 px-5 py-3.5 bg-[#C17A35] hover:bg-[#A86929] text-white text-sm font-light rounded-xl transition-colors disabled:opacity-40"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {/* Share options */}
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6">
        <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-4">Share Your Link</h3>

        <div className="bg-[#0D1A10] border border-[#2A3A2C] rounded-xl px-4 py-3 text-[#9AAA9C] text-xs font-light mb-4 break-all">
          {referralLink}
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#2A3A2C] hover:border-[#C17A35]/40 text-[#9AAA9C] hover:text-[#F5F0E8] text-sm font-light rounded-xl transition-colors"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 text-[#25D366] text-sm font-light rounded-xl transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6">
        <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-4">How Referral Works</h3>
        <ol className="space-y-3">
          {[
            "Share your unique referral code or link with friends",
            "Your friend signs up using your referral code",
            "You earn 50 loyalty points instantly when they register",
            "Accumulate points and redeem for discounts on future orders",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#C17A35]/20 border border-[#C17A35]/30 text-[#C17A35] text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-[#9AAA9C] text-sm font-light">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}
