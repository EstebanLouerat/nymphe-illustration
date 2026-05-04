import { useEffect } from "react";
import { supabase } from "../services/supabase";
import { useStore } from "../services/store";

async function linkGuestOrders(accessToken) {
  try {
    await fetch("/api/link-orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Non bloquant
  }
}

export function useAuth() {
  const { setUser, setAuthInitialized, loadFavorites, loadUserCart } = useStore();

  useEffect(() => {
    // Session existante au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthInitialized(true);
      if (session?.user) {
        loadFavorites();
        loadUserCart();
      }
    });

    // Écoute les changements d'état auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN") {
        await loadFavorites();
        await loadUserCart();
        // Rattache en arrière-plan les commandes invité faites avec cet email
        linkGuestOrders(session.access_token);
      }
      if (event === "SIGNED_OUT") {
        useStore.setState({ favorites: [] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
