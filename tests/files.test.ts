import { describe, it, expect } from 'vitest';
import { analyzeFiles } from '../src/analyzers/files';
import { mkCommit } from './fixtures';

describe('analyzeFiles', () => {
  it('returns zeroed stats for empty input', () => {
    const res = analyzeFiles([]);
    expect(res.totalFilesChanged).toBe(0);
    expect(res.addDeleteRatio).toBe(1);
  });

  it('sums insertions, deletions, and tracks largest commit', () => {
    const commits = [
      mkCommit({ hash: 'aaaaaaaa', filesChanged: 3, insertions: 10, deletions: 2 }),
      mkCommit({ hash: 'bbbbbbbb', filesChanged: 20, insertions: 100, deletions: 50 }),
    ];
    const res = analyzeFiles(commits);
    expect(res.totalInsertions).toBe(110);
    expect(res.totalDeletions).toBe(52);
    expect(res.largestCommitFiles).toBe(20);
    expect(res.largestCommitHash).toBe('bbbbbbb');
  });

  it('handles zero deletions without division by zero', () => {
    const commits = [mkCommit({ insertions: 5, deletions: 0 })];
    const res = analyzeFiles(commits);
    expect(res.addDeleteRatio).toBe(5);
  });
});
