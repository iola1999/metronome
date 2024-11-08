import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      manifest: {
        name: "节拍器",
        short_name: "节拍器",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#007AFF",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wav}']
      },
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: 'sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
      }
    })
  ],
  server: {
    https: false
  }
}); 