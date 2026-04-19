import chalk from 'chalk';
import Table from 'cli-table3';
import { CommitData, RoastResult } from '../types';
import { analyzeAll } from '../analyzers';
import { generateRoasts } from '../roaster';
import { GitRoastConfig } from '../config';

export interface TeamEntry {
  author: string;
  commits: number;
  overallScore: number;
  level: string;
  result: RoastResult;
}

/**
 * Aggregates stats per author and returns a leaderboard sorted by score.
 */
export async function buildTeamLeaderboard(
  commits: CommitData[],
  repoPath: string,
  config: GitRoastConfig,
): Promise<TeamEntry[]> {
  const byAuthor = new Map<string, CommitData[]>();
  for (const c of commits) {
    const list = byAuthor.get(c.author) ?? [];
    list.push(c);
    byAuthor.set(c.author, list);
  }

  const entries: TeamEntry[] = [];
  for (const [author, authorCommits] of byAuthor) {
    const stats = await analyzeAll(authorCommits, repoPath, author, config);
    const result = generateRoasts(stats, { config });
    entries.push({
      author,
      commits: authorCommits.length,
      overallScore: result.score.overall,
      level: result.score.level,
      result,
    });
  }

  entries.sort((a, b) => b.overallScore - a.overallScore);
  return entries;
}

export function renderTeamLeaderboard(entries: TeamEntry[]): void {
  const table = new Table({
    head: [
      chalk.bold.white('Rank'),
      chalk.bold.white('Author'),
      chalk.bold.white('Commits'),
      chalk.bold.white('Score'),
      chalk.bold.white('Level'),
    ],
    colWidths: [6, 28, 10, 10, 22],
  });

  entries.forEach((entry, idx) => {
    const rank =
      idx === 0
        ? chalk.yellow('🥇 1')
        : idx === 1
          ? chalk.gray('🥈 2')
          : idx === 2
            ? chalk.hex('#CD7F32')('🥉 3')
            : `  ${idx + 1}`;
    table.push([
      rank,
      entry.author,
      String(entry.commits),
      colorScore(entry.overallScore),
      entry.level,
    ]);
  });

  console.log();
  console.log(chalk.bold.cyan('  👥 Team Leaderboard (higher = better habits)'));
  console.log();
  console.log(table.toString());
  console.log();
}

function colorScore(score: number): string {
  if (score >= 80) return chalk.green(String(score));
  if (score >= 60) return chalk.hex('#8BC34A')(String(score));
  if (score >= 40) return chalk.yellow(String(score));
  if (score >= 20) return chalk.hex('#FF5722')(String(score));
  return chalk.red(String(score));
}
