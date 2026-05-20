import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const productionRoots = ['app', 'components', 'lib', 'server'];
const forbiddenImports = [
  '@/lib/auth/browser-accounts',
  '@/lib/auth/browser-session',
  '@/lib/auth/demo-auth',
];

const collectSourceFiles = (directory: string): string[] => {
  if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return collectSourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
};

describe('production auth guard', () => {
  it('does not import browser-only demo auth helpers from production code', () => {
    const offenders = productionRoots
      .flatMap(collectSourceFiles)
      .filter((file) => forbiddenImports.some((target) => readFileSync(file, 'utf8').includes(target)))
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });
});
