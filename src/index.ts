#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import path from 'path';
import fs from 'fs';
import { collectCommitData } from './utils/git';
import { analyzeAll } from './analyzers';
import { generateRoasts, generateAIRoasts } from './roaster';
import { renderToTerminal, renderToJSON, renderToMarkdown } from './display';
import { loadUserConfig } from './config';
import { GitRoastError } from './errors';
import { buildTeamLeaderboard, renderTeamLeaderboard } from './modes/team';
import { compareAuthors, renderComparison } from './modes/compare';
import { RoastResult } from './types';

const program = new Command();

program
  .name('gitroast')
  .description('🍖 Analyzes your Git history and roasts your coding habits')
  .version('1.1.0')
  .option('-a, --author <names>', 'Filter commits by author name (comma-separated for multiple)')
  .option('-b, --branch <name>', 'Only analyze commits from a specific branch')
  .option('-s, --since <date>', 'Only analyze commits since this date (e.g., "2024-01-01")')
  .option('-p, --path <dir>', 'Path to Git repository (defaults to current directory)')
  .option('-t, --top <n>', 'Maximum number of roasts to show', (v) => parseInt(v, 10))
  .option('-f, --format <type>', 'Output format: terminal | json | markdown', 'terminal')
  .option('-o, --output <file>', 'Write output to a file instead of stdout')
  .option('--ai', 'Use an AI/LLM to generate roasts (requires GITROAST_API_KEY)')
  .option('--team', 'Build a leaderboard across all authors in the repo')
  .option('--compare <a,b>', 'Compare two authors head-to-head (e.g., "alice,bob")')
  .option('--no-color', 'Disable colored output')
  .action(async (options) => {
    try {
      if (options.color === false) {
        chalk.level = 0;
      }

      const repoPath = options.path ? path.resolve(options.path) : process.cwd();
      const config = loadUserConfig(repoPath);

      const isQuietFormat = options.format === 'json' || options.format === 'markdown';
      const spinner = isQuietFormat
        ? null
        : ora({ text: chalk.cyan('Reading your Git history...'), spinner: 'dots' }).start();

      // --compare mode
      if (options.compare) {
        const [a, b] = String(options.compare)
          .split(',')
          .map((s: string) => s.trim());
        if (!a || !b)
          throw new GitRoastError('--compare expects two author names: --compare "alice,bob"');
        const commits = await collectCommitData(repoPath, undefined, options.since, options.branch);
        spinner?.stop();
        const [entryA, entryB] = await compareAuthors(commits, repoPath, [a, b], config);
        renderComparison(entryA, entryB);
        return;
      }

      // --team mode
      if (options.team) {
        const commits = await collectCommitData(repoPath, undefined, options.since, options.branch);
        spinner?.stop();
        const entries = await buildTeamLeaderboard(commits, repoPath, config);
        renderTeamLeaderboard(entries);
        return;
      }

      // Default single-author flow
      const commits = await collectCommitData(
        repoPath,
        options.author,
        options.since,
        options.branch,
      );
      if (spinner)
        spinner.text = chalk.cyan(`Found ${commits.length} commits. Analyzing your sins...`);

      const stats = await analyzeAll(commits, repoPath, options.author, config);

      let result: RoastResult;
      if (options.ai) {
        if (spinner) spinner.text = chalk.cyan('🤖 Consulting the AI roast master...');
        result = await generateAIRoasts(stats, {
          config,
          maxRoasts: options.top,
          onAIFallback: (reason: string) => warnAIFallback(spinner, reason),
        });
      } else {
        if (spinner) spinner.text = chalk.cyan('Generating roasts...');
        result = generateRoasts(stats, { config, maxRoasts: options.top });
      }

      spinner?.stop();

      const rendered = renderResult(result, options.format);
      if (options.output) {
        fs.writeFileSync(options.output, stripAnsi(rendered ?? ''), 'utf8');
        console.log(chalk.green(`✔ Wrote ${options.format} output to ${options.output}`));
      } else if (rendered !== undefined) {
        console.log(rendered);
      }
    } catch (error) {
      handleFatalError(error);
    }
  });

program.parse();

function renderResult(result: RoastResult, format: string): string | undefined {
  switch (format) {
    case 'json':
      return renderToJSON(result);
    case 'markdown':
    case 'md':
      return renderToMarkdown(result);
    case 'terminal':
    default:
      renderToTerminal(result);
      return undefined;
  }
}

function warnAIFallback(spinner: Ora | null, reason: string): void {
  if (spinner) spinner.warn(chalk.yellow(`AI roast failed: ${reason}. Falling back to templates.`));
  else process.stderr.write(`gitroast: AI roast failed: ${reason}. Falling back to templates.\n`);
  // Re-start spinner so downstream status still shows — but ora's warn already stopped it.
}

function handleFatalError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red('\n  ❌ Error: ') + message);
  if (!(error instanceof GitRoastError)) {
    console.error(chalk.dim('  Make sure you are inside a Git repository.\n'));
  }
  process.exit(1);
}

function stripAnsi(str: string): string {
  // Remove ANSI color codes so file output is readable
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}
