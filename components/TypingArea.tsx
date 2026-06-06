'use client';

import type { TrackerState } from '@/lib/engine/tracker';

const stateClass = {
  pending: 'text-[var(--fg-dim)]',
  correct: 'text-[var(--fg)]',
  wrong: 'text-[var(--error)] underline decoration-[var(--error)]',
} as const;

export function TypingArea({ tracker }: { tracker: TrackerState }) {
  return (
    <div
      aria-label="typing test text"
      className="max-w-3xl select-none text-2xl leading-relaxed tracking-wide"
      onPaste={(e) => e.preventDefault()}
    >
      {tracker.text.split('').map((ch, i) => (
        <span key={i} className="relative">
          {i === tracker.position && (
            <span className="caret absolute -left-px inline-block h-[1.2em] w-[2px] translate-y-[0.15em] bg-[var(--caret)]" />
          )}
          <span className={stateClass[tracker.charStates[i]]}>{ch}</span>
        </span>
      ))}
    </div>
  );
}
