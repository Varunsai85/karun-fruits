import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, Package, Heart, MapPin, LogOut, Star, Gift } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { to: "/account",           label: "My Profile",    icon: User,    end: true },
  { to: "/account/orders",    label: "My Orders",     icon: Package },
  { to: "/account/wishlist",  label: "Wishlist",      icon: Heart },
  { to: "/account/addresses", label: "Addresses",     icon: MapPin },
  { to: "/account/loyalty",   label: "Loyalty Points",icon: Star },
  { to: "/account/referral",  label: "Refer & Earn",  icon: Gift },
];

export default function AccountLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0D1A10]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-7">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-[#162018] border border-[#2A3A2C] rounded-2xl overflow-hidden sticky top-24">
              {/* Profile header */}
              <div className="bg-[#1E4620] border-b border-[#2D5A32] p-6">
                <div className="w-14 h-14 rounded-full bg-[#0D1A10] border border-[#2D5A32] flex items-center justify-center text-2xl font-light text-[#F5F0E8] font-heading mb-3">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <p className="font-heading text-[#F5F0E8] text-lg font-light leading-tight">{user?.name}</p>
                <p className="text-[#9AAA9C] text-sm mt-0.5 font-light">{user?.email}</p>
                {user?.loyaltyPoints > 0 && (
                  <div className="mt-3 bg-[#0D1A10]/40 border border-[#2D5A32] rounded-lg px-3 py-1.5 inline-block">
                    <p className="text-xs text-[#9AAA9C]">Loyalty Points</p>
                    <p className="text-[#C17A35] font-medium text-sm">{user.loyaltyPoints} pts</p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="p-3">
                {NAV.map(({ to, label, icon: Icon, end }) => (
                  <NavLink key={to} to={to} end={end}
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-light transition-all mb-0.5 ${
                      isActive
                        ? "bg-[#1E4620] text-[#F5F0E8] border border-[#2D5A32]"
                        : "text-[#9AAA9C] hover:bg-[#1D2B1F] hover:text-[#F5F0E8]"
                    }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
                <div className="border-t border-[#2A3A2C] mt-2 pt-2">
                  <button
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-light text-red-400 hover:bg-[#1D2B1F] hover:text-red-300 w-full transition-all"
                    onClick={() => { logout(); navigate("/"); }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
