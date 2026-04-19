import { CommitData, TimingAnalysis } from '../types';
import { GitRoastConfig, DEFAULT_CONFIG } from '../config';

const FRIDAY = 5;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Analyzes commit timing patterns.
 * Detects late night coding, weekend commits, and Friday afternoon deploys.
 */
export function analyzeTimings(
  commits: CommitData[],
  config: GitRoastConfig = DEFAULT_CONFIG,
): TimingAnalysis {
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

    if (hour >= config.lateNightStartHour || hour < config.lateNightEndHour) {
      lateNightCommits++;
    }

    if (day === 0 || day === 6) {
      weekendCommits++;
    }

    if (day === FRIDAY && hour >= config.fridayAfternoonStartHour) {
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

export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

export function getDayName(day: number): string {
  return DAY_NAMES[day] || 'Unknown';
}
