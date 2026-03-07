import { CommitData, TimingAnalysis } from '../types';

/** Hour range considered "late night" (10 PM - 5 AM) */
const LATE_NIGHT_START = 22;
const LATE_NIGHT_END = 5;

/** Friday = 5 in JS Date.getDay(), afternoon starts at 2 PM */
const FRIDAY = 5;
const FRIDAY_AFTERNOON_START = 14;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Analyzes commit timing patterns.
 * Detects late night coding, weekend commits, and Friday afternoon deploys.
 */
export function analyzeTimings(commits: CommitData[]): TimingAnalysis {
  const hourDistribution = new Array(24).fill(0) as number[];
  const dayDistribution = new Array(7).fill(0) as number[];

  let lateNightCommits = 0;
  let weekendCommits = 0;
  let fridayAfternoonCommits = 0;

  for (const commit of commits) {
    const hour = commit.date.getHours();
    const day = commit.date.getDay();

    hourDistribution[hour]++;
    dayDistribution[day]++;

    // Late night: 10 PM - 5 AM
    if (hour >= LATE_NIGHT_START || hour < LATE_NIGHT_END) {
      lateNightCommits++;
    }

    // Weekend: Saturday (6) or Sunday (0)
    if (day === 0 || day === 6) {
      weekendCommits++;
    }

    // Friday afternoon: Friday after 2 PM
    if (day === FRIDAY && hour >= FRIDAY_AFTERNOON_START) {
      fridayAfternoonCommits++;
    }
  }

  const busiestHour = hourDistribution.indexOf(Math.max(...hourDistribution));
  const busiestDay = dayDistribution.indexOf(Math.max(...dayDistribution));

  return {
    totalCommits: commits.length,
    lateNightCommits,
    weekendCommits,
    fridayAfternoonCommits,
    hourDistribution,
    dayDistribution,
    busiestHour,
    busiestDay,
    lateNightPercentage: commits.length > 0 ? (lateNightCommits / commits.length) * 100 : 0,
    weekendPercentage: commits.length > 0 ? (weekendCommits / commits.length) * 100 : 0,
  };
}

/** Formats hour to 12-hour AM/PM string */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

/** Gets the day name from day index */
export function getDayName(day: number): string {
  return DAY_NAMES[day] || 'Unknown';
}
