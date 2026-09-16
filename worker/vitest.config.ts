import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // PBKDF2 (100k iterations) password hashing is intentionally slow; the
    // auth-heavy journeys need more than vitest's 5s/10s defaults.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // Sequential: tests share one D1 database and build on each other's state
    // (register → login → order → refund), which keeps setup light and fast.
    poolOptions: {
      workers: {
        main: 'src/index.ts',
        singleWorker: true,
        // The suite is deliberately sequential (register → login → order →
        // refund), so tests must SHARE storage instead of the default
        // per-test isolation, which would wipe D1 between tests.
        isolatedStorage: false,
        miniflare: {
          compatibilityDate: '2024-09-23',
          bindings: {
            JWT_SECRET: 'test-jwt-secret',
            JWT_REFRESH_SECRET: 'test-jwt-refresh-secret',
            CSRF_SECRET: 'test-csrf-secret',
            CLIENT_URL: 'http://localhost:8080',
            ALLOWED_ORIGINS: 'http://localhost:8080',
            EMAIL_FROM: 'TTIN <no-reply@test>',
          },
          d1Databases: { DB: 'test-db' },
          kvNamespaces: { CACHE: 'test-cache' },
          r2Buckets: { MEDIA: 'test-media' },
        },
      },
    },
  },
});
