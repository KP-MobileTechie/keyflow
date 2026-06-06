'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { generateText } from '@/lib/engine/words';
import {
  createTracker, handleChar, handleBackspace, isComplete, type TrackerState,
} from '@/lib/engine/tracker';
import { computeStats, type TestStats } from '@/lib/engine/stats';
import { saveResult, type TestResult } from '@/lib/storage';

export type Mode = 'time' | 'words';
export type Status = 'idle' | 'running' | 'finished';
export const TIME_OPTIONS = [15, 30, 60] as const;
export const WORD_OPTIONS = [10, 25, 50] as const;

// Time mode generates a large pool the user won't exhaust.
const TIME_MODE_WORD_POOL = 120;

// Fixed seed for the first server/client render so hydration matches; the
// text is randomized on mount (client-only) and on every restart afterward.
const INITIAL_SEED = 1;

export interface FinishedTest {
  stats: TestStats;
  result: TestResult;
  isPB: boolean;
}

export function useTypingTest() {
  const [mode, setMode] = useState<Mode>('time');
  const [config, setConfig] = useState<number>(30);
  const [status, setStatus] = useState<Status>('idle');
  const [tracker, setTracker] = useState<TrackerState>(() =>
    createTracker(generateText(TIME_MODE_WORD_POOL, INITIAL_SEED)),
  );
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState<FinishedTest | null>(null);
  const trackerRef = useRef(tracker);
  trackerRef.current = tracker;
  // Guards finish() against double-invocation (React StrictMode re-runs the
  // setState updater that triggers it, which would save the result twice).
  const finishedRef = useRef(false);

  const newTest = useCallback((m: Mode, c: number) => {
    const wordCount = m === 'time' ? TIME_MODE_WORD_POOL : c;
    finishedRef.current = false;
    setTracker(createTracker(generateText(wordCount)));
    setStatus('idle');
    setStartTime(null);
    setElapsedMs(0);
    setFinished(null);
  }, []);

  const restart = useCallback(() => newTest(mode, config), [newTest, mode, config]);

  // After hydration, swap the fixed-seed initial text for a random one.
  useEffect(() => {
    setTracker(createTracker(generateText(TIME_MODE_WORD_POOL)));
  }, []);

  const changeMode = useCallback((m: Mode, c: number) => {
    setMode(m);
    setConfig(c);
    newTest(m, c);
  }, [newTest]);

  const finish = useCallback((finalTracker: TrackerState, start: number, endTime: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const durationMs = Math.max(1, endTime - start);
    const stats = computeStats(finalTracker.keystrokes, durationMs);
    const result: TestResult = {
      mode, config,
      wpm: stats.wpm, rawWpm: stats.rawWpm,
      accuracy: stats.accuracy, consistency: stats.consistency,
      timestamp: endTime,
    };
    const { isPB } = saveResult(result);
    setFinished({ stats, result, isPB });
    setStatus('finished');
  }, [mode, config]);

  // Timer tick + time-mode end condition.
  useEffect(() => {
    if (status !== 'running' || startTime === null) return;
    const id = setInterval(() => {
      const e = Date.now() - startTime;
      setElapsedMs(e);
      if (mode === 'time' && e >= config * 1000) {
        finish(trackerRef.current, startTime, startTime + config * 1000);
      }
    }, 100);
    return () => clearInterval(id);
  }, [status, startTime, mode, config, finish]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'Escape') {
      e.preventDefault();
      restart();
      return;
    }
    if (status === 'finished') return;
    const now = Date.now();

    if (e.key === 'Backspace') {
      setTracker((t) => handleBackspace(t, now));
      return;
    }
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();

    let start = startTime;
    if (status === 'idle') {
      start = now;
      setStartTime(now);
      setStatus('running');
    }
    setTracker((t) => {
      const next = handleChar(t, e.key, now);
      if (mode === 'words' && isComplete(next) && start !== null) {
        finish(next, start, now);
      }
      return next;
    });
  }, [status, startTime, mode, restart, finish]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  return { mode, config, status, tracker, elapsedMs, finished, changeMode, restart };
}
