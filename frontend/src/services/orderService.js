import api from "./api";

export const orderService = {
  create: (data) => api.post("/orders", data),
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByOrderNumber: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  createRazorpayOrder: (data) => api.post("/payments/razorpay/create-order", data),
  verifyPayment: (data) => api.post("/payments/razorpay/verify", data),
  applyCoupon: (code, amount) => api.post("/coupons/apply", { code, amount }),
};
