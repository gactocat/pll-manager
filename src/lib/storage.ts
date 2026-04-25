import type { AlgorithmRecord } from '@/types/pll';

const STORAGE_KEY = 'pll-app:algorithms:v1';

let cached: AlgorithmRecord[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): AlgorithmRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AlgorithmRecord[];
  } catch {
    return [];
  }
}

function writeToStorage(records: AlgorithmRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getSnapshot(): AlgorithmRecord[] {
  if (typeof window === 'undefined') return EMPTY;
  if (cached === null) cached = readFromStorage();
  return cached;
}

const EMPTY: AlgorithmRecord[] = [];

export function getServerSnapshot(): AlgorithmRecord[] {
  return EMPTY;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function mutate(
  updater: (prev: AlgorithmRecord[]) => AlgorithmRecord[],
): void {
  const prev = getSnapshot();
  const next = updater(prev);
  if (next === prev) return;
  cached = next;
  writeToStorage(next);
  listeners.forEach((l) => l());
}
