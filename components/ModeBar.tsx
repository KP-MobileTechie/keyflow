'use client';

import { TIME_OPTIONS, WORD_OPTIONS, type Mode } from '@/hooks/useTypingTest';

interface Props {
  mode: Mode;
  config: number;
  onChange: (mode: Mode, config: number) => void;
}

export function ModeBar({ mode, config, onChange }: Props) {
  const options = mode === 'time' ? TIME_OPTIONS : WORD_OPTIONS;
  return (
    <div className="flex items-center gap-4 rounded-lg bg-[var(--bg-raised)] px-4 py-2 text-sm">
      <div className="flex gap-2">
        {(['time', 'words'] as const).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m, m === 'time' ? 30 : 25)}
            className={m === mode ? 'text-[var(--accent)]' : 'text-[var(--fg-dim)] hover:text-[var(--fg)]'}
          >
            {m}
          </button>
        ))}
      </div>
      <span className="text-[var(--fg-dim)]">|</span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(mode, o)}
            className={o === config ? 'text-[var(--accent)]' : 'text-[var(--fg-dim)] hover:text-[var(--fg)]'}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
