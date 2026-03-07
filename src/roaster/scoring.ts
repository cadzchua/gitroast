import { AnalysisResult, RoastScore, RoastLevel, CategoryScore, RoastCategory } from '../types';

/**
 * Calculates per-category scores and an overall roast level.
 * Lower score = worse habits = harder roast.
 * Score range: 0-100
 */
export function calculateScore(stats: AnalysisResult): RoastScore {
  const timingScore = calculateTimingScore(stats);
  const messageScore = calculateMessageScore(stats);
  const patternScore = calculatePatternScore(stats);
  const fileScore = calculateFileScore(stats);

  const categoryScores: CategoryScore[] = [
    { category: 'timing', score: timingScore, ...toGrade(timingScore, 'Timing') },
    { category: 'messages', score: messageScore, ...toGrade(messageScore, 'Messages') },
    { category: 'patterns', score: patternScore, ...toGrade(patternScore, 'Patterns') },
    { category: 'files', score: fileScore, ...toGrade(fileScore, 'Files') },
  ];

  const overall = Math.round(
    (timingScore + messageScore + patternScore + fileScore) / 4,
  );

  const level = getLevel(overall);

  return { overall, level, categoryScores };
}

/** Timing score: penalizes late nights, weekends, Friday deploys */
function calculateTimingScore(stats: AnalysisResult): number {
  let score = 100;

  // Late night penalty (up to 40 points)
  score -= Math.min(40, stats.timing.lateNightPercentage * 0.8);

  // Weekend penalty (up to 20 points)
  score -= Math.min(20, stats.timing.weekendPercentage * 0.4);

  // Friday afternoon penalty (up to 20 points)
  const fridayPct =
    stats.timing.totalCommits > 0
      ? (stats.timing.fridayAfternoonCommits / stats.timing.totalCommits) * 100
      : 0;
  score -= Math.min(20, fridayPct * 2);

  return clamp(Math.round(score));
}

/** Message score: penalizes short, lazy, repeated messages */
function calculateMessageScore(stats: AnalysisResult): number {
  let score = 100;

  // Short message penalty (up to 30 points)
  if (stats.messages.averageLength < 50) {
    score -= Math.min(30, (50 - stats.messages.averageLength) * 0.6);
  }

  // Lazy message penalty (up to 35 points)
  score -= Math.min(35, stats.messages.lazyMessagePercentage * 0.7);

  // One-word message penalty (up to 20 points)
  const oneWordPct =
    stats.messages.totalMessages > 0
      ? (stats.messages.oneWordMessages / stats.messages.totalMessages) * 100
      : 0;
  score -= Math.min(20, oneWordPct * 0.4);

  // All-caps penalty (up to 10 points)
  score -= Math.min(10, stats.messages.allCapsMessages * 2);

  return clamp(Math.round(score));
}

/** Pattern score: penalizes droughts, inconsistency, big dumps */
function calculatePatternScore(stats: AnalysisResult): number {
  let score = 100;

  // Drought penalty (up to 25 points)
  score -= Math.min(25, stats.patterns.longestDrought * 0.5);

  // Inconsistency penalty (up to 30 points)
  score -= Math.min(30, (100 - stats.patterns.consistencyScore) * 0.3);

  // Big dump penalty (up to 20 points)
  score -= Math.min(20, stats.patterns.bigDumps.length * 5);

  return clamp(Math.round(score));
}

/** File score: penalizes large commits and extreme add/delete ratios */
function calculateFileScore(stats: AnalysisResult): number {
  let score = 100;

  // Large average files per commit penalty (up to 25 points)
  if (stats.files.averageFilesPerCommit > 5) {
    score -= Math.min(25, (stats.files.averageFilesPerCommit - 5) * 2);
  }

  // Extreme add/delete ratio penalty (up to 20 points)
  if (stats.files.addDeleteRatio < 0.5 || stats.files.addDeleteRatio > 10) {
    score -= 20;
  } else if (stats.files.addDeleteRatio < 0.8 || stats.files.addDeleteRatio > 5) {
    score -= 10;
  }

  // Largest commit penalty (up to 20 points)
  if (stats.files.largestCommitFiles > 50) {
    score -= 20;
  } else if (stats.files.largestCommitFiles > 20) {
    score -= 10;
  }

  return clamp(Math.round(score));
}

/** Converts a numeric score to a letter grade */
function toGrade(score: number, label: string): { grade: string; label: string } {
  if (score >= 95) return { grade: 'A+', label };
  if (score >= 90) return { grade: 'A', label };
  if (score >= 85) return { grade: 'A-', label };
  if (score >= 80) return { grade: 'B+', label };
  if (score >= 75) return { grade: 'B', label };
  if (score >= 70) return { grade: 'B-', label };
  if (score >= 65) return { grade: 'C+', label };
  if (score >= 60) return { grade: 'C', label };
  if (score >= 55) return { grade: 'C-', label };
  if (score >= 50) return { grade: 'D+', label };
  if (score >= 45) return { grade: 'D', label };
  if (score >= 40) return { grade: 'D-', label };
  return { grade: 'F', label };
}

/** Maps overall score to a roast level */
function getLevel(overall: number): RoastLevel {
  if (overall >= 80) return 'Golden Developer';
  if (overall >= 60) return 'Decent Human';
  if (overall >= 40) return 'Chaotic Neutral';
  if (overall >= 20) return 'Code Gremlin';
  return 'Absolute Menace';
}

/** Clamp a value between 0 and 100 */
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
