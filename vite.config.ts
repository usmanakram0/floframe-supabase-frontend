import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, existsSync } from "fs";
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
      name: "copy-spa-fallbacks",
      closeBundle() {
        if (existsSync("_redirects")) {
          copyFileSync("_redirects", "dist/_redirects");
          console.log("✓ Copied _redirects to dist folder");
        }

        const indexPath = "dist/index.html";
        if (existsSync(indexPath)) {
          copyFileSync(indexPath, "dist/404.html");
          console.log("✓ Copied index.html to dist/404.html for SPA fallback");
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
