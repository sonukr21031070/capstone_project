import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'EdLearn - Nabha Rural Education',
        short_name: 'EdLearn',
        description: 'Digital Learning Platform for Rural School Students - Nabha (SIH25019)',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache API calls for notes/quiz data
            urlPattern: /^https?:\/\/localhost:8080\/api\/student\/(notes|quizzes|subjects)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-student-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 }, // 24h
              networkTimeoutSeconds: 5
            }
          },
          {
            // Cache uploaded files (PDFs, videos)
            urlPattern: /^https?:\/\/localhost:8080\/uploads/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploads-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 604800 } // 7d
            }
          },
          {
            // Cache announcements
            urlPattern: /^https?:\/\/localhost:8080\/api\/student\/announcements/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'announcements-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 3600 } // 1h
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
