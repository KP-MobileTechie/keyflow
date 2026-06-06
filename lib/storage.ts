export interface TestResult {
  mode: 'time' | 'words';
  config: number;        // 15|30|60 seconds, or 10|25|50 words
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
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

export function configKey(mode: TestResult['mode'], config: number): string {
  return `${mode}-${config}`;
}

export function isStorageAvailable(): boolean {
  try {
    const t = 'keyflow:probe';
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

function load(): StorageSchema {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as StorageSchema;
    if (parsed?.version !== 1 || !Array.isArray(parsed.results)) return empty();
    return parsed;
  } catch {
    return empty();
  }
}

function persist(data: StorageSchema): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
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
