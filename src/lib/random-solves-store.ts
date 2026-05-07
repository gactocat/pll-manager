import type { RandomSolve } from '@/types/pll';

const STORAGE_KEY = 'pll-app:random-solves:v1';

let cached: RandomSolve[] | null = null;
const listeners = new Set<() => void>();

function normalizeRecord(raw: unknown): RandomSolve | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Partial<RandomSolve>;
  if (!r.id || !r.pllId) return null;
  if (typeof r.seconds !== 'number' || !Number.isFinite(r.seconds)) return null;
  return {
    id: r.id,
    pllId: r.pllId,
    seconds: r.seconds,
    recordedAt: r.recordedAt ?? new Date(0).toISOString(),
  };
}

function readFromStorage(): RandomSolve[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeRecord)
      .filter((r): r is RandomSolve => r !== null);
  } catch {
    return [];
  }
}

function writeToStorage(records: RandomSolve[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

const EMPTY: RandomSolve[] = [];

export function getSnapshot(): RandomSolve[] {
  if (typeof window === 'undefined') return EMPTY;
  if (cached === null) cached = readFromStorage();
  return cached;
}

export function getServerSnapshot(): RandomSolve[] {
  return EMPTY;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function mutate(
  updater: (prev: RandomSolve[]) => RandomSolve[],
): void {
  const prev = getSnapshot();
  const next = updater(prev);
  if (next === prev) return;
  cached = next;
  writeToStorage(next);
  listeners.forEach((l) => l());
}
