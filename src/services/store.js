// ============================================================
//  services/store.js — Zustand State Management
//  Gère l'état global (panier, UI, toasts)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

let toastId = 0;

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
      // ── Panier ──────────────────────────────────────────
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

      // ── Calculs ─────────────────────────────────────────
      get cartTotal() {
        return get().cart.reduce(
          (sum, item) => sum + (item.prix || 0) * item.quantity,
          0,
        );
      },

      get cartCount() {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // ── Chargement ──────────────────────────────────────
      loading: false,
      setLoading: (loading) => set({ loading }),

      // ── Toasts (pile) ───────────────────────────────────
      // types: "success" | "error" | "info" | "warning"
      toasts: [],

      showToast: (message, type = "success", duration = 4000) => {
        const id = ++toastId;
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        // Auto-dismiss
        setTimeout(() => {
          get().dismissToast(id);
        }, duration);
        return id;
      },

      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),

      // Raccourcis sémantiques
      showSuccess: (message, duration) =>
        get().showToast(message, "success", duration),

      showError: (message, duration = 6000) =>
        get().showToast(message, "error", duration),

      showInfo: (message, duration) =>
        get().showToast(message, "info", duration),

      showWarning: (message, duration) =>
        get().showToast(message, "warning", duration),
    }),
    {
      name: "nymphe-store",
      partialize: (state) => ({ cartOpen: state.cartOpen }),
    },
  ),
);
