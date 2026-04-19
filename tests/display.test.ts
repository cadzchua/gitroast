import { describe, it, expect } from 'vitest';
import { renderToJSON, renderToMarkdown } from '../src/display';
import { RoastResult } from '../src/types';

function sampleResult(): RoastResult {
  return {
    roasts: [
      { category: 'timing', emoji: '⏰', text: '3am commits again?', severity: 'savage' },
      { category: 'messages', emoji: '💬', text: 'short messages', severity: 'medium' },
    ],
    score: {
      overall: 42,
      level: 'Chaotic Neutral',
      categoryScores: [
        { category: 'timing', score: 30, grade: 'F', label: 'Timing' },
        { category: 'messages', score: 50, grade: 'D+', label: 'Messages' },
        { category: 'patterns', score: 40, grade: 'D-', label: 'Patterns' },
        { category: 'files', score: 48, grade: 'D', label: 'Files' },
      ],
    },
    stats: {
      timing: {} as any,
      messages: {} as any,
      patterns: { totalActiveDays: 20 } as any,
      files: {} as any,
      meta: {
        author: 'Alice',
        repoName: 'example',
        totalCommits: 100,
        firstCommitDate: new Date('2024-01-01'),
        lastCommitDate: new Date('2024-06-01'),
      },
    } as any,
  };
}

describe('renderToJSON', () => {
  it('produces valid JSON with all sections', () => {
    const out = renderToJSON(sampleResult());
    const parsed = JSON.parse(out);
    expect(parsed.roasts).toHaveLength(2);
    expect(parsed.score.overall).toBe(42);
  });
});

describe('renderToMarkdown', () => {
  it('includes title, table, and roasts', () => {
    const out = renderToMarkdown(sampleResult());
    expect(out).toContain('# 🔥 Git Roast — Alice');
    expect(out).toContain('| Category | Grade | Score |');
    expect(out).toContain('3am commits again?');
    expect(out).toContain('**[SAVAGE]**');
  });
});
