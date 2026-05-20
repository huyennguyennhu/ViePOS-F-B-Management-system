import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('dashboard shell assets', () => {
  it('stores runtime logo assets and the canonical shell reference', () => {
    const requiredAssets = [
      'public/images/logo.svg',
      'public/images/logomark.svg',
      'public/images/logo-white.svg',
      'public/images/logomark-white.svg',
      'plans/260520-1749-pos-internal-ui-shell-implementation/assets/canonical-dashboard-shell-1440x1024.svg',
    ];

    expect(
      requiredAssets.filter((assetPath) => !existsSync(path.join(root, assetPath)))
    ).toEqual([]);
  });
});
