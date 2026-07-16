import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { SERVER_VERSION } from '../src/version.js';

describe('version', () => {
  it('SERVER_VERSION matches package.json', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(SERVER_VERSION).toBe(pkg.version);
  });
});
