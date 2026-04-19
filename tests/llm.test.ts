import { describe, it, expect } from 'vitest';
import { parseRoasts } from '../src/roaster/llm';
import { LLMParseError } from '../src/errors';

describe('parseRoasts', () => {
  it('parses a valid JSON array of roasts', () => {
    const raw = JSON.stringify([
      {
        category: 'timing',
        emoji: '⏰',
        text: 'You commit at 3am like a vampire.',
        severity: 'savage',
      },
      { category: 'messages', emoji: '💬', text: 'Your messages are bad.', severity: 'medium' },
    ]);
    const out = parseRoasts(raw);
    expect(out).toHaveLength(2);
    expect(out[0].category).toBe('timing');
  });

  it('strips markdown code fences', () => {
    const raw =
      '```json\n' +
      JSON.stringify([{ category: 'general', emoji: '🍖', text: 'hi', severity: 'mild' }]) +
      '\n```';
    const out = parseRoasts(raw);
    expect(out).toHaveLength(1);
  });

  it('rejects invalid entries silently', () => {
    const raw = JSON.stringify([
      { category: 'timing', emoji: '⏰', text: 'ok', severity: 'savage' },
      { category: 'bogus', emoji: '?', text: 'no', severity: 'medium' }, // invalid category
      { category: 'timing', emoji: '⏰', text: 'ok2', severity: 'unknown' }, // invalid severity
    ]);
    const out = parseRoasts(raw);
    expect(out).toHaveLength(1);
  });

  it('throws LLMParseError on non-JSON', () => {
    expect(() => parseRoasts('not json')).toThrow(LLMParseError);
  });

  it('throws LLMParseError on non-array JSON', () => {
    expect(() => parseRoasts('{"category":"timing"}')).toThrow(LLMParseError);
  });
});
