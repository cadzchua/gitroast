import chalk from 'chalk';
import Table from 'cli-table3';
import { CommitData, RoastResult } from '../types';
import { analyzeAll } from '../analyzers';
import { generateRoasts } from '../roaster';
import { GitRoastConfig } from '../config';

export interface CompareEntry {
  author: string;
  result: RoastResult;
}

/**
 * Generates roast results for two authors from the same commit pool.
 * Returns one entry per requested author (missing authors get empty entries).
 */
export async function compareAuthors(
  commits: CommitData[],
  repoPath: string,
  authors: [string, string],
  config: GitRoastConfig,
): Promise<[CompareEntry, CompareEntry]> {
  const results = await Promise.all(
    authors.map(async (author) => {
      const authorCommits = commits.filter(
        (c) =>
          c.author.toLowerCase() === author.toLowerCase() ||
          c.email.toLowerCase().includes(author.toLowerCase()),
      );
      if (authorCommits.length === 0) {
        throw new Error(`No commits found for author "${author}"`);
      }
      const stats = await analyzeAll(authorCommits, repoPath, author, config);
      return { author, result: generateRoasts(stats, { config }) };
    }),
  );

  return [results[0], results[1]];
}

export function renderComparison(a: CompareEntry, b: CompareEntry): void {
  console.log();
  console.log(chalk.bold.cyan(`  ⚔️  Head-to-head: ${a.author} vs ${b.author}`));
  console.log();

  const table = new Table({
    head: [chalk.bold.white('Metric'), chalk.bold.white(a.author), chalk.bold.white(b.author)],
    colWidths: [24, 30, 30],
  });

  const rows: [string, string | number, string | number][] = [
    ['Overall', `${a.result.score.overall}/100`, `${b.result.score.overall}/100`],
    ['Level', a.result.score.level, b.result.score.level],
    ['Commits', a.result.stats.meta.totalCommits, b.result.stats.meta.totalCommits],
    [
      'Active days',
      a.result.stats.patterns.totalActiveDays,
      b.result.stats.patterns.totalActiveDays,
    ],
    [
      'Late-night %',
      `${Math.round(a.result.stats.timing.lateNightPercentage)}%`,
      `${Math.round(b.result.stats.timing.lateNightPercentage)}%`,
    ],
    [
      'Weekend %',
      `${Math.round(a.result.stats.timing.weekendPercentage)}%`,
      `${Math.round(b.result.stats.timing.weekendPercentage)}%`,
    ],
    [
      'Lazy msg %',
      `${Math.round(a.result.stats.messages.lazyMessagePercentage)}%`,
      `${Math.round(b.result.stats.messages.lazyMessagePercentage)}%`,
    ],
    [
      'Avg msg length',
      a.result.stats.messages.averageLength,
      b.result.stats.messages.averageLength,
    ],
    ['Big dumps', a.result.stats.patterns.bigDumps.length, b.result.stats.patterns.bigDumps.length],
  ];

  for (const [metric, av, bv] of rows) {
    table.push([metric, String(av), String(bv)]);
  }

  console.log(table.toString());
  console.log();

  const winner =
    a.result.score.overall > b.result.score.overall
      ? a.author
      : b.result.score.overall > a.result.score.overall
        ? b.author
        : 'tie';

  if (winner === 'tie') {
    console.log(chalk.bold.yellow("  🤝 It's a tie! You're both equally disappointing."));
  } else {
    console.log(chalk.bold.green(`  🏆 Winner: ${winner}`));
  }
  console.log();
}
