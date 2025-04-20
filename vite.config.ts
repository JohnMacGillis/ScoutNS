import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Keep zone data files together in one chunk
        manualChunks(id) {
          if (id.includes('zone1_fishing_rules.json') ||
              id.includes('zone2_fishing_rules.json') ||
              id.includes('zone3_fishing_rules.json') ||
              id.includes('zone4_fishing_rules.json') ||
              id.includes('zone5_fishing_rules.json') ||
              id.includes('zone6_fishing_rules.json')) {
            return 'zone-data';
          }
        }
      }
    }
  }
});
