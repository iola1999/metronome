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
        injectRegister: null,
        strategies: "injectManifest",
        srcDir: "public",
        filename: "sw.js",
        devOptions: {
          enabled: true,
        },
      }),
    ],
    server: {
      host: true,
      port: 5173,
    },
  },
});
