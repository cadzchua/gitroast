import { CommitData, MessageAnalysis, LazyMessageMatch, RepeatedMessage } from '../types';

/** Patterns that indicate lazy commit messages */
const LAZY_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /^fix$/i, label: 'fix' },
  { pattern: /^fix\s*(bug|typo|it|stuff|things)?$/i, label: 'fix *' },
  { pattern: /^wip$/i, label: 'wip' },
  { pattern: /^update$/i, label: 'update' },
  { pattern: /^updates?$/i, label: 'update(s)' },
  { pattern: /^changes?$/i, label: 'change(s)' },
  { pattern: /^stuff$/i, label: 'stuff' },
  { pattern: /^test$/i, label: 'test' },
  { pattern: /^tmp$/i, label: 'tmp' },
  { pattern: /^temp$/i, label: 'temp' },
  { pattern: /^asdf+$/i, label: 'asdf...' },
  { pattern: /^\.+$/i, label: '...' },
  { pattern: /^-+$/i, label: '---' },
  { pattern: /^[a-z]$/i, label: 'single letter' },
  { pattern: /^init(ial)?(\s+commit)?$/i, label: 'initial commit' },
  { pattern: /^first commit$/i, label: 'first commit' },
  { pattern: /^save$/i, label: 'save' },
  { pattern: /^commit$/i, label: 'commit' },
  { pattern: /^done$/i, label: 'done' },
  { pattern: /^finished$/i, label: 'finished' },
  { pattern: /^idk$/i, label: 'idk' },
  { pattern: /^lol$/i, label: 'lol' },
  { pattern: /^yolo$/i, label: 'yolo' },
  { pattern: /^plz work$/i, label: 'plz work' },
  { pattern: /^please work$/i, label: 'please work' },
  { pattern: /^work(ing)?$/i, label: 'work(ing)' },
  { pattern: /^minor$/i, label: 'minor' },
  { pattern: /^misc$/i, label: 'misc' },
  { pattern: /^cleanup$/i, label: 'cleanup' },
  { pattern: /^refactor$/i, label: 'refactor' },
];

/**
 * Analyzes commit message quality.
 * Detects lazy messages, repeated messages, and message length patterns.
 */
export function analyzeMessages(commits: CommitData[]): MessageAnalysis {
  if (commits.length === 0) {
    return {
      averageLength: 0,
      shortestMessage: '',
      longestMessage: '',
      lazyMessages: [],
      lazyMessagePercentage: 0,
      repeatedMessages: [],
      allCapsMessages: 0,
      oneWordMessages: 0,
      totalMessages: 0,
    };
  }

  const messages = commits.map((c) => c.message.trim());
  const lengths = messages.map((m) => m.length);

  // Find lazy messages
  const lazyCounts = new Map<string, number>();
  let totalLazy = 0;

  for (const msg of messages) {
    for (const { pattern, label } of LAZY_PATTERNS) {
      if (pattern.test(msg.trim())) {
        lazyCounts.set(label, (lazyCounts.get(label) || 0) + 1);
        totalLazy++;
        break; // Only match first pattern
      }
    }
  }

  const lazyMessages: LazyMessageMatch[] = Array.from(lazyCounts.entries())
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count);

  // Find repeated messages
  const messageCounts = new Map<string, number>();
  for (const msg of messages) {
    const normalized = msg.toLowerCase().trim();
    messageCounts.set(normalized, (messageCounts.get(normalized) || 0) + 1);
  }

  const repeatedMessages: RepeatedMessage[] = Array.from(messageCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Count all-caps messages (excluding short ones)
  const allCapsMessages = messages.filter(
    (m) => m.length > 3 && m === m.toUpperCase() && /[A-Z]/.test(m),
  ).length;

  // Count one-word messages
  const oneWordMessages = messages.filter((m) => m.split(/\s+/).length === 1).length;

  // Shortest and longest
  const sortedByLength = [...messages].sort((a, b) => a.length - b.length);

  return {
    averageLength: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
    shortestMessage: sortedByLength[0],
    longestMessage: sortedByLength[sortedByLength.length - 1],
    lazyMessages,
    lazyMessagePercentage: commits.length > 0 ? (totalLazy / commits.length) * 100 : 0,
    repeatedMessages,
    allCapsMessages,
    oneWordMessages,
    totalMessages: messages.length,
  };
}
