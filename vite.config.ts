import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Roomies uses plain CSS. Skip discovery of ancestor PostCSS configs.
  css: { postcss: { plugins: [] } },
  // React Native Web's animation cleanup expects the Node-style global alias.
  define: { global: 'globalThis' },
  test: {
    include: ['app/**/*.test.{ts,tsx}'],
  },
  server: {
    proxy: { '/api': 'http://127.0.0.1:8765' },
    watch: {
      ignored: ['**/.tsupgrader/**'],
    },
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
