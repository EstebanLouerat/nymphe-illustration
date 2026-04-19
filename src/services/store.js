import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";

let toastId = 0;

const getLocalCart = () => {
  try {
    const saved = localStorage.getItem("nymphe_cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (cart) => {
  localStorage.setItem("nymphe_cart", JSON.stringify(cart));
};

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),

      // ── Panier ───────────────────────────────────────────
      cart: getLocalCart(),
      cartOpen: false,

      _syncCart: async (cart) => {
        const { user } = get();
        if (!user) return;
        await supabase.from("carts").upsert({
          user_id: user.id,
          items: cart,
          updated_at: new Date().toISOString(),
        });
      },

      loadUserCart: async () => {
        const { user } = get();
        if (!user) return;
        const { data } = await supabase
          .from("carts")
          .select("items")
          .eq("user_id", user.id)
          .single();

        const serverCart = data?.items ?? [];
        const localCart = getLocalCart();
        const merged = [...serverCart];
        for (const localItem of localCart) {
          if (!merged.find((i) => i.id === localItem.id))
            merged.push(localItem);
        }
        saveLocalCart(merged);
        set({ cart: merged });
        await get()._syncCart(merged);
      },

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((p) => p.id === item.id);
          const newCart = existing
            ? state.cart.map((p) =>
                p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p,
              )
            : [...state.cart, { ...item, quantity: 1 }];
          saveLocalCart(newCart);
          get()._syncCart(newCart);
          return { cart: newCart };
        }),

      removeFromCart: (itemId) =>
        set((state) => {
          const newCart = state.cart.filter((p) => p.id !== itemId);
          saveLocalCart(newCart);
          get()._syncCart(newCart);
          return { cart: newCart };
        }),

      updateCartQuantity: (itemId, quantity) =>
        set((state) => {
          const newCart = state.cart.map((p) =>
            p.id === itemId ? { ...p, quantity: Math.max(1, quantity) } : p,
          );
          saveLocalCart(newCart);
          get()._syncCart(newCart);
          return { cart: newCart };
        }),

      clearCart: () => {
        saveLocalCart([]);
        get()._syncCart([]);
        return set({ cart: [] });
      },

      toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),

      get cartTotal() {
        return get().cart.reduce(
          (sum, item) => sum + (item.prix || 0) * item.quantity,
          0,
        );
      },
      get cartCount() {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // ── Favoris ──────────────────────────────────────────
      favorites: [],

      loadFavorites: async () => {
        const { user } = get();
        if (!user) return;
        const { data } = await supabase
          .from("favorites")
          .select("contentful_id")
          .eq("user_id", user.id);
        set({ favorites: (data ?? []).map((r) => r.contentful_id) });
      },

      isFavorite: (contentfulId) => get().favorites.includes(contentfulId),

      // Retourne { success: boolean, added: boolean }
      // added = true si ajouté, false si retiré
      toggleFavorite: async (contentfulId) => {
        const { user, favorites } = get();

        if (!user) {
          get().showInfo("Connectez-vous pour sauvegarder vos favoris");
          return { success: false, added: false };
        }

        const isFav = favorites.includes(contentfulId);

        if (isFav) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("contentful_id", contentfulId);

          if (error) {
            get().showError("Impossible de retirer le favori.");
            return { success: false, added: false };
          }
          set({ favorites: favorites.filter((id) => id !== contentfulId) });
          return { success: true, added: false };
        } else {
          const { error } = await supabase
            .from("favorites")
            .insert({ user_id: user.id, contentful_id: contentfulId });

          if (error) {
            get().showError("Impossible d'ajouter aux favoris.");
            return { success: false, added: false };
          }
          set({ favorites: [...favorites, contentfulId] });
          return { success: true, added: true };
        }
      },

      // ── Chargement ───────────────────────────────────────
      loading: false,
      setLoading: (loading) => set({ loading }),

      // ── Toasts ───────────────────────────────────────────
      toasts: [],

      showToast: (message, type = "success", duration = 4000) => {
        const id = ++toastId;
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().dismissToast(id), duration);
        return id;
      },
      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      clearToasts: () => set({ toasts: [] }),

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
