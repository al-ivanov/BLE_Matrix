import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globDirectory: './dist/',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,manifest}'],
        dontCacheBustURLsMatching: /-[a-f0-9]{8}\./,
      },
      manifest: {
        name: 'BLE Matrix Display Controller',
        short_name: 'BLE Matrix',
        description: 'Управление LED матричными дисплеями через Bluetooth',
        scope: '/',
        start_url: '/',
        display: 'standalone',
        theme_color: '#0e7490',
        background_color: '#0f172a',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/public/icons.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
});
