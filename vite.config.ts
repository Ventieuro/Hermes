import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { qrcode } from 'vite-plugin-qrcode'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/AstroCoin/',
  plugins: [
    react(),
    tailwindcss(),
    qrcode(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mascot.svg', 'vite.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'AstroCoin',
        short_name: 'AstroCoin',
        description: 'Gestisci entrate, uscite e risparmi come un astronauta 🚀',
        theme_color: '#0b0d17',
        background_color: '#0b0d17',
        display: 'standalone',
        scope: '/AstroCoin/',
        start_url: '/AstroCoin/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
})
