'use client';

import { computeStats } from '@/lib/engine/stats';
import type { TrackerState } from '@/lib/engine/tracker';
import type { Mode } from '@/hooks/useTypingTest';

interface Props {
  mode: Mode;
  config: number;
  elapsedMs: number;
  tracker: TrackerState;
  running: boolean;
}

export function LiveStats({ mode, config, elapsedMs, tracker, running }: Props) {
  const liveWpm = running && elapsedMs > 1000
    ? computeStats(tracker.keystrokes, elapsedMs).wpm
    : 0;
  // Completed words = spaces crossed so far (generator never emits a leading space).
  const wordsTyped = tracker.text.slice(0, tracker.position).split(' ').length - 1;
  const progress = mode === 'time'
    ? `${Math.max(0, config - Math.floor(elapsedMs / 1000))}s`
    : `${wordsTyped}/${config}`;

  return (
    <div className="flex gap-6 text-xl text-[var(--accent-2)]" aria-live="polite">
      <span>{progress}</span>
      <span>{liveWpm} wpm</span>
    </div>
  );
}
