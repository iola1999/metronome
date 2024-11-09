import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  integrations: [
    react({
      include: ["**/*.tsx"],
      jsxImportSource: "@emotion/react",
    }),
  ],
  vite: {
    optimizeDeps: {
      include: ["react", "react-dom", "@emotion/react", "@emotion/styled"],
      exclude: ["@astrojs/react"],
    },
    ssr: {
      noExternal: ["@emotion/react", "@emotion/styled"],
    },
    resolve: {
      alias: [
        {
          find: "@babel/runtime/helpers/extends",
          replacement: "@babel/runtime/helpers/esm/extends",
        },
      ],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
    plugins: [
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
          related_applications: [],
          prefer_related_applications: false,
        },
        workbox: {
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /\.html$/,
              handler: "NetworkFirst",
              options: {
                cacheName: "html-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24, // 1 天
                },
                networkTimeoutSeconds: 10,
              },
            },
            {
              urlPattern: /\.(js|css)$/,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "assets-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 天
                },
              },
            },
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif|ico|wav)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "static-cache",
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 天
                },
              },
            },
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
          skipWaiting: true,
          clientsClaim: true,
          globIgnores: ["**/node_modules/**/*", "**/.git/**/*", "**/sw.js"],
        },
        devOptions: {
          enabled: true,
          type: "module",
          navigateFallback: "index.html",
        },
      }),
    ],
    server: {
      host: true,
      port: 5173,
    },
  },
});
