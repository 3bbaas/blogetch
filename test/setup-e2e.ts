// Runs before e2e spec imports (see test/jest-e2e.json `setupFiles`).
// AppModule evaluates ConfigModule.forRoot({ validate }) at import time,
// so JWT_SECRET must exist before any spec file imports it.
process.env['JWT_SECRET'] ??= 'test-secret-that-is-long-enough';
