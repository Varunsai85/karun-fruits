import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import ScrollToTop from "@/components/common/ScrollToTop";
import { useAuthStore } from "@/store/authStore";

const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
const TrackOrder = lazy(() => import("@/pages/TrackOrder"));
const AccountLayout = lazy(() => import("@/pages/account/AccountLayout"));
const Profile = lazy(() => import("@/pages/account/Profile"));
const Orders = lazy(() => import("@/pages/account/Orders"));
const Wishlist = lazy(() => import("@/pages/account/Wishlist"));
const Addresses = lazy(() => import("@/pages/account/Addresses"));
const Loyalty = lazy(() => import("@/pages/account/Loyalty"));
const Referral = lazy(() => import("@/pages/account/Referral"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminCoupons = lazy(() => import("@/pages/admin/AdminCoupons"));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"));
const AdminBanners = lazy(() => import("@/pages/admin/AdminBanners"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const ShippingPolicy = lazy(() => import("@/pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("@/pages/ReturnPolicy"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-[#0D1A10]">
      <div className="w-10 h-10 border-2 border-[#2A3A2C] border-t-[#C17A35] rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Admin routes — no Layout wrapper */}
                <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:slug" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="track-order" element={<TrackOrder />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="verify-email" element={<VerifyEmail />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<TermsAndConditions />} />
                  <Route path="shipping-policy" element={<ShippingPolicy />} />
                  <Route path="return-policy" element={<ReturnPolicy />} />
                  <Route path="account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                    <Route index element={<Profile />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="addresses" element={<Addresses />} />
                    <Route path="loyalty" element={<Loyalty />} />
                    <Route path="referral" element={<Referral />} />
                  </Route>
                  <Route path="*" element={
                    <div className="min-h-[60vh] flex items-center justify-center text-center px-4 bg-[#0D1A10]">
                      <div>
                        <div className="text-8xl mb-6">🌰</div>
                        <h1 className="font-heading text-5xl font-light text-[#F5F0E8] mb-3">Page Not Found</h1>
                        <p className="text-[#9AAA9C] mb-8 font-light">The page you're looking for doesn't exist.</p>
                        <a href="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C17A35] hover:bg-[#A86929] text-white font-light tracking-wide rounded-full transition-colors">
                          Back to Home
                        </a>
                      </div>
                    </div>
                  } />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  );
}
