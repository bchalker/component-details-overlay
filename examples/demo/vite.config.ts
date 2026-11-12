import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The demo imports the package by name. The alias points that name at the source folder,
// so edits to the overlay show up in the demo without a rebuild.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react()],
  resolve: {
    alias: {
      'component-details-overlay': resolve(import.meta.dirname, '../../src/entry.ts'),
    },
  },
  server: { port: 5180 },
  preview: { port: 5181 },
});
