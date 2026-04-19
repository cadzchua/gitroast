import { CommitData } from '../src/types';

/**
 * Build a synthetic commit for tests.
 */
export function mkCommit(overrides: Partial<CommitData> = {}): CommitData {
  return {
    hash: 'abcdef1234567890abcdef1234567890abcdef12',
    author: 'Alice',
    email: 'alice@example.com',
    date: new Date('2024-06-10T10:00:00Z'),
    message: 'feat: reasonable commit message',
    filesChanged: 2,
    insertions: 20,
    deletions: 5,
    ...overrides,
  };
}

/**
 * Build a series of commits on sequential days.
 */
export function mkSeries(count: number, overrides: Partial<CommitData> = {}): CommitData[] {
  const base = new Date('2024-06-01T12:00:00Z').getTime();
  const dayMs = 86400000;
  return Array.from({ length: count }, (_, i) =>
    mkCommit({ ...overrides, hash: `hash${i}`.padEnd(40, '0'), date: new Date(base + i * dayMs) }),
  );
}
