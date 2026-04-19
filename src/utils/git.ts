import simpleGit, { SimpleGit, LogResult } from 'simple-git';
import { CommitData } from '../types';
import { NotAGitRepoError, NoCommitsError, BranchNotFoundError } from '../errors';

/**
 * Collects commit data from a Git repository.
 * `authors` may be a single string or a comma-separated list.
 */
export async function collectCommitData(
  repoPath: string,
  authors?: string,
  since?: string,
  branch?: string,
): Promise<CommitData[]> {
  const git: SimpleGit = simpleGit(repoPath);

  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new NotAGitRepoError(repoPath);
  }

  if (branch) {
    const branches = await git.branch(['-a']);
    const allBranches = Object.keys(branches.branches);
    // Match local, any remote ('remotes/<remote>/<branch>'), or fully-qualified.
    const match = allBranches.some((b) => b === branch || b.endsWith(`/${branch}`));
    if (!match) {
      const localBranches = allBranches.filter((b) => !b.startsWith('remotes/'));
      throw new BranchNotFoundError(branch, localBranches);
    }
  }

  const logArgs: string[] = ['--stat', '--stat-count=1000'];
  if (branch) logArgs.push(branch);
  else logArgs.push('--all');
  if (since) logArgs.push(`--since=${since}`);

  // Multiple authors: support comma-separated list via multiple --author flags.
  // Git OR-combines them when several --author are passed.
  if (authors) {
    for (const a of authors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)) {
      logArgs.push(`--author=${a}`);
    }
  }

  const log: LogResult = await git.log(logArgs);

  if (log.all.length === 0) {
    throw new NoCommitsError(
      'No commits found. ' +
        (branch ? `No commits on branch "${branch}". ` : '') +
        (authors ? `No commits by author "${authors}". ` : '') +
        'Make sure you are in a Git repository with commit history.',
    );
  }

  return log.all.map((entry) => {
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
}

/**
 * Gets the repository name from the remote URL or folder name.
 */
export async function getRepoName(repoPath: string): Promise<string> {
  const git: SimpleGit = simpleGit(repoPath);

  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin') || remotes[0];

    if (origin?.refs?.fetch) {
      const url = origin.refs.fetch;
      const match = url.match(/\/([^/]+?)(?:\.git)?$/);
      if (match) return match[1];
    }
  } catch {
    // Fall back to directory name
  }

  const parts = repoPath.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || 'unknown-repo';
}

/**
 * Returns a deduplicated list of author names found in the commits.
 */
export function extractAuthors(commits: CommitData[]): string[] {
  return Array.from(new Set(commits.map((c) => c.author)));
}
