import { describe, it, expect } from 'vitest';
import { analyzePatterns } from '../src/analyzers/patterns';
import { DEFAULT_CONFIG } from '../src/config';
import { mkCommit, mkSeries } from './fixtures';

describe('analyzePatterns', () => {
  it('handles empty input', () => {
    const res = analyzePatterns([]);
    expect(res.longestStreak).toBe(0);
    expect(res.longestDrought).toBe(0);
    expect(res.consistencyScore).toBe(0);
  });

  it('computes longest streak for consecutive days', () => {
    const res = analyzePatterns(mkSeries(5));
    expect(res.longestStreak).toBe(5);
  });

  it('computes longest drought between activity', () => {
    const commits = [
      mkCommit({ date: new Date('2024-06-01T10:00:00Z') }),
      mkCommit({ date: new Date('2024-06-15T10:00:00Z') }), // 14-day drought
      mkCommit({ date: new Date('2024-06-16T10:00:00Z') }),
    ];
    const res = analyzePatterns(commits);
    expect(res.longestDrought).toBe(13);
  });

  it('flags big dumps by file threshold', () => {
    const commits = [
      mkCommit({ filesChanged: 50, insertions: 10, deletions: 0 }),
      mkCommit({ filesChanged: 2, insertions: 10, deletions: 0 }),
    ];
    const res = analyzePatterns(commits);
    expect(res.bigDumps.length).toBe(1);
  });

  it('flags big dumps by line-change threshold even with few files', () => {
    const commits = [mkCommit({ filesChanged: 1, insertions: 600, deletions: 50 })];
    const res = analyzePatterns(commits);
    expect(res.bigDumps.length).toBe(1);
  });

  it('respects config overrides for big-dump thresholds', () => {
    const commits = [mkCommit({ filesChanged: 10, insertions: 10, deletions: 0 })];
    const defaultRes = analyzePatterns(commits);
    expect(defaultRes.bigDumps.length).toBe(0);

    const strict = analyzePatterns(commits, {
      ...DEFAULT_CONFIG,
      bigDumpFileThreshold: 5,
    });
    expect(strict.bigDumps.length).toBe(1);
  });

  it('consistency = active days / total span', () => {
    const commits = mkSeries(3); // 3 consecutive days
    const res = analyzePatterns(commits);
    expect(res.totalActiveDays).toBe(3);
    expect(res.totalDaysSpan).toBe(3);
    expect(res.consistencyScore).toBe(100);
  });
});
