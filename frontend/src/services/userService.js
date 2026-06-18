import api from "./api";

export const userService = {
  updateProfile: (data) => api.put("/users/profile", data),

  getAddresses: () => api.get("/users/addresses"),
  addAddress: (data) => api.post("/users/addresses", data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/users/addresses/${id}/default`),

  getLoyaltyInfo: () => api.get("/users/loyalty"),
  getReferralInfo: () => api.get("/users/referral"),
};
