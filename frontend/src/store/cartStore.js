import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      couponDiscount: 0,

      addItem: (product, quantity = 1, variant = null) => {
        const items = get().items;
        const key = `${product.id}-${variant?.id || "default"}`;
        const existing = items.find((i) => i.key === key);

        if (existing) {
          set({
            items: items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { key, product, variant, quantity, price: variant?.price || product.salePrice || product.price },
            ],
          });
        }
      },

      removeItem: (key) =>
        set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return get().removeItem(key);
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [], coupon: null, couponDiscount: 0 }),

      applyCoupon: (coupon, discount) => set({ coupon, couponDiscount: discount }),

      removeCoupon: () => set({ coupon: null, couponDiscount: 0 }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = subtotal >= 499 ? 0 : 50;
        return subtotal + shipping - get().couponDiscount;
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "karunfruits-cart",
    }
  )
);
