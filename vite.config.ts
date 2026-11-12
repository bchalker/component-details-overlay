import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Two entries. "tag" has no React in it and no client marker, so a Next.js server
      // component can call tag() from 'component-details-overlay/tag'.
      entry: {
        index: resolve(import.meta.dirname, 'src/entry.ts'),
        tag: resolve(import.meta.dirname, 'src/tag.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        banner: (chunk) => (chunk.name === 'index' ? "'use client';" : ''),
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
