// ============================================================
//  services/store.js — Zustand State Management
//  Gère l'état global (panier, UI, etc)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Charger le panier depuis localStorage
const loadCart = () => {
  try {
    const saved = localStorage.getItem("nymphe_cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Panier ──
      cart: loadCart(),
      cartOpen: false,

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((p) => p.id === item.id);
          let newCart;
          if (existing) {
            newCart = state.cart.map((p) =>
              p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p,
            );
          } else {
            newCart = [...state.cart, { ...item, quantity: 1 }];
          }
          localStorage.setItem("nymphe_cart", JSON.stringify(newCart));
          return { cart: newCart };
        }),

      removeFromCart: (itemId) =>
        set((state) => {
          const newCart = state.cart.filter((p) => p.id !== itemId);
          localStorage.setItem("nymphe_cart", JSON.stringify(newCart));
          return { cart: newCart };
        }),

      updateCartQuantity: (itemId, quantity) =>
        set((state) => {
          const newCart = state.cart.map((p) =>
            p.id === itemId ? { ...p, quantity: Math.max(1, quantity) } : p,
          );
          localStorage.setItem("nymphe_cart", JSON.stringify(newCart));
          return { cart: newCart };
        }),

      clearCart: () => {
        localStorage.setItem("nymphe_cart", JSON.stringify([]));
        return set({ cart: [] });
      },

      toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),

      // ── Calculs ──
      get cartTotal() {
        const state = get();
        return state.cart.reduce(
          (sum, item) => sum + (item.prix || 0) * item.quantity,
          0,
        );
      },

      get cartCount() {
        const state = get();
        return state.cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // ── Chargement ──
      loading: false,
      setLoading: (loading) => set({ loading }),

      // ── Notifications ──
      toast: null,
      showToast: (message, type = "success") =>
        set({ toast: { message, type } }),
      hideToast: () => set({ toast: null }),
    }),
    {
      name: "nymphe-store",
      partialize: (state) => ({ cartOpen: state.cartOpen }),
    },
  ),
);
