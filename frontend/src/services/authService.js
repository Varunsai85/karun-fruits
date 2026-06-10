import api from "./api";

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
  sendOtp: (phone) => api.post("/auth/send-otp", { phone }),
  verifyOtp: (phone, otp) => api.post("/auth/verify-otp", { phone, otp }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};
