import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      manifest: {
        name: 'ExamCrafter',
        short_name: 'ExamCrafter',
        description: 'Pregatire pentru examene cu grile si seturi de intrebari personalizate.',
        theme_color: '#14151A',
        background_color: '#FAFAF7',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase';
          if (id.includes('apexcharts')) return 'charts';
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('xlsx') || id.includes('papaparse')) return 'sheets';
          if (id.includes('react')) return 'react';
          return 'vendor';
        },
      },
    },
  },
});
