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
        short_name: 'SmartHat',
        name: 'SmartHat Matrix Display Controller',
        scope: '/',
        start_url: '/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
