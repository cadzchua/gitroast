import { CommitData, AnalysisResult } from '../types';
import { analyzeTimings } from './timing';
import { analyzeMessages } from './messages';
import { analyzePatterns } from './patterns';
import { analyzeFiles } from './files';
import { getRepoName } from '../utils/git';
import { GitRoastConfig, DEFAULT_CONFIG } from '../config';

/**
 * Runs all analyzers on the collected commit data and returns a combined result.
 */
export async function analyzeAll(
  commits: CommitData[],
  repoPath: string,
  author?: string,
  config: GitRoastConfig = DEFAULT_CONFIG,
): Promise<AnalysisResult> {
  const [timing, messages, patterns, files, repoName] = await Promise.all([
    Promise.resolve(analyzeTimings(commits, config)),
    Promise.resolve(analyzeMessages(commits, config)),
    Promise.resolve(analyzePatterns(commits, config)),
    Promise.resolve(analyzeFiles(commits)),
    getRepoName(repoPath),
  ]);

  const sorted = [...commits].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstCommit = sorted[0];
  const lastCommit = sorted[sorted.length - 1];

  const authorName = author || firstCommit.author;

  return {
    timing,
    messages,
    patterns,
    files,
    meta: {
      author: authorName,
      repoName,
      totalCommits: commits.length,
      firstCommitDate: firstCommit.date,
      lastCommitDate: lastCommit.date,
    },
  };
}
