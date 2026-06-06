'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { FinishedTest } from '@/hooks/useTypingTest';
import { KeyboardHeatmap } from './KeyboardHeatmap';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--bg-raised)] px-5 py-3 text-center">
      <div className="text-2xl text-[var(--accent)]">{value}</div>
      <div className="text-xs text-[var(--fg-dim)]">{label}</div>
    </div>
  );
}

export function ResultsPanel({ finished }: { finished: FinishedTest }) {
  const { stats, isPB } = finished;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex w-full flex-col items-center gap-8"
    >
      {isPB && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-full border border-[var(--accent)] px-4 py-1 text-sm text-[var(--accent)]"
        >
          <span aria-hidden="true">★ </span>new personal best
        </motion.div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        <Stat label="wpm" value={String(stats.wpm)} />
        <Stat label="raw" value={String(stats.rawWpm)} />
        <Stat label="accuracy" value={`${stats.accuracy}%`} />
        <Stat label="consistency" value={`${stats.consistency}%`} />
      </div>

      {stats.timeline.length > 1 && (
        <div className="h-56 w-full max-w-2xl" role="img" aria-label="WPM over time chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.timeline} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              {/* Hex values mirror the theme tokens in globals.css
                  (--bg-raised #11161c, --fg-dim #4d5b6e, --accent #4ade80) —
                  Recharts sets these as SVG attributes, so literals are used. */}
              <CartesianGrid stroke="#11161c" strokeDasharray="3 3" />
              <XAxis dataKey="second" stroke="#4d5b6e" fontSize={12} unit="s" />
              <YAxis stroke="#4d5b6e" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#11161c', border: '1px solid #4d5b6e', fontFamily: 'inherit' }}
                labelFormatter={(s) => `${s}s`}
              />
              <Line type="monotone" dataKey="wpm" stroke="#4ade80" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <KeyboardHeatmap keyErrors={stats.keyErrors} />
      <p className="text-sm text-[var(--fg-dim)]">
        <kbd>tab</kbd> next test
      </p>
    </motion.div>
  );
}
