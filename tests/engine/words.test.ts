import { describe, it, expect } from 'vitest';
import { WORDS, generateWords, generateText } from '@/lib/engine/words';

describe('words', () => {
  it('has a sizable lowercase word list', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(100);
    for (const w of WORDS) expect(w).toMatch(/^[a-z]+$/);
  });

  it('generates the requested number of words', () => {
    expect(generateWords(25, 42)).toHaveLength(25);
  });

  it('is deterministic for the same seed', () => {
    expect(generateWords(50, 7)).toEqual(generateWords(50, 7));
  });

  it('differs across seeds', () => {
    expect(generateWords(50, 1)).not.toEqual(generateWords(50, 2));
  });

  it('never repeats a word back-to-back', () => {
    const ws = generateWords(200, 3);
    for (let i = 1; i < ws.length; i++) expect(ws[i]).not.toBe(ws[i - 1]);
  });

  it('generateText joins with single spaces', () => {
    const t = generateText(10, 5);
    expect(t.split(' ')).toHaveLength(10);
    expect(t).not.toMatch(/ {2}/);
  });
});
