import { CommitData, PatternAnalysis, BigDump } from '../types';

/** Threshold for considering a commit a "big dump" (number of files) */
const BIG_DUMP_FILE_THRESHOLD = 20;
const BIG_DUMP_CHANGE_THRESHOLD = 500;

/**
 * Analyzes commit frequency patterns.
 * Detects streaks, droughts, big dumps, and consistency.
 */
export function analyzePatterns(commits: CommitData[]): PatternAnalysis {
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

  // Sort commits by date (oldest first)
  const sorted = [...commits].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get unique active days
  const activeDays = new Set<string>();
  for (const commit of sorted) {
    activeDays.add(toDateKey(commit.date));
  }

  const totalActiveDays = activeDays.size;
  const firstDate = sorted[0].date;
  const lastDate = sorted[sorted.length - 1].date;
  const totalDaysSpan = Math.max(1, daysBetween(firstDate, lastDate) + 1);

  // Calculate streaks and droughts
  const sortedDays = Array.from(activeDays).sort();
  const { longestStreak, currentStreak, longestDrought } = calculateStreaks(sortedDays);

  // Detect big dumps (unusually large commits)
  const bigDumps: BigDump[] = sorted
    .filter(
      (c) =>
        c.filesChanged >= BIG_DUMP_FILE_THRESHOLD ||
        c.insertions + c.deletions >= BIG_DUMP_CHANGE_THRESHOLD,
    )
    .map((c) => ({
      hash: c.hash.substring(0, 7),
      date: c.date,
      message: c.message,
      filesChanged: c.filesChanged,
      totalChanges: c.insertions + c.deletions,
    }))
    .slice(0, 5); // Top 5

  // Consistency score: ratio of active days to total span (0-100)
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

/** Calculates longest streak, current streak, and longest drought from sorted date keys */
function calculateStreaks(sortedDays: string[]): {
  longestStreak: number;
  currentStreak: number;
  longestDrought: number;
} {
  if (sortedDays.length === 0) {
    return { longestStreak: 0, currentStreak: 0, longestDrought: 0 };
  }

  let longestStreak = 1;
  let currentStreakCount = 1;
  let longestDrought = 0;
  let streakCount = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const gap = daysBetween(prevDate, currDate);

    if (gap === 1) {
      // Consecutive days
      streakCount++;
      longestStreak = Math.max(longestStreak, streakCount);
    } else {
      // Streak broken
      longestDrought = Math.max(longestDrought, gap - 1);
      streakCount = 1;
    }
  }

  // Current streak: check if the last active day is today or yesterday
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  const lastDay = sortedDays[sortedDays.length - 1];

  if (lastDay === today || lastDay === yesterday) {
    // Count backward from the end
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
  } else {
    currentStreakCount = 0;
  }

  return {
    longestStreak,
    currentStreak: currentStreakCount,
    longestDrought,
  };
}

/** Converts a Date to a YYYY-MM-DD string */
function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Calculates the number of days between two dates */
function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.round(Math.abs(b.getTime() - a.getTime()) / msPerDay);
}
