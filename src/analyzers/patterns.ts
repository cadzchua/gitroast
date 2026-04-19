import { CommitData, PatternAnalysis, BigDump } from '../types';
import { GitRoastConfig, DEFAULT_CONFIG } from '../config';

/**
 * Analyzes commit frequency patterns.
 * Detects streaks, droughts, big dumps, and consistency.
 */
export function analyzePatterns(
  commits: CommitData[],
  config: GitRoastConfig = DEFAULT_CONFIG,
): PatternAnalysis {
  if (commits.length === 0) {
    return {
      longestStreak: 0,
      currentStreak: 0,
      longestDrought: 0,
      averageCommitsPerDay: 0,
      bigDumps: [],
      totalActiveDays: 0,
      totalDaysSpan: 0,
      consistencyScore: 0,
    };
  }

  const sorted = [...commits].sort((a, b) => a.date.getTime() - b.date.getTime());

  const activeDays = new Set<string>();
  for (const commit of sorted) {
    activeDays.add(toDateKey(commit.date));
  }

  const totalActiveDays = activeDays.size;
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;
  const totalDaysSpan = Math.max(1, daysBetween(firstDate, lastDate) + 1);

  const sortedDays = Array.from(activeDays).sort();
  const { longestStreak, currentStreak, longestDrought } = calculateStreaks(sortedDays);

  const bigDumps: BigDump[] = sorted
    .filter(
      (c) =>
        c.filesChanged >= config.bigDumpFileThreshold ||
        c.insertions + c.deletions >= config.bigDumpChangeThreshold,
    )
    .map((c) => ({
      hash: c.hash.substring(0, 7),
      date: c.date,
      message: c.message,
      filesChanged: c.filesChanged,
      totalChanges: c.insertions + c.deletions,
    }))
    .slice(0, 5);

  const consistencyScore = Math.round((totalActiveDays / totalDaysSpan) * 100);

  return {
    longestStreak,
    currentStreak,
    longestDrought,
    averageCommitsPerDay: Math.round((commits.length / totalDaysSpan) * 100) / 100,
    bigDumps,
    totalActiveDays,
    totalDaysSpan,
    consistencyScore,
  };
}

function calculateStreaks(sortedDays: string[]): {
  longestStreak: number;
  currentStreak: number;
  longestDrought: number;
} {
  if (sortedDays.length === 0) {
    return { longestStreak: 0, currentStreak: 0, longestDrought: 0 };
  }

  let longestStreak = 1;
  let longestDrought = 0;
  let streakCount = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const gap = daysBetween(prevDate, currDate);

    if (gap === 1) {
      streakCount++;
      longestStreak = Math.max(longestStreak, streakCount);
    } else {
      longestDrought = Math.max(longestDrought, gap - 1);
      streakCount = 1;
    }
  }

  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  const lastDay = sortedDays[sortedDays.length - 1];
  let currentStreakCount = 0;

  if (lastDay === today || lastDay === yesterday) {
    currentStreakCount = 1;
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const currDate = new Date(sortedDays[i + 1]);
      const prevDate = new Date(sortedDays[i]);
      if (daysBetween(prevDate, currDate) === 1) {
        currentStreakCount++;
      } else {
        break;
      }
    }
  }

  return { longestStreak, currentStreak: currentStreakCount, longestDrought };
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.round(Math.abs(b.getTime() - a.getTime()) / msPerDay);
}
