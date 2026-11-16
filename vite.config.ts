import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // React Native Web's animation cleanup expects the Node-style global alias.
  define: { global: 'globalThis' },
  test: {
    include: ['app/**/*.test.{ts,tsx}'],
  },
  server: {
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
