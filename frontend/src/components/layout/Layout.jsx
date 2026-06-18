import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";
import WhatsAppButton from "@/components/common/WhatsAppButton";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D1A10]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: { background: "#162018", border: "1px solid #2A3A2C", color: "#F5F0E8" },
        }}
      />
    </div>
  );
}
