import { CommitData, FileAnalysis } from '../types';

/**
 * Analyzes file change patterns across commits.
 * Tracks total files changed, largest commits, and add/delete ratio.
 */
export function analyzeFiles(commits: CommitData[]): FileAnalysis {
  if (commits.length === 0) {
    return {
      totalFilesChanged: 0,
      largestCommitFiles: 0,
      largestCommitHash: '',
      averageFilesPerCommit: 0,
      totalInsertions: 0,
      totalDeletions: 0,
      addDeleteRatio: 1,
    };
  }

  let totalFilesChanged = 0;
  let totalInsertions = 0;
  let totalDeletions = 0;
  let largestCommitFiles = 0;
  let largestCommitHash = '';

  for (const commit of commits) {
    totalFilesChanged += commit.filesChanged;
    totalInsertions += commit.insertions;
    totalDeletions += commit.deletions;

    if (commit.filesChanged > largestCommitFiles) {
      largestCommitFiles = commit.filesChanged;
      largestCommitHash = commit.hash.substring(0, 7);
    }
  }

  const averageFilesPerCommit = Math.round((totalFilesChanged / commits.length) * 100) / 100;
  const addDeleteRatio = totalDeletions > 0 ? Math.round((totalInsertions / totalDeletions) * 100) / 100 : totalInsertions;

  return {
    totalFilesChanged,
    largestCommitFiles,
    largestCommitHash,
    averageFilesPerCommit,
    totalInsertions,
    totalDeletions,
    addDeleteRatio,
  };
}
