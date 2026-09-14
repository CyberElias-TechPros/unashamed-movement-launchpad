import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Allow preview/sandbox hosts to reach the dev server.
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    // In dev, the API runs on `wrangler dev` (Cloudflare Worker) on :8787.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY || "http://localhost:8787",
        changeOrigin: false,
      },
    },
  },
  // `vite preview` (used for testing production builds) gets the same proxy.
  preview: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY || "http://localhost:8787",
        changeOrigin: false,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          animations: ["framer-motion"],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[extname]",
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: mode === "development",
  },
}));