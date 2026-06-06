'use client';

import type { KeyErrorStat } from '@/lib/engine/stats';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

function keyColor(stat?: KeyErrorStat): string {
  if (!stat || stat.total === 0) return 'var(--bg-raised)';
  const rate = stat.errors / stat.total;
  if (rate === 0) return 'rgba(74, 222, 128, 0.15)';
  const alpha = 0.25 + Math.min(0.75, rate);
  return `rgba(248, 113, 113, ${alpha.toFixed(2)})`;
}

export function KeyboardHeatmap({ keyErrors }: { keyErrors: Record<string, KeyErrorStat> }) {
  return (
    <div className="flex flex-col items-center gap-1.5" aria-label="per-key error heatmap">
      {ROWS.map((row, i) => (
        <div key={row} className="flex gap-1.5" style={{ paddingLeft: i * 14 }}>
          {row.split('').map((k) => (
            <div
              key={k}
              title={keyErrors[k] ? `${k}: ${keyErrors[k].errors}/${keyErrors[k].total} errors` : k}
              className="flex h-9 w-9 items-center justify-center rounded border border-[var(--bg-raised)] text-sm"
              style={{ background: keyColor(keyErrors[k]) }}
            >
              {k}
            </div>
          ))}
        </div>
      ))}
      <div className="mt-1 flex gap-1.5" style={{ paddingLeft: 42 }}>
        <div
          title={keyErrors[' '] ? `space: ${keyErrors[' '].errors}/${keyErrors[' '].total} errors` : 'space'}
          className="flex h-9 w-64 items-center justify-center rounded border border-[var(--bg-raised)] text-xs text-[var(--fg-dim)]"
          style={{ background: keyColor(keyErrors[' ']) }}
        >
          space
        </div>
      </div>
    </div>
  );
}
