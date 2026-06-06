import { describe, it, expect, beforeEach } from 'vitest';
import { saveResult, getHistory, getBest, configKey, isStorageAvailable, type TestResult } from '@/lib/storage';

function result(wpm: number, mode: 'time' | 'words' = 'time', config = 30): TestResult {
  return { mode, config, wpm, rawWpm: wpm + 5, accuracy: 95, consistency: 80, timestamp: 1700000000000 };
}

describe('storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('reports storage available in jsdom', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it('returns empty history initially', () => {
    expect(getHistory()).toEqual([]);
    expect(getBest(configKey('time', 30))).toBeNull();
  });

  it('saves results newest-first and tracks PBs', () => {
    expect(saveResult(result(60)).isPB).toBe(true);
    expect(saveResult(result(50)).isPB).toBe(false);
    expect(saveResult(result(70)).isPB).toBe(true);
    expect(getHistory().map((r) => r.wpm)).toEqual([70, 50, 60]);
    expect(getBest(configKey('time', 30))).toBe(70);
  });

  it('tracks PBs per mode-config independently', () => {
    saveResult(result(60, 'time', 30));
    saveResult(result(40, 'words', 25));
    expect(getBest('time-30')).toBe(60);
    expect(getBest('words-25')).toBe(40);
  });

  it('caps history at 50 results', () => {
    for (let i = 0; i < 60; i++) saveResult(result(10 + i));
    expect(getHistory()).toHaveLength(50);
  });

  it('survives corrupt stored JSON', () => {
    window.localStorage.setItem('keyflow:v1', '{not json');
    expect(getHistory()).toEqual([]);
    expect(saveResult(result(42)).isPB).toBe(true);
  });
});
