// Loads .env first: this file runs before ConfigModule, so dotenv values
// would otherwise be invisible here. Scripts run with cwd = api/ under
// `pnpm --filter`, so load the repo-root .env explicitly (cwd fallback kept
// for direct `pnpm --filter` runs from inside api/).
import path from 'node:path';
import { config as loadDotenv } from 'dotenv';

loadDotenv({ path: path.resolve(__dirname, '..', '..', '.env') });
loadDotenv();

// Runs before e2e spec imports (see test/jest-e2e.json `setupFiles`).
// AppModule evaluates ConfigModule.forRoot({ validate }) at import time,
// so JWT_SECRET must exist before any spec file imports it.
process.env['JWT_SECRET'] ??= 'test-secret-that-is-long-enough';

// E2E suites run against the isolated TEST database, never the dev one.
// Prisma reads DATABASE_URL, so point it at the test DB up front and fail
// fast when no test database is configured.
const testDatabaseUrl = process.env['TEST_DATABASE_URL'];
if (testDatabaseUrl === undefined || testDatabaseUrl.length === 0) {
  throw new Error('TEST_DATABASE_URL environment variable is required');
}
process.env['DATABASE_URL'] = testDatabaseUrl;
