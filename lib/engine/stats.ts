import type { Keystroke } from './tracker';

export interface TimelinePoint { second: number; wpm: number; }
export interface KeyErrorStat { errors: number; total: number; }

export interface TestStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;     // 0–100, one decimal
  consistency: number;  // 0–100
  correctChars: number;
  totalChars: number;
  timeline: TimelinePoint[];
  keyErrors: Record<string, KeyErrorStat>;
}

export function computeStats(keystrokes: Keystroke[], durationMs: number): TestStats {
  const chars = keystrokes.filter((k) => k.type === 'char');
  const totalChars = chars.length;
  const correctChars = chars.filter((k) => k.correct).length;
  const minutes = durationMs / 60000;

  if (totalChars === 0 || minutes <= 0) {
    return {
      wpm: 0, rawWpm: 0, accuracy: 0, consistency: 0,
      correctChars: 0, totalChars: 0, timeline: [], keyErrors: {},
    };
  }

  const wpm = Math.round(correctChars / 5 / minutes);
  const rawWpm = Math.round(totalChars / 5 / minutes);
  const accuracy = Math.round((correctChars / totalChars) * 1000) / 10;

  // Cumulative WPM sampled at each elapsed second (single forward pass —
  // tracker appends in timestamp order).
  const start = chars[0].timestamp; // first actual char attempt
  const totalSeconds = Math.max(1, Math.ceil(durationMs / 1000));
  const timeline: TimelinePoint[] = [];
  let ci = 0;
  let correctSoFar = 0;
  for (let s = 1; s <= totalSeconds; s++) {
    const cutoff = start + s * 1000;
    while (ci < chars.length && chars[ci].timestamp <= cutoff) {
      if (chars[ci].correct) correctSoFar++;
      ci++;
    }
    timeline.push({ second: s, wpm: Math.round(correctSoFar / 5 / (s / 60)) });
  }

  // Per-key error rate keyed by the EXPECTED character.
  const keyErrors: Record<string, KeyErrorStat> = {};
  for (const k of chars) {
    const key = k.expected.toLowerCase();
    keyErrors[key] ??= { errors: 0, total: 0 };
    keyErrors[key].total++;
    if (!k.correct) keyErrors[key].errors++;
  }

  // Consistency: 1 − coefficient of variation of per-second WPM, clamped to [0,100].
  const wpms = timeline.map((t) => t.wpm).filter((w) => w > 0);
  let consistency = 0;
  if (wpms.length > 1) {
    const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
    const variance = wpms.reduce((a, b) => a + (b - mean) ** 2, 0) / wpms.length;
    consistency = Math.round(Math.max(0, Math.min(100, (1 - Math.sqrt(variance) / mean) * 100)));
  }

  return { wpm, rawWpm, accuracy, consistency, correctChars, totalChars, timeline, keyErrors };
}
