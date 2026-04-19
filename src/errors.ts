/**
 * Typed errors used throughout gitroast. Using `instanceof` checks is safer
 * than substring matching on error messages.
 */

export class GitRoastError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitRoastError';
  }
}

export class NotAGitRepoError extends GitRoastError {
  constructor(repoPath: string) {
    super(`"${repoPath}" is not a Git repository. Please run gitroast inside a Git repo.`);
    this.name = 'NotAGitRepoError';
  }
}

export class NoCommitsError extends GitRoastError {
  constructor(message: string) {
    super(message);
    this.name = 'NoCommitsError';
  }
}

export class BranchNotFoundError extends GitRoastError {
  constructor(branch: string, available: string[]) {
    super(`Branch "${branch}" not found. Available branches: ${available.join(', ')}`);
    this.name = 'BranchNotFoundError';
  }
}

export class MissingAPIKeyError extends GitRoastError {
  constructor() {
    super(
      'GITROAST_API_KEY is not set. Create a .env file with your API key.\n' +
        '  See: https://github.com/cadzchua/gitroast#ai-powered-roasts',
    );
    this.name = 'MissingAPIKeyError';
  }
}

export class LLMAPIError extends GitRoastError {
  readonly status: number;
  constructor(status: number, body: string) {
    super(`LLM API returned ${status}: ${body}`);
    this.name = 'LLMAPIError';
    this.status = status;
  }
}

export class LLMParseError extends GitRoastError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMParseError';
  }
}
