/** Raw commit data extracted from Git log */
export interface CommitData {
  hash: string;
  author: string;
  email: string;
  date: Date;
  message: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

/** Timing analysis results */
export interface TimingAnalysis {
  totalCommits: number;
  lateNightCommits: number;
  weekendCommits: number;
  fridayAfternoonCommits: number;
  hourDistribution: number[];
  dayDistribution: number[];
  busiestHour: number;
  busiestDay: number;
  lateNightPercentage: number;
  weekendPercentage: number;
}

/** Commit message analysis results */
export interface MessageAnalysis {
  averageLength: number;
  shortestMessage: string;
  longestMessage: string;
  lazyMessages: LazyMessageMatch[];
  lazyMessagePercentage: number;
  repeatedMessages: RepeatedMessage[];
  allCapsMessages: number;
  oneWordMessages: number;
  totalMessages: number;
}

/** A lazy commit message match */
export interface LazyMessageMatch {
  message: string;
  count: number;
}

/** A repeated commit message */
export interface RepeatedMessage {
  message: string;
  count: number;
}

/** Commit pattern analysis results */
export interface PatternAnalysis {
  longestStreak: number;
  currentStreak: number;
  longestDrought: number;
  averageCommitsPerDay: number;
  bigDumps: BigDump[];
  totalActiveDays: number;
  totalDaysSpan: number;
  consistencyScore: number;
}

/** A suspiciously large commit */
export interface BigDump {
  hash: string;
  date: Date;
  message: string;
  filesChanged: number;
  totalChanges: number;
}

/** File pattern analysis results */
export interface FileAnalysis {
  totalFilesChanged: number;
  largestCommitFiles: number;
  largestCommitHash: string;
  averageFilesPerCommit: number;
  totalInsertions: number;
  totalDeletions: number;
  addDeleteRatio: number;
}

/** Combined analysis result from all analyzers */
export interface AnalysisResult {
  timing: TimingAnalysis;
  messages: MessageAnalysis;
  patterns: PatternAnalysis;
  files: FileAnalysis;
  meta: {
    author: string;
    repoName: string;
    totalCommits: number;
    firstCommitDate: Date;
    lastCommitDate: Date;
  };
}

/** A single roast entry */
export interface Roast {
  category: RoastCategory;
  emoji: string;
  text: string;
  severity: 'mild' | 'medium' | 'savage';
}

/** Roast categories */
export type RoastCategory = 'timing' | 'messages' | 'patterns' | 'files' | 'general';

/** Individual category score */
export interface CategoryScore {
  category: RoastCategory;
  score: number;
  grade: string;
  label: string;
}

/** Overall roast score and level */
export interface RoastScore {
  overall: number;
  level: RoastLevel;
  categoryScores: CategoryScore[];
}

/** Roast level titles from best to worst */
export type RoastLevel =
  | 'Golden Developer'
  | 'Decent Human'
  | 'Chaotic Neutral'
  | 'Code Gremlin'
  | 'Absolute Menace';

/** Full roast result */
export interface RoastResult {
  roasts: Roast[];
  score: RoastScore;
  stats: AnalysisResult;
}
