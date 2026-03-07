import { CommitData, AnalysisResult } from '../types';
import { analyzeTimings } from './timing';
import { analyzeMessages } from './messages';
import { analyzePatterns } from './patterns';
import { analyzeFiles } from './files';
import { getRepoName } from '../utils/git';

/**
 * Runs all analyzers on the collected commit data and returns a combined result.
 */
export async function analyzeAll(
  commits: CommitData[],
  repoPath: string,
  author?: string,
): Promise<AnalysisResult> {
  const [timing, messages, patterns, files, repoName] = await Promise.all([
    analyzeTimings(commits),
    analyzeMessages(commits),
    analyzePatterns(commits),
    analyzeFiles(commits),
    getRepoName(repoPath),
  ]);

  // Sort commits by date to get first and last
  const sorted = [...commits].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstCommit = sorted[0];
  const lastCommit = sorted[sorted.length - 1];

  // Determine author name
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
