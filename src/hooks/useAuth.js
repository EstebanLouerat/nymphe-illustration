import { useEffect } from "react";
import { supabase } from "../services/supabase";
import { useStore } from "../services/store";

export function useAuth() {
  const { setUser, loadFavorites, loadUserCart } = useStore();

  useEffect(() => {
    // Session existante au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
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
      }
      if (event === "SIGNED_OUT") {
        useStore.setState({ favorites: [] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
