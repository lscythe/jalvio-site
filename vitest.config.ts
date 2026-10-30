/// <reference types="vitest/config" />

import { svelteTesting } from '@testing-library/svelte/vite';
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  plugins: [svelteTesting()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts'],
  },
});
