# keyflow — Design Spec

**Date:** 2026-06-06
**Status:** Approved (brainstorming session)
**Repo:** `D:\Projects\keyflow` · Deploy target: Vercel · Public GitHub repo

## Summary

A typing-speed trainer with a terminal/IDE aesthetic. Users pick a test mode, type a generated prompt, see live WPM and a countdown/progress indicator, and finish on a results screen with a WPM-over-time chart and a per-key error heatmap. All data (history, personal bests, settings) persists in localStorage — no backend.

Portfolio goals: demonstrate real-time input handling, pure-function engine design with unit tests, stats/data visualization, and UI polish. First project in a six-project portfolio plan (see roadmap conversation, Jun 6 2026).

## Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Persistence | localStorage only | Zero backend/env keys; one-step Vercel deploy. Online leaderboard deferred to v2. |
| Test modes | Time (15/30/60s) + Words (10/25/50) | Covers expected core; Quotes mode deferred (punctuation/dataset scope). |
| Visual style | Terminal/IDE aesthetic | Monospace, block caret, syntax-highlight accent colors. Distinctive vs. monkeytype clones. |
| Stack | Next.js App Router + TypeScript + Tailwind + shadcn/ui + Framer Motion + Recharts + Vitest | Consistent with rest of portfolio; free metadata/OG handling. |
| State | React state/reducers only | One active test + settings + history; no state library (YAGNI). |

## Architecture

```
app/
  layout.tsx          # fonts (monospace), metadata, OG image, theme
  page.tsx            # view state: test screen ⇄ results screen
lib/engine/           # PURE TypeScript — no React, no DOM
  words.ts            # common-English word list + test-text generator (seeded random)
  tracker.ts          # keystroke log: { char, expected, correct, timestamp }
  stats.ts            # WPM, raw WPM, accuracy, consistency, per-key error rates, WPM timeline
lib/storage.ts        # localStorage read/write: history, personal bests, settings; versioned schema
components/
  TypingArea.tsx      # prompt rendering w/ per-char state, blinking block caret, keydown handling
  ModeBar.tsx         # mode switcher: time|words + duration/word-count
  LiveStats.tsx       # live WPM + timer/progress during test
  ResultsPanel.tsx    # stat cards, WPM timeline chart (Recharts), heatmap, "new PB" flourish
  KeyboardHeatmap.tsx # QWERTY SVG layout, keys tinted gray→red by error rate
  HistoryPanel.tsx    # past results list from storage
```

**Data flow:** keydown → `tracker` records keystroke → React state re-renders char states → on test end → `stats` computes results from raw keystroke log → result saved via `storage` → `ResultsPanel` renders. The engine never touches the DOM; the UI never computes stats.

**Unit boundaries:** each `lib/engine` module is independently testable pure functions. `storage.ts` is the only module touching `window.localStorage`, behind a safe wrapper.

## Key behaviors

- Test starts on first keystroke; timer idle until then
- `Tab` or `Esc` restarts instantly with freshly generated words
- Correct chars dim; wrong chars render red showing the typed char; block caret blinks at current position
- WPM timeline sampled every 1s for the results chart
- Per-key heatmap from error rate per physical key
- Personal best tracked per mode-config (e.g. `time-30`, `words-25`); PB celebration on results screen
- Backspace supported (corrections recorded in keystroke log)

## Error handling / edge cases

- localStorage unavailable or corrupt → app runs statelessly; history panel shows notice; no crashes
- Paste events blocked; non-character keys (except Backspace/Tab/Esc) ignored
- Test ends with zero keystrokes (time mode) → explicit "no input" result, never NaN
- Window blur mid-test → test pauses-free continues (timer is wall-clock from first keystroke); acceptable for v1

## Testing

- Vitest on `lib/engine/`: WPM/accuracy math, empty input, all-wrong input, backspace sequences, generator determinism with fixed seed, per-key aggregation
- GitHub Actions CI running `vitest run` + `next build` (badge in README)
- UI verified manually in browser before each deploy

## Out of scope (v2 candidates)

Online leaderboard (Supabase), quotes mode, themes/customization, sound effects, multi-language word lists, smooth-caret setting.

## Delivery plan (5 commit days)

1. `chore:` scaffold Next.js + Tailwind + shadcn, terminal theme, layout shell
2. `feat:` engine modules (`words`, `tracker`, `stats`) + Vitest suite
3. `feat:` TypingArea + ModeBar + LiveStats — full test flow end-to-end
4. `feat:` ResultsPanel (chart, heatmap), HistoryPanel, PBs, polish (motion, a11y, empty/error states)
5. `docs:`/`chore:` README (demo GIF, "How it works" on stats math, Decisions section), OG image, CI, Vercel deploy

## README plan

Top: title, one-liner, demo GIF, live-demo + CI badges. Then: Features · Tech Stack · How it works (WPM/accuracy math, keystroke-log design) · Decisions (3 trade-off bullets) · Getting started · License (MIT). No Contributing section (solo portfolio repo).
