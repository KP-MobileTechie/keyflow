import { describe, it, expect } from 'vitest';
import { computeStats } from '@/lib/engine/stats';
import type { Keystroke } from '@/lib/engine/tracker';

function ks(key: string, expected: string, timestamp: number): Keystroke {
  return { type: 'char', key, expected, correct: key === expected, timestamp };
}

describe('computeStats', () => {
  it('returns zeroed stats for empty input (never NaN)', () => {
    const s = computeStats([], 30000);
    expect(s.wpm).toBe(0);
    expect(s.accuracy).toBe(0);
    expect(s.timeline).toEqual([]);
    expect(Number.isNaN(s.consistency)).toBe(false);
  });

  it('computes WPM as correct chars / 5 / minutes', () => {
    // 50 correct chars in 60s = 10 WPM
    const strokes = Array.from({ length: 50 }, (_, i) => ks('a', 'a', i * 1000));
    const s = computeStats(strokes, 60000);
    expect(s.wpm).toBe(10);
    expect(s.rawWpm).toBe(10);
    expect(s.accuracy).toBe(100);
  });

  it('separates raw WPM and accuracy when there are errors', () => {
    const strokes = [
      ...Array.from({ length: 40 }, (_, i) => ks('a', 'a', i * 100)),
      ...Array.from({ length: 10 }, (_, i) => ks('x', 'a', 4000 + i * 100)),
    ];
    const s = computeStats(strokes, 60000);
    expect(s.rawWpm).toBe(10);  // 50 typed
    expect(s.wpm).toBe(8);      // 40 correct
    expect(s.accuracy).toBe(80);
  });

  it('all-wrong input gives 0 WPM but full raw WPM', () => {
    const strokes = Array.from({ length: 25 }, (_, i) => ks('x', 'a', i * 100));
    const s = computeStats(strokes, 30000);
    expect(s.wpm).toBe(0);
    expect(s.rawWpm).toBe(10);
    expect(s.accuracy).toBe(0);
  });

  it('ignores backspace strokes in char counts', () => {
    const strokes: Keystroke[] = [
      ks('a', 'a', 0),
      { type: 'backspace', key: '', expected: 'a', correct: false, timestamp: 100 },
      ks('a', 'a', 200),
    ];
    const s = computeStats(strokes, 60000);
    expect(s.totalChars).toBe(2);
    expect(s.correctChars).toBe(2);
  });

  it('builds a per-second cumulative timeline', () => {
    const strokes = Array.from({ length: 10 }, (_, i) => ks('a', 'a', i * 290));
    const s = computeStats(strokes, 3000);
    expect(s.timeline).toHaveLength(3);
    expect(s.timeline[0].second).toBe(1);
    expect(s.timeline.at(-1)!.wpm).toBeGreaterThan(0);
  });

  it('aggregates per-key error rates on the expected key', () => {
    const strokes = [ks('a', 'a', 0), ks('x', 'a', 100), ks('b', 'b', 200)];
    const s = computeStats(strokes, 10000);
    expect(s.keyErrors['a']).toEqual({ errors: 1, total: 2 });
    expect(s.keyErrors['b']).toEqual({ errors: 0, total: 1 });
  });
});
