// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import { imagetools } from "vite-imagetools";

export default defineConfig(({ mode }) => {
  // Load .env files into strings
  const env = loadEnv(mode, process.cwd(), ""); // no prefix filter
  const VITE_ENV_PRODUCTION = env.VITE_ENV_PRODUCTION === "true"; // cast to boolean
  // Or: const isProdMode = mode === "production";
  return {
    plugins: [
      react(),
      svgr(),
      imagetools(),
      VITE_ENV_PRODUCTION &&
        VitePWA({
          registerType: "autoUpdate",
          includeAssets: [
            "favicon-16x16.png",
            "favicon-32x32.png",
            "favicon-48x48.png",
            "favicon-180x180.png",
            "favicon-192x192.png",
            "favicon-512x512.png",
            "apple-touch-icon.png",
          ],
          manifest: {
            name: "Splitify",
            short_name: "Splitify",
            description: "Automated shared expenses & reminders.",
            start_url: "/",
            scope: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#2563EB",
            orientation: "portrait",
            icons: [
              {
                src: "/favicon-192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
              {
                src: "/favicon-512x512.png",
                sizes: "512x512",
                type: "image/png",
              },
              {
                src: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
                purpose: "any",
              },
            ],
          },
          workbox: {
            navigateFallback: "/index.html",
            runtimeCaching: [
              {
                urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
                handler: "NetworkFirst",
                options: {
                  cacheName: "api-cache",
                  networkTimeoutSeconds: 5,
                  expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
                },
              },
              {
                urlPattern: ({ request }) => request.destination === "image",
                handler: "CacheFirst",
                options: {
                  cacheName: "img-cache",
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                },
              },
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
    ].filter(Boolean),
    optimizeDeps: {
      esbuildOptions: {
        loader: { ".js": "jsx" },
      },
    },
  };
});
