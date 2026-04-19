import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/roaster/scoring';
import { AnalysisResult } from '../src/types';

function baseStats(): AnalysisResult {
  return {
    timing: {
      totalCommits: 100,
      lateNightCommits: 0,
      weekendCommits: 0,
      fridayAfternoonCommits: 0,
      hourDistribution: new Array(24).fill(0),
      dayDistribution: new Array(7).fill(0),
      busiestHour: 14,
      busiestDay: 2,
      lateNightPercentage: 0,
      weekendPercentage: 0,
    },
    messages: {
      averageLength: 60,
      shortestMessage: 'good one',
      longestMessage: 'much longer message here',
      lazyMessages: [],
      lazyMessagePercentage: 0,
      repeatedMessages: [],
      allCapsMessages: 0,
      oneWordMessages: 0,
      totalMessages: 100,
    },
    patterns: {
      longestStreak: 10,
      currentStreak: 0,
      longestDrought: 2,
      averageCommitsPerDay: 2,
      bigDumps: [],
      totalActiveDays: 50,
      totalDaysSpan: 60,
      consistencyScore: 83,
    },
    files: {
      totalFilesChanged: 200,
      largestCommitFiles: 10,
      largestCommitHash: 'abc1234',
      averageFilesPerCommit: 2,
      totalInsertions: 1000,
      totalDeletions: 500,
      addDeleteRatio: 2,
    },
    meta: {
      author: 'Alice',
      repoName: 'example',
      totalCommits: 100,
      firstCommitDate: new Date('2024-01-01'),
      lastCommitDate: new Date('2024-06-01'),
    },
  };
}

describe('calculateScore', () => {
  it('rewards clean habits with a high overall score', () => {
    const res = calculateScore(baseStats());
    expect(res.overall).toBeGreaterThanOrEqual(85);
    expect(res.level).toBe('Golden Developer');
  });

  it('penalizes heavy late-night coding', () => {
    const stats = baseStats();
    stats.timing.lateNightPercentage = 80;
    stats.timing.weekendPercentage = 50;
    const res = calculateScore(stats);
    const timing = res.categoryScores.find((c) => c.category === 'timing')!;
    expect(timing.score).toBeLessThanOrEqual(60);
  });

  it('penalizes lazy messages', () => {
    const stats = baseStats();
    stats.messages.lazyMessagePercentage = 60;
    stats.messages.averageLength = 8;
    const res = calculateScore(stats);
    const msg = res.categoryScores.find((c) => c.category === 'messages')!;
    expect(msg.score).toBeLessThan(50);
  });

  it('clamps to [0, 100]', () => {
    const stats = baseStats();
    stats.timing.lateNightPercentage = 500;
    stats.timing.weekendPercentage = 500;
    const res = calculateScore(stats);
    for (const cs of res.categoryScores) {
      expect(cs.score).toBeGreaterThanOrEqual(0);
      expect(cs.score).toBeLessThanOrEqual(100);
    }
  });
});
