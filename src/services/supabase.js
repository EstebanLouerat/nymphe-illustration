import { createClient } from "@supabase/supabase-js";

// Singleton - évite les instances multiples lors du HMR Vite
// qui causent le NavigatorLockAcquireTimeoutError
const key = "__nymphe_supabase__";

if (!window[key]) {
  window[key] = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        storageKey: "nymphe-auth",
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Désactive le navigator lock qui cause des conflits en dev (HMR)
        // et sur certains navigateurs - sans impact sur la sécurité
        lock: async (_name, _timeout, fn) => fn(),
      },
    },
  );
}

export const supabase = window[key];
