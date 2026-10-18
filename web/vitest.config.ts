import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    // Unit tests import server modules whose env validation runs at import
    // time; give them dummy values (no network is ever touched: fetch is
    // stubbed in every test that needs it).
    env: {
      API_URL: 'http://localhost:3000/api',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3001',
      COOKIE_SECURE: 'false',
    },
  },
});
