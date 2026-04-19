import { describe, it, expect } from 'vitest';
import { analyzeMessages } from '../src/analyzers/messages';
import { DEFAULT_CONFIG } from '../src/config';
import { mkCommit } from './fixtures';

describe('analyzeMessages', () => {
  it('handles empty input', () => {
    const res = analyzeMessages([]);
    expect(res.totalMessages).toBe(0);
    expect(res.averageLength).toBe(0);
  });

  it('detects lazy messages', () => {
    const commits = [
      mkCommit({ message: 'fix' }),
      mkCommit({ message: 'wip' }),
      mkCommit({ message: 'update' }),
      mkCommit({ message: 'feat: add proper auth middleware' }),
    ];
    const res = analyzeMessages(commits);
    expect(res.lazyMessagePercentage).toBeGreaterThan(70);
    expect(res.lazyMessages.length).toBeGreaterThan(0);
  });

  it('counts one-word and ALL CAPS messages', () => {
    const commits = [
      mkCommit({ message: 'fix' }),
      mkCommit({ message: 'WHY DOES THIS NOT WORK' }),
      mkCommit({ message: 'feat: add user profile' }),
    ];
    const res = analyzeMessages(commits);
    expect(res.oneWordMessages).toBe(1);
    expect(res.allCapsMessages).toBe(1);
  });

  it('finds repeated messages', () => {
    const commits = [
      mkCommit({ message: 'fix bug' }),
      mkCommit({ message: 'fix bug' }),
      mkCommit({ message: 'fix bug' }),
      mkCommit({ message: 'add feature' }),
    ];
    const res = analyzeMessages(commits);
    expect(res.repeatedMessages[0]).toMatchObject({ message: 'fix bug', count: 3 });
  });

  it('supports extra lazy patterns from config', () => {
    const commits = [mkCommit({ message: 'ugh' })];
    const res = analyzeMessages(commits, {
      ...DEFAULT_CONFIG,
      extraLazyPatterns: [{ pattern: '^ugh$', label: 'ugh' }],
    });
    expect(res.lazyMessagePercentage).toBe(100);
  });
});
