/// <reference types="vite-plugin-pwa/client" />

interface Window {
  updateSW?: (reloadPage?: boolean) => Promise<void>
} 