# keyflow

A typing-speed trainer with a terminal aesthetic. Live WPM, a per-key error heatmap, and your history — all local, no accounts.

**[Live demo](#)** · ![CI](https://github.com/KP-MobileTechie/keyflow/actions/workflows/ci.yml/badge.svg)

<!-- Add demo.gif here after recording: ![demo](public/demo.gif) -->

## Features
- **Time mode** (15 / 30 / 60s) and **Words mode** (10 / 25 / 50 words)
- Live WPM and countdown while you type; the test starts on your first keystroke
- Results: WPM, raw WPM, accuracy, consistency, and a per-second WPM chart
- **Per-key error heatmap** — see exactly which keys slow you down
- Personal bests per mode and a local history of your last 50 tests
- Keyboard-first: `Tab` restarts instantly with fresh words

## How it works
Every keystroke is recorded as `{ key, expected, correct, timestamp }` in an append-only log — backspaces included. All statistics are derived from that log after the test ends, never from running counters:

- **WPM** = correct characters ÷ 5 ÷ minutes (raw WPM uses every typed character)
- **Timeline** = cumulative WPM sampled at each elapsed second (built in a single pass)
- **Heatmap** = error rate per *expected* key, so the key you failed to hit gets the blame
- **Consistency** = 1 − coefficient of variation of per-second WPM

The engine (`lib/engine/`) is pure TypeScript with no DOM dependencies, covered by Vitest.

## Decisions
- **A keystroke log instead of running counters** — one source of truth; every stat is reproducible from the log, which made the math trivially unit-testable and the timeline/heatmap fall out for free.
- **localStorage instead of a backend** — a typing test needs no auth or database. A versioned schema (`keyflow:v1`) keeps future migrations safe, and every read/write degrades gracefully (and SSR-safely) when storage is missing.
- **Blame the expected key, not the typed key** — pressing `x` when `a` was due is an `a` problem (finger travel), which makes the heatmap actually useful for practice.

## Tech stack
Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Recharts · Vitest

## Getting started
```bash
git clone https://github.com/KP-MobileTechie/keyflow.git
cd keyflow
npm install
npm run dev      # http://localhost:3000
npm test         # engine unit tests
```

## License
[MIT](LICENSE)
