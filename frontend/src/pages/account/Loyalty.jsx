import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Gift, ShoppingBag, TrendingUp, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { userService } from "@/services/userService";

const HOW_IT_WORKS = [
  { icon: ShoppingBag, title: "Shop & Earn", desc: "Earn 1 point for every ₹10 you spend on any order." },
  { icon: Star, title: "Accumulate Points", desc: "Points are credited to your account immediately after order placement." },
  { icon: Gift, title: "Redeem Rewards", desc: "Every 100 points = ₹10 off your next order. Apply at checkout." },
];

export default function Loyalty() {
  const { data, isLoading } = useQuery({
    queryKey: ["loyalty"],
    queryFn: () => userService.getLoyaltyInfo(),
  });

  const points = data?.points ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const equivalentValue = data?.equivalentValue ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header card */}
      <div className="bg-gradient-to-br from-[#1E4620] to-[#162018] border border-[#2A3A2C] rounded-2xl p-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-heading text-[#F5F0E8] text-2xl font-light mb-1">Loyalty Points</h2>
            <p className="text-[#9AAA9C] text-sm font-light">Earn points with every order and redeem them for discounts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#C17A35]/20 border border-[#C17A35]/30 flex items-center justify-center">
            <Star className="w-6 h-6 text-[#C17A35]" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#0D1A10]/50 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={Star} label="Total Points" value={points.toLocaleString("en-IN")} color="text-[#C17A35]" />
            <StatCard icon={TrendingUp} label="Orders Placed" value={totalOrders.toString()} color="text-green-400" />
            <StatCard icon={Gift} label="Worth" value={`₹${equivalentValue}`} color="text-purple-400" />
          </div>
        )}
      </div>

      {/* Points meter */}
      {!isLoading && (
        <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#9AAA9C] text-sm font-light">Progress to next reward</p>
            <p className="text-[#F5F0E8] text-sm font-light">{points % 100}/100 pts</p>
          </div>
          <div className="h-2 bg-[#0D1A10] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#C17A35] to-[#E8A855] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(points % 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-[#9AAA9C] text-xs font-light mt-2">
            {100 - (points % 100)} more points to earn ₹10 discount
          </p>
        </div>
      )}

      {/* How it works */}
      <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl p-6">
        <h3 className="font-heading text-[#F5F0E8] text-lg font-light mb-5">How It Works</h3>
        <div className="space-y-4">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-xl bg-[#1E4620] border border-[#2A3A2C] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#C17A35]" />
              </div>
              <div>
                <p className="text-[#F5F0E8] text-sm font-light mb-0.5">{title}</p>
                <p className="text-[#9AAA9C] text-xs font-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 bg-[#C17A35]/10 border border-[#C17A35]/20 rounded-xl p-4">
        <Info className="w-4 h-4 text-[#C17A35] mt-0.5 shrink-0" />
        <p className="text-sm text-[#9AAA9C] font-light">
          Points are non-transferable and cannot be converted to cash. Loyalty points are valid for 12 months from the date of earning.
        </p>
      </div>

      {points === 0 && (
        <div className="text-center py-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors text-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Start Shopping & Earn Points
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#0D1A10]/60 border border-[#2A3A2C] rounded-xl p-4 text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
      <p className={`font-heading text-2xl font-light ${color}`}>{value}</p>
      <p className="text-[#9AAA9C] text-xs font-light mt-0.5">{label}</p>
    </div>
  );
}
