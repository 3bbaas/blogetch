import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BLOG_CATEGORIES } from './schemas';

// The Prisma schema is the source of truth for categories (DB enum ->
// backend validation -> frontend). Parse its members and require an exact
// match so the two ends cannot drift silently.
function prismaEnumMembers(schema: string, name: string): string[] {
  const block = new RegExp(`enum ${name} \\{([^}]*)\\}`, 'm').exec(schema);
  if (block === null || block[1] === undefined) {
    throw new Error(`enum ${name} not found in schema.prisma`);
  }
  return block[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));
}

describe('category contract', () => {
  it('matches the Prisma BlogCategory enum exactly', () => {
    const schemaPath = resolve(__dirname, '../../../api/prisma/schema.prisma');
    const schema = readFileSync(schemaPath, 'utf8');
    expect(prismaEnumMembers(schema, 'BlogCategory').sort()).toEqual(
      [...BLOG_CATEGORIES].sort(),
    );
  });
});
