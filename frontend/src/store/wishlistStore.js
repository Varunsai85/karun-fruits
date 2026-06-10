import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      add: (product) => {
        if (!get().has(product.id)) {
          set({ items: [...get().items, product] });
        }
      },

      remove: (productId) =>
        set({ items: get().items.filter((p) => p.id !== productId) }),

      toggle: (product) => {
        if (get().has(product.id)) {
          get().remove(product.id);
        } else {
          get().add(product);
        }
      },

      has: (productId) => get().items.some((p) => p.id === productId),

      clear: () => set({ items: [] }),
    }),
    { name: "karunfruits-wishlist" }
  )
);
