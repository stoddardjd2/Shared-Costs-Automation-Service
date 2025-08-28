import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: "autoUpdate", // SW updates in background
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "SmartSplit",
        short_name: "SmartSplit",
        description: "Automated shared expenses & reminders.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563EB", // rgb(37,99,235)
        orientation: "portrait",
        icons: [
          { src: "/smartSplitLogo.svg", sizes: "192x192", type: "image/png" },
          { src: "/smartSplitLogo.svg", sizes: "512x512", type: "image/png" },
          {
            src: "/smartSplitLogo.svg.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          // API cache: network first, fallback to cache
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },
          // Images: cache first
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "img-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Static assets: stale-while-revalidate
          {
            urlPattern: ({ request }) =>
              ["style", "script", "worker", "font"].includes(
                request.destination
              ),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "static-cache" },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
});
