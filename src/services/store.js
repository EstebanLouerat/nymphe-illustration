import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { StockService } from "./stock";

let toastId = 0;

const OUT_OF_STOCK_MSG = "Cette illustration est en rupture de stock.";

const remainingMsg = (available) =>
  `Il ne reste que ${available} exemplaire${available > 1 ? "s" : ""} disponible${
    available > 1 ? "s" : ""
  }.`;

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
      authInitialized: false,
      setAuthInitialized: (v) => set({ authInitialized: v }),

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

      // Ajout au panier — validé côté serveur (/api/stock).
      // Retourne { success, available } ; available = null si non suivi.
      addToCart: async (item, qty = 1) => {
        const state = get();
        const existing = state.cart.find((p) => p.id === item.id);
        const desired = (existing?.quantity ?? 0) + Math.max(1, qty);

        const check = await state._assertAvailable(item.id, desired);
        if (!check.ok) {
          state.showError(
            check.available > 0 ? remainingMsg(check.available) : OUT_OF_STOCK_MSG,
          );
          return { success: false, available: check.available };
        }

        set((s) => {
          const inCart = s.cart.find((p) => p.id === item.id);
          const newCart = inCart
            ? s.cart.map((p) =>
                p.id === item.id ? { ...p, quantity: desired } : p,
              )
            : [...s.cart, { ...item, quantity: desired }];
          saveLocalCart(newCart);
          get()._syncCart(newCart);
          return { cart: newCart };
        });

        return { success: true, available: check.available };
      },

      removeFromCart: (itemId) =>
        set((state) => {
          const newCart = state.cart.filter((p) => p.id !== itemId);
          saveLocalCart(newCart);
          get()._syncCart(newCart);
          return { cart: newCart };
        }),

      updateCartQuantity: async (itemId, quantity) => {
        const target = Math.max(1, quantity);
        const current =
          get().cart.find((p) => p.id === itemId)?.quantity ?? target;

        // Seule une augmentation nécessite une vérification
        if (target > current) {
          const check = await get()._assertAvailable(itemId, target);
          if (!check.ok) {
            get().showError(
              check.available > 0
                ? remainingMsg(check.available)
                : OUT_OF_STOCK_MSG,
            );
            return { success: false, available: check.available };
          }
        }

        set((state) => {
          const newCart = state.cart.map((p) =>
            p.id === itemId ? { ...p, quantity: target } : p,
          );
          saveLocalCart(newCart);
          get()._syncCart(newCart);
          return { cart: newCart };
        });

        return { success: true };
      },

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

      // ── Stock ────────────────────────────────────────────
      // { [contentful_id]: quantité disponible }
      // Une illustration absente de la map n'est pas suivie = illimitée.
      stock: {},
      stockLoaded: false,

      loadStock: async () => {
        const map = await StockService.fetchStockMap();
        set({ stock: map, stockLoaded: true });
      },

      // Quantité disponible, ou null si l'illustration n'est pas suivie
      stockFor: (contentfulId) => {
        const q = get().stock[contentfulId];
        return q === undefined ? null : q;
      },

      isOutOfStock: (contentfulId) => {
        const q = get().stock[contentfulId];
        return q !== undefined && q <= 0;
      },

      // Quantité encore ajoutable au panier (null = illimité)
      remainingFor: (contentfulId) => {
        const q = get().stock[contentfulId];
        if (q === undefined) return null;
        const inCart =
          get().cart.find((p) => p.id === contentfulId)?.quantity ?? 0;
        return Math.max(0, q - inCart);
      },

      // Vérification serveur (source de vérité) + mise à jour de la map locale
      _assertAvailable: async (contentfulId, desired) => {
        const local = get().stock[contentfulId];
        if (local !== undefined && local < desired) {
          return { ok: false, available: local };
        }

        try {
          const res = await StockService.checkAvailability([
            { id: contentfulId, quantity: desired },
          ]);
          const line = res.items?.find((i) => i.id === contentfulId);

          if (line?.tracked) {
            set((s) => ({
              stock: { ...s.stock, [contentfulId]: line.available },
            }));
          }

          if (res.ok === false || line?.ok === false) {
            return { ok: false, available: line?.available ?? 0 };
          }
          return { ok: true, available: line?.tracked ? line.available : null };
        } catch (err) {
          // API injoignable : on ne bloque pas la vente, la réservation
          // atomique à la création de la session Stripe reste le garde-fou.
          console.error("Vérification du stock impossible:", err?.message ?? err);
          return { ok: true, available: local ?? null };
        }
      },

      // Applique la réponse 409 du checkout (STOCK_UNAVAILABLE)
      applyStockConflict: (unavailable = []) => {
        set((s) => {
          const stock = { ...s.stock };
          for (const u of unavailable) {
            if (u?.id) stock[u.id] = u.available ?? 0;
          }
          return { stock };
        });
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
