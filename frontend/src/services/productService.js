import api from "./api";

export const productService = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: () => api.get("/products/featured"),
  getTrending: () => api.get("/products/trending"),
  getNewArrivals: () => api.get("/products/new-arrivals"),
  getCategories: () => api.get("/categories"),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  search: (query, params) => api.get("/products/search", { params: { q: query, ...params } }),
  getRecommendations: (productId) => api.get(`/products/${productId}/recommendations`),
  getReviews: (productId, params) => api.get(`/products/${productId}/reviews`, { params }),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};
