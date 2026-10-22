import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cpSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Keep the unified static homepage and standalone lessons available in production.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), {
    name: 'copy-learning-library',
    closeBundle() {
      for (const entry of ['parts', 'assets', ...readdirSync('.').filter(name => name.endsWith('.html') && name !== 'index.html')]) {
        cpSync(resolve(entry), resolve('dist', entry), { recursive: true });
      }
    },
  }],
});
