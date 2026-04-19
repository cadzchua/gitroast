import { describe, it, expect } from 'vitest';
import { analyzeTimings, formatHour, getDayName } from '../src/analyzers/timing';
import { DEFAULT_CONFIG } from '../src/config';
import { mkCommit } from './fixtures';

describe('analyzeTimings', () => {
  it('returns zeroed stats for empty input', () => {
    const res = analyzeTimings([]);
    expect(res.totalCommits).toBe(0);
    expect(res.lateNightPercentage).toBe(0);
    expect(res.weekendPercentage).toBe(0);
  });

  it('counts late-night commits (10pm-5am local)', () => {
    // Construct dates in local tz so hour semantics are deterministic
    const commits = [
      mkCommit({ date: new Date(2024, 5, 10, 23, 0) }), // Mon 11pm — late night
      mkCommit({ date: new Date(2024, 5, 11, 3, 0) }), // Tue 3am — late night
      mkCommit({ date: new Date(2024, 5, 11, 12, 0) }), // Tue noon — not
    ];
    const res = analyzeTimings(commits);
    expect(res.lateNightCommits).toBe(2);
    expect(Math.round(res.lateNightPercentage)).toBe(67);
  });

  it('counts weekend commits', () => {
    const commits = [
      mkCommit({ date: new Date(2024, 5, 8, 10) }), // Sat
      mkCommit({ date: new Date(2024, 5, 9, 10) }), // Sun
      mkCommit({ date: new Date(2024, 5, 10, 10) }), // Mon
    ];
    const res = analyzeTimings(commits);
    expect(res.weekendCommits).toBe(2);
  });

  it('counts Friday afternoon commits', () => {
    const commits = [
      mkCommit({ date: new Date(2024, 5, 7, 15) }), // Fri 3pm
      mkCommit({ date: new Date(2024, 5, 7, 10) }), // Fri 10am — too early
    ];
    const res = analyzeTimings(commits);
    expect(res.fridayAfternoonCommits).toBe(1);
  });

  it('respects custom thresholds from config', () => {
    const commits = [mkCommit({ date: new Date(2024, 5, 10, 20) })]; // Mon 8pm
    const def = analyzeTimings(commits);
    expect(def.lateNightCommits).toBe(0);

    const strict = analyzeTimings(commits, {
      ...DEFAULT_CONFIG,
      lateNightStartHour: 18,
    });
    expect(strict.lateNightCommits).toBe(1);
  });
});

describe('formatHour / getDayName', () => {
  it('formats hours in 12-hour form', () => {
    expect(formatHour(0)).toBe('12 AM');
    expect(formatHour(12)).toBe('12 PM');
    expect(formatHour(9)).toBe('9 AM');
    expect(formatHour(21)).toBe('9 PM');
  });

  it('returns day names', () => {
    expect(getDayName(0)).toBe('Sunday');
    expect(getDayName(6)).toBe('Saturday');
    expect(getDayName(99)).toBe('Unknown');
  });
});
