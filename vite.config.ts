import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Base path.
 * - GitHub Actions sets BASE_PATH to "/<repository-name>/" automatically (see .github/workflows/deploy.yml).
 * - Without it we use "./" (relative), which works on any static host and any sub-folder,
 *   because the app uses hash-based routing.
 */
const base = process.env.BASE_PATH && process.env.BASE_PATH.trim() !== '' ? process.env.BASE_PATH : './';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png', '404.html'],
      manifestFilename: 'manifest.webmanifest',
      manifest: {
        id: './',
        name: 'Servolab — Robotics Learning',
        short_name: 'Servolab',
        description: 'Learn electronics, robotics, embedded systems and more with short interactive lessons. Works offline.',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        display_override: ['standalone'],
        orientation: 'any',
        background_color: '#F3F0E8',
        theme_color: '#F3F0E8',
        categories: ['education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        globIgnores: ['**/*-vietnamese-*', '**/*-cyrillic-*'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      },
      devOptions: { enabled: false }
    })
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 900
  }
});
