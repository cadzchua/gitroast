import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadUserConfig, DEFAULT_CONFIG } from '../src/config';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gitroast-'));

afterEach(() => {
  for (const f of fs.readdirSync(tmp)) fs.unlinkSync(path.join(tmp, f));
});

describe('loadUserConfig', () => {
  it('returns defaults when no config file exists', () => {
    const cfg = loadUserConfig(tmp);
    expect(cfg).toEqual(DEFAULT_CONFIG);
  });

  it('merges user overrides', () => {
    fs.writeFileSync(
      path.join(tmp, '.gitroastrc'),
      JSON.stringify({ maxRoasts: 5, bigDumpFileThreshold: 100 }),
    );
    const cfg = loadUserConfig(tmp);
    expect(cfg.maxRoasts).toBe(5);
    expect(cfg.bigDumpFileThreshold).toBe(100);
    // untouched keys still default
    expect(cfg.minRoasts).toBe(DEFAULT_CONFIG.minRoasts);
  });

  it('silently ignores malformed JSON', () => {
    fs.writeFileSync(path.join(tmp, '.gitroastrc'), '{ not valid');
    const cfg = loadUserConfig(tmp);
    expect(cfg).toEqual(DEFAULT_CONFIG);
  });
});
