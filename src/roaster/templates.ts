import { AnalysisResult, Roast } from '../types';
import { formatHour, getDayName } from '../analyzers/timing';

interface RoastTemplate {
  category: Roast['category'];
  emoji: string;
  severity: Roast['severity'];
  condition: (stats: AnalysisResult) => boolean;
  messages: ((stats: AnalysisResult) => string)[];
}

/**
 * All roast templates organized by category.
 * Each template has a condition and multiple message variants for variety.
 */
export const ROAST_TEMPLATES: RoastTemplate[] = [
  // ============================================================
  //  TIMING ROASTS
  // ============================================================
  {
    category: 'timing',
    emoji: '⏰',
    severity: 'savage',
    condition: (s) => s.timing.lateNightPercentage > 50,
    messages: [
      (s) =>
        `${Math.round(s.timing.lateNightPercentage)}% of your commits are after midnight. Your code has insomnia and so do your bugs.`,
      (s) =>
        `Over half your commits happen between 10 PM and 5 AM. Have you considered that sleep might improve your code quality?`,
      (s) =>
        `${Math.round(s.timing.lateNightPercentage)}% late-night commits. Your keyboard should file a restraining order.`,
    ],
  },
  {
    category: 'timing',
    emoji: '⏰',
    severity: 'medium',
    condition: (s) => s.timing.lateNightPercentage > 25 && s.timing.lateNightPercentage <= 50,
    messages: [
      (s) =>
        `${Math.round(s.timing.lateNightPercentage)}% of your commits are late-night sessions. You're not a night owl — you're a code bat.`,
      () => `You code at night like a vampire. Except vampires are immortal and your code has bugs.`,
    ],
  },
  {
    category: 'timing',
    emoji: '⏰',
    severity: 'mild',
    condition: (s) => s.timing.lateNightPercentage <= 5 && s.timing.totalCommits > 20,
    messages: [
      () =>
        `You barely code at night. Either you have amazing work-life balance or you're secretly an AI.`,
    ],
  },
  {
    category: 'timing',
    emoji: '🍺',
    severity: 'savage',
    condition: (s) => s.timing.fridayAfternoonCommits > 5,
    messages: [
      (s) =>
        `You made ${s.timing.fridayAfternoonCommits} commits on Friday afternoons. You're the reason we have "no deploy Friday" rules.`,
      (s) =>
        `${s.timing.fridayAfternoonCommits} Friday afternoon commits? Your ops team hates you and they're right.`,
    ],
  },
  {
    category: 'timing',
    emoji: '📅',
    severity: 'medium',
    condition: (s) => s.timing.weekendPercentage > 30,
    messages: [
      (s) =>
        `${Math.round(s.timing.weekendPercentage)}% of your commits are on weekends. Touch grass. Please.`,
      (s) =>
        `You spend ${Math.round(s.timing.weekendPercentage)}% of your weekends coding. Your social life called — wait, no it didn't.`,
    ],
  },
  {
    category: 'timing',
    emoji: '⏰',
    severity: 'medium',
    condition: (s) => s.timing.busiestHour >= 22 || s.timing.busiestHour <= 4,
    messages: [
      (s) =>
        `Your most productive hour is ${formatHour(s.timing.busiestHour)}. Normal people are sleeping. You're creating technical debt.`,
    ],
  },
  {
    category: 'timing',
    emoji: '📅',
    severity: 'mild',
    condition: (s) => s.timing.busiestDay === 0 || s.timing.busiestDay === 6,
    messages: [
      (s) =>
        `Your busiest day is ${getDayName(s.timing.busiestDay)}. Most people rest on weekends. You rest on weekdays. Backwards.`,
    ],
  },

  // ============================================================
  //  MESSAGE ROASTS
  // ============================================================
  {
    category: 'messages',
    emoji: '💬',
    severity: 'savage',
    condition: (s) => s.messages.averageLength < 10,
    messages: [
      (s) =>
        `Your average commit message is ${s.messages.averageLength} characters. A sneeze contains more information.`,
      (s) =>
        `${s.messages.averageLength} characters average per commit message? Even Twitter thinks you need to say more.`,
    ],
  },
  {
    category: 'messages',
    emoji: '💬',
    severity: 'medium',
    condition: (s) => s.messages.averageLength >= 10 && s.messages.averageLength < 20,
    messages: [
      (s) =>
        `Your average commit message is ${s.messages.averageLength} characters. Your messages are shorter than most error codes.`,
    ],
  },
  {
    category: 'messages',
    emoji: '💬',
    severity: 'savage',
    condition: (s) => s.messages.lazyMessagePercentage > 30,
    messages: [
      (s) =>
        `${Math.round(s.messages.lazyMessagePercentage)}% of your commit messages are lazy one-liners like "${s.messages.lazyMessages[0]?.message}". Future you will have no idea what past you was doing.`,
      (s) =>
        `"${s.messages.lazyMessages[0]?.message}" appears ${s.messages.lazyMessages[0]?.count} times. At this point, what are you even fixing?`,
    ],
  },
  {
    category: 'messages',
    emoji: '💬',
    severity: 'medium',
    condition: (s) => s.messages.lazyMessagePercentage > 10 && s.messages.lazyMessagePercentage <= 30,
    messages: [
      (s) =>
        `${Math.round(s.messages.lazyMessagePercentage)}% lazy commit messages. You write code for a living but can't write a sentence about it.`,
    ],
  },
  {
    category: 'messages',
    emoji: '😤',
    severity: 'medium',
    condition: (s) => s.messages.allCapsMessages > 3,
    messages: [
      (s) =>
        `${s.messages.allCapsMessages} ALL-CAPS commit messages. Were you debugging or having an existential crisis?`,
      (s) =>
        `You've rage-committed ${s.messages.allCapsMessages} times in all caps. Your keyboard needs therapy.`,
    ],
  },
  {
    category: 'messages',
    emoji: '💬',
    severity: 'savage',
    condition: (s) => s.messages.oneWordMessages > 10,
    messages: [
      (s) =>
        `${s.messages.oneWordMessages} one-word commit messages. Hemingway wrote short sentences. You're not Hemingway.`,
      (s) =>
        `You used one-word commit messages ${s.messages.oneWordMessages} times. Even a fortune cookie provides more context.`,
    ],
  },
  {
    category: 'messages',
    emoji: '🔄',
    severity: 'medium',
    condition: (s) => s.messages.repeatedMessages.length > 0 && s.messages.repeatedMessages[0].count > 5,
    messages: [
      (s) =>
        `"${s.messages.repeatedMessages[0].message}" — you used this message ${s.messages.repeatedMessages[0].count} times. Ever heard of copy-paste? Oh wait, that IS your commit strategy.`,
    ],
  },
  {
    category: 'messages',
    emoji: '✨',
    severity: 'mild',
    condition: (s) => s.messages.averageLength >= 50,
    messages: [
      (s) =>
        `Your average commit message is ${s.messages.averageLength} characters. Either you write amazing docs or you're using commits as a diary.`,
    ],
  },

  // ============================================================
  //  PATTERN ROASTS
  // ============================================================
  {
    category: 'patterns',
    emoji: '📈',
    severity: 'savage',
    condition: (s) => s.patterns.bigDumps.length > 0,
    messages: [
      (s) => {
        const dump = s.patterns.bigDumps[0];
        const day = getDayName(dump.date.getDay());
        const hour = formatHour(dump.date.getHours());
        return `You mass-committed ${dump.filesChanged} files on a ${day} at ${hour}. We all know what happened there.`;
      },
      (s) =>
        `${s.patterns.bigDumps.length} monster commits detected. You don't believe in atomic commits — you believe in atomic bombs.`,
    ],
  },
  {
    category: 'patterns',
    emoji: '🏜️',
    severity: 'savage',
    condition: (s) => s.patterns.longestDrought > 30,
    messages: [
      (s) =>
        `Your longest coding drought was ${s.patterns.longestDrought} days. That's not a break, that's a sabbatical.`,
      (s) =>
        `${s.patterns.longestDrought} days without a commit. Did you forget your password or your purpose?`,
    ],
  },
  {
    category: 'patterns',
    emoji: '🏜️',
    severity: 'medium',
    condition: (s) => s.patterns.longestDrought > 14 && s.patterns.longestDrought <= 30,
    messages: [
      (s) =>
        `${s.patterns.longestDrought} days without a single commit. Your repo thought you abandoned it.`,
    ],
  },
  {
    category: 'patterns',
    emoji: '🔥',
    severity: 'mild',
    condition: (s) => s.patterns.longestStreak > 14,
    messages: [
      (s) =>
        `A ${s.patterns.longestStreak}-day commit streak? Impressive dedication. Or concerning obsession. Hard to tell.`,
    ],
  },
  {
    category: 'patterns',
    emoji: '📊',
    severity: 'savage',
    condition: (s) => s.patterns.consistencyScore < 15,
    messages: [
      (s) =>
        `You coded on ${s.patterns.totalActiveDays} out of ${s.patterns.totalDaysSpan} days (${s.patterns.consistencyScore}% consistency). Your commit graph looks like a barcode.`,
    ],
  },
  {
    category: 'patterns',
    emoji: '📊',
    severity: 'medium',
    condition: (s) => s.patterns.consistencyScore >= 15 && s.patterns.consistencyScore < 30,
    messages: [
      (s) =>
        `${s.patterns.consistencyScore}% consistency. You code like you go to the gym — in short, guilty bursts.`,
    ],
  },
  {
    category: 'patterns',
    emoji: '📊',
    severity: 'mild',
    condition: (s) => s.patterns.averageCommitsPerDay > 10,
    messages: [
      (s) =>
        `${s.patterns.averageCommitsPerDay} commits per day on average? Do you even pause to think or just commit and pray?`,
    ],
  },

  // ============================================================
  //  FILE ROASTS
  // ============================================================
  {
    category: 'files',
    emoji: '📁',
    severity: 'savage',
    condition: (s) => s.files.addDeleteRatio < 0.8,
    messages: [
      () =>
        `You've deleted more lines than you've added. Are you building something or just destroying evidence?`,
      () =>
        `Negative line contribution. Your greatest skill is making code disappear. At least one dev on the team does that.`,
    ],
  },
  {
    category: 'files',
    emoji: '📁',
    severity: 'medium',
    condition: (s) => s.files.averageFilesPerCommit > 15,
    messages: [
      (s) =>
        `${s.files.averageFilesPerCommit} files per commit on average. Have you heard of feature branches? Or self-control?`,
    ],
  },
  {
    category: 'files',
    emoji: '📁',
    severity: 'savage',
    condition: (s) => s.files.largestCommitFiles > 50,
    messages: [
      (s) =>
        `Your largest commit touched ${s.files.largestCommitFiles} files. That's not a commit, that's a natural disaster.`,
    ],
  },
  {
    category: 'files',
    emoji: '📁',
    severity: 'mild',
    condition: (s) => s.files.addDeleteRatio > 5,
    messages: [
      (s) =>
        `Your add/delete ratio is ${s.files.addDeleteRatio}:1. You only add, never remove. Your codebase is a hoarder's paradise.`,
    ],
  },

  // ============================================================
  //  GENERAL ROASTS (always-applicable fallbacks)
  // ============================================================
  {
    category: 'general',
    emoji: '🍖',
    severity: 'mild',
    condition: (s) => s.meta.totalCommits < 10,
    messages: [
      (s) =>
        `${s.meta.totalCommits} total commits? That's barely enough to roast. Come back when you've actually written some code.`,
    ],
  },
  {
    category: 'general',
    emoji: '🍖',
    severity: 'mild',
    condition: (s) => s.meta.totalCommits > 1000,
    messages: [
      (s) =>
        `${s.meta.totalCommits.toLocaleString()} commits. At this point, your Git history is longer than most novels. And just as fictional.`,
    ],
  },
];
