import { describe, it, expect } from 'vitest';
import { generateRoasts } from '../src/roaster';
import { AnalysisResult } from '../src/types';

function roastyStats(): AnalysisResult {
  return {
    timing: {
      totalCommits: 50,
      lateNightCommits: 30,
      weekendCommits: 20,
      fridayAfternoonCommits: 8,
      hourDistribution: new Array(24).fill(0),
      dayDistribution: new Array(7).fill(0),
      busiestHour: 2,
      busiestDay: 0,
      lateNightPercentage: 60,
      weekendPercentage: 40,
    },
    messages: {
      averageLength: 6,
      shortestMessage: '.',
      longestMessage: 'fix bug again',
      lazyMessages: [{ message: 'fix', count: 20 }],
      lazyMessagePercentage: 50,
      repeatedMessages: [{ message: 'fix', count: 20 }],
      allCapsMessages: 5,
      oneWordMessages: 25,
      totalMessages: 50,
    },
    patterns: {
      longestStreak: 3,
      currentStreak: 0,
      longestDrought: 45,
      averageCommitsPerDay: 0.5,
      bigDumps: [
        {
          hash: 'deadbee',
          date: new Date('2024-03-01'),
          message: 'big dump',
          filesChanged: 100,
          totalChanges: 2000,
        },
      ],
      totalActiveDays: 5,
      totalDaysSpan: 100,
      consistencyScore: 5,
    },
    files: {
      totalFilesChanged: 500,
      largestCommitFiles: 100,
      largestCommitHash: 'deadbee',
      averageFilesPerCommit: 10,
      totalInsertions: 1000,
      totalDeletions: 2000,
      addDeleteRatio: 0.5,
    },
    meta: {
      author: 'Alice',
      repoName: 'chaos',
      totalCommits: 50,
      firstCommitDate: new Date('2024-01-01'),
      lastCommitDate: new Date('2024-04-10'),
    },
  };
}

describe('generateRoasts', () => {
  it('produces roasts for bad habits', () => {
    const res = generateRoasts(roastyStats());
    expect(res.roasts.length).toBeGreaterThan(0);
    expect(res.score.overall).toBeLessThan(50);
  });

  it('respects maxRoasts option', () => {
    const res = generateRoasts(roastyStats(), { maxRoasts: 3 });
    expect(res.roasts.length).toBeLessThanOrEqual(3);
  });

  it('always returns at least MIN_ROASTS including fallback', () => {
    // Minimal clean stats will trigger few/no applicable templates
    const clean: AnalysisResult = {
      ...roastyStats(),
      timing: {
        ...roastyStats().timing,
        lateNightPercentage: 10,
        weekendPercentage: 5,
        fridayAfternoonCommits: 0,
        busiestHour: 14,
        busiestDay: 2,
      },
      messages: {
        ...roastyStats().messages,
        averageLength: 55,
        lazyMessagePercentage: 2,
        oneWordMessages: 0,
        allCapsMessages: 0,
        repeatedMessages: [],
      },
      patterns: {
        ...roastyStats().patterns,
        longestDrought: 2,
        bigDumps: [],
        consistencyScore: 85,
        longestStreak: 5,
        averageCommitsPerDay: 3,
      },
      files: {
        ...roastyStats().files,
        addDeleteRatio: 2,
        averageFilesPerCommit: 3,
        largestCommitFiles: 10,
      },
      meta: { ...roastyStats().meta, totalCommits: 100 },
    };
    const res = generateRoasts(clean);
    expect(res.roasts.length).toBeGreaterThanOrEqual(1);
  });
});
