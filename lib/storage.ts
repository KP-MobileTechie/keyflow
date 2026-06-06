export interface TestResult {
  mode: 'time' | 'words';
  config: number;        // 15|30|60 seconds, or 10|25|50 words
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;   // 0–100, CV-derived (see lib/engine/stats.ts)
  timestamp: number;
}

interface StorageSchema {
  version: 1;
  results: TestResult[];
  bests: Record<string, number>;
}

const KEY = 'keyflow:v1';
const MAX_HISTORY = 50;
const empty = (): StorageSchema => ({ version: 1, results: [], bests: {} });

/** Null on the server (SSR) or when localStorage is inaccessible. */
function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function configKey(mode: TestResult['mode'], config: number): string {
  return `${mode}-${config}`;
}

/**
 * Informational only (e.g. to show a "history unavailable" notice).
 * All other exports are always safe to call — they self-degrade when
 * storage is missing or broken.
 */
export function isStorageAvailable(): boolean {
  const ls = getLocalStorage();
  if (!ls) return false;
  try {
    const t = 'keyflow:probe';
    ls.setItem(t, '1');
    ls.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

function load(): StorageSchema {
  const ls = getLocalStorage();
  if (!ls) return empty();
  try {
    const raw = ls.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as StorageSchema;
    if (
      parsed?.version !== 1 ||
      !Array.isArray(parsed.results) ||
      typeof parsed.bests !== 'object' ||
      parsed.bests === null
    ) {
      return empty();
    }
    return parsed;
  } catch {
    return empty();
  }
}

function persist(data: StorageSchema): void {
  const ls = getLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full/unavailable — app continues statelessly */
  }
}

export function getHistory(): TestResult[] {
  return load().results;
}

export function getBest(key: string): number | null {
  return load().bests[key] ?? null;
}

export function saveResult(result: TestResult): { isPB: boolean } {
  const data = load();
  const key = configKey(result.mode, result.config);
  const prev = data.bests[key] ?? 0;
  const isPB = result.wpm > prev;
  if (isPB) data.bests[key] = result.wpm;
  data.results = [result, ...data.results].slice(0, MAX_HISTORY);
  persist(data);
  return { isPB };
}
