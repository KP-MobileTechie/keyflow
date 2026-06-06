'use client';

import { useTypingTest } from '@/hooks/useTypingTest';
import { ModeBar } from '@/components/ModeBar';
import { TypingArea } from '@/components/TypingArea';
import { LiveStats } from '@/components/LiveStats';

export default function Home() {
  const test = useTypingTest();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <header className="flex w-full items-center justify-between">
        <h1 className="text-xl font-bold text-accent">keyflow_</h1>
        <ModeBar mode={test.mode} config={test.config} onChange={test.changeMode} />
      </header>

      {test.status !== 'finished' ? (
        <>
          <LiveStats
            mode={test.mode}
            config={test.config}
            elapsedMs={test.elapsedMs}
            tracker={test.tracker}
            running={test.status === 'running'}
          />
          <TypingArea tracker={test.tracker} />
          <p className="text-sm text-[var(--fg-dim)]">
            start typing to begin · <kbd>tab</kbd> restart
          </p>
        </>
      ) : (
        <div className="text-center">
          <p className="text-4xl text-accent">{test.finished?.stats.wpm} wpm</p>
          <p className="mt-4 text-[var(--fg-dim)]">results panel coming in Task 7 — press tab to restart</p>
        </div>
      )}
    </main>
  );
}
