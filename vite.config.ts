import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, existsSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    headers: {
      // These two headers enable SharedArrayBuffer in the browser
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  plugins: [
    react(),
    // Only run componentTagger in development mode, NOT during build
    mode === "development" && componentTagger(),
    // Add plugin to copy _redirects file after build for production
    mode === "production" && {
      name: "copy-redirects",
      closeBundle() {
        // Copy _redirects to dist folder after build for SPA routing
        if (existsSync("_redirects")) {
          copyFileSync("_redirects", "dist/_redirects");
          console.log("✓ Copied _redirects to dist folder");
        } else {
          console.warn(
            "⚠ _redirects file not found - SPA routing may not work",
          );
        }
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build configuration for production
  build: {
    outDir: "dist",
    sourcemap: false, // Set to true if you want source maps for debugging
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-slot",
            "class-variance-authority",
            "lucide-react",
          ],
          "vendor-other": [
            "@supabase/supabase-js",
            "@tanstack/react-query",
            "zod",
          ],
        },
      },
    },
  },
}));
