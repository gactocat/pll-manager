import type { Auf, PllId } from '@/types/pll';

const STORAGE_KEY = 'pll-app:default-aufs:v1';

export type DefaultAufs = Partial<Record<PllId, Auf>>;

const EMPTY: DefaultAufs = Object.freeze({});

let cached: DefaultAufs | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): DefaultAufs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as DefaultAufs;
  } catch {
    return {};
  }
}

function writeToStorage(d: DefaultAufs): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

export function getSnapshot(): DefaultAufs {
  if (typeof window === 'undefined') return EMPTY;
  if (cached === null) cached = readFromStorage();
  return cached;
}

export function getServerSnapshot(): DefaultAufs {
  return EMPTY;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setDefaultAuf(pllId: PllId, auf: Auf): void {
  const prev = getSnapshot();
  if (prev[pllId] === auf) return;
  const next: DefaultAufs = { ...prev, [pllId]: auf };
  cached = next;
  writeToStorage(next);
  listeners.forEach((l) => l());
}
