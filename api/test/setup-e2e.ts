import path from 'node:path';
import { config as loadDotenv } from 'dotenv';

loadDotenv({ path: path.resolve(__dirname, '..', '..', '.env') });
loadDotenv();

process.env['JWT_SECRET'] ??= 'test-secret-that-is-long-enough';

const testDatabaseUrl = process.env['TEST_DATABASE_URL'];
if (testDatabaseUrl === undefined || testDatabaseUrl.length === 0) {
  throw new Error('TEST_DATABASE_URL environment variable is required');
}
process.env['DATABASE_URL'] = testDatabaseUrl;
