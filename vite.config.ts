import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "节拍器 - 支持录音的在线节拍器",
        short_name: "节拍器",
        description:
          "一个支持录音的在线节拍器，可调节速度并保存录音。支持 PWA 安装，可离线使用。",
        start_url: "/",
        id: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#007AFF",
        categories: ["music", "utilities"],
        icons: [
          {
            src: "/icons/icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/mobile.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
          },
          {
            src: "/screenshots/desktop.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide",
          },
        ],
        shortcuts: [
          {
            name: "开始录音",
            url: "/?action=record",
            icons: [{ src: "/icons/record.png", sizes: "96x96" }],
          },
        ],
        related_applications: [],
        prefer_related_applications: false,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wav,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 年
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
