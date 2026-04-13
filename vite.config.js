import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // En dev local, redirige /api/* vers netlify functions via CLI séparée
      "/api": {
        target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/(.+)/, "/.netlify/functions/$1"),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
