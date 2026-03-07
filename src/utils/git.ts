import simpleGit, { SimpleGit, LogResult } from 'simple-git';
import { CommitData } from '../types';

/**
 * Collects commit data from a Git repository.
 */
export async function collectCommitData(
  repoPath: string,
  author?: string,
  since?: string,
): Promise<CommitData[]> {
  const git: SimpleGit = simpleGit(repoPath);

  // Verify this is a git repository
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error(`"${repoPath}" is not a Git repository. Please run gitroast inside a Git repo.`);
  }

  // Build log options
  const logOptions: Record<string, string | undefined> = {
    '--stat': undefined,
    '--stat-count': '1000',
  };

  if (author) {
    logOptions['--author'] = author;
  }

  if (since) {
    logOptions['--since'] = since;
  }

  const log: LogResult = await git.log(logOptions);

  if (log.all.length === 0) {
    throw new Error(
      'No commits found. ' +
        (author ? `No commits by author "${author}". ` : '') +
        'Make sure you are in a Git repository with commit history.',
    );
  }

  const commits: CommitData[] = log.all.map((entry) => {
    const diff = entry.diff;
    return {
      hash: entry.hash,
      author: entry.author_name,
      email: entry.author_email,
      date: new Date(entry.date),
      message: entry.message,
      filesChanged: diff?.changed ?? 0,
      insertions: diff?.insertions ?? 0,
      deletions: diff?.deletions ?? 0,
    };
  });

  return commits;
}

/**
 * Gets the repository name from the remote URL or folder name.
 */
export async function getRepoName(repoPath: string): Promise<string> {
  const git: SimpleGit = simpleGit(repoPath);

  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin');

    if (origin?.refs?.fetch) {
      const url = origin.refs.fetch;
      // Extract repo name from URL: https://github.com/user/repo.git or git@github.com:user/repo.git
      const match = url.match(/\/([^/]+?)(?:\.git)?$/);
      if (match) return match[1];
    }
  } catch {
    // Fall back to directory name
  }

  // Use directory name as fallback
  const parts = repoPath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || 'unknown-repo';
}
