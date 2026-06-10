import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Image, BarChart2, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  { to: "/admin",           label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products",  label: "Products",  icon: Package },
  { to: "/admin/orders",    label: "Orders",    icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons",   label: "Coupons",   icon: Tag },
  { to: "/admin/banners",   label: "Banners",   icon: Image },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate   = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#0A1510]">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0D1A10] border-r border-[#2A3A2C] flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-5 border-b border-[#2A3A2C]">
          <span className="label-luxury text-[#7A8F7C] block mb-0.5">Admin Panel</span>
          <span className="font-heading text-[#F5F0E8] text-lg font-light tracking-wider">KARUN FRUITS</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-light transition-all ${
                isActive
                  ? "bg-[#1E4620] text-[#F5F0E8] border border-[#2D5A32]"
                  : "text-[#7A8F7C] hover:bg-[#162018] hover:text-[#D0D8D2]"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[#2A3A2C]">
          <button
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-light text-[#5A6A5C] hover:text-red-400 hover:bg-[#162018] w-full transition-all"
            onClick={() => { logout(); navigate("/"); }}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8 bg-[#0A1510] text-[#F5F0E8] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
