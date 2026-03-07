#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { collectCommitData } from './utils/git';
import { analyzeAll } from './analyzers';
import { generateRoasts, generateAIRoasts } from './roaster';
import { renderToTerminal } from './display';

const program = new Command();

program
  .name('gitroast')
  .description('🍖 Analyzes your Git history and roasts your coding habits')
  .version('1.0.0')
  .option('-a, --author <name>', 'Filter commits by author name')
  .option('-b, --branch <name>', 'Only analyze commits from a specific branch')
  .option(
    '-s, --since <date>',
    'Only analyze commits since this date (e.g., "2024-01-01" or "6 months ago")',
  )
  .option('-p, --path <dir>', 'Path to Git repository (defaults to current directory)')
  .option('--ai', 'Use an AI/LLM to generate roasts (requires GITROAST_API_KEY in .env)')
  .action(async (options) => {
    try {
      const repoPath = options.path ? path.resolve(options.path) : process.cwd();

      // Step 1: Collect git data
      const spinner = ora({
        text: chalk.cyan('Reading your Git history...'),
        spinner: 'dots',
      }).start();

      let commits;
      try {
        commits = await collectCommitData(repoPath, options.author, options.since, options.branch);
      } catch (error) {
        spinner.fail(chalk.red((error as Error).message));
        process.exit(1);
      }

      spinner.text = chalk.cyan(`Found ${commits.length} commits. Analyzing your sins...`);

      // Step 2: Analyze
      const stats = await analyzeAll(commits, repoPath, options.author);

      // Step 3: Generate roasts
      let result;
      if (options.ai) {
        spinner.text = chalk.cyan('🤖 Consulting the AI roast master...');
        try {
          result = await generateAIRoasts(stats);
        } catch (error) {
          spinner.fail(chalk.red((error as Error).message));
          process.exit(1);
        }
      } else {
        spinner.text = chalk.cyan('Generating roasts...');
        result = generateRoasts(stats);
      }

      // Step 4: Display
      spinner.stop();
      console.clear();
      renderToTerminal(result);
    } catch (error) {
      console.error(chalk.red('\n  ❌ Error: ') + (error as Error).message);
      console.error(chalk.dim('  Make sure you are inside a Git repository.\n'));
      process.exit(1);
    }
  });

program.parse();
