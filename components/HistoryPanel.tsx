'use client';

import { useEffect, useState } from 'react';
import { getHistory, isStorageAvailable, type TestResult } from '@/lib/storage';

export function HistoryPanel({ refreshKey }: { refreshKey: number }) {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    setAvailable(isStorageAvailable());
    setHistory(getHistory().slice(0, 10));
  }, [refreshKey]);

  if (!available) {
    return <p className="text-xs text-[var(--fg-dim)]">history unavailable — local storage is disabled</p>;
  }
  if (history.length === 0) return null;

  return (
    <section className="w-full max-w-2xl" aria-label="recent results">
      <h2 className="mb-2 text-sm text-[var(--fg-dim)]">recent</h2>
      <ul className="divide-y divide-[var(--bg-raised)] text-sm">
        {history.map((r, i) => (
          <li key={`${r.timestamp}-${i}`} className="flex justify-between py-1.5">
            <span className="text-[var(--fg-dim)]">{r.mode} {r.config}</span>
            <span>{r.wpm} wpm · {r.accuracy}%</span>
            <span className="text-[var(--fg-dim)]">{new Date(r.timestamp).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
