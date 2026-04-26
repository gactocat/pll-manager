import type { AlgorithmRecord, PllId } from '@/types/pll';

const STORAGE_KEY = 'pll-app:algorithms:v1';

let cached: AlgorithmRecord[] | null = null;
const listeners = new Set<() => void>();

// Migrate legacy `isFavorite` field to `isStarred` if old data is loaded.
function normalizeRecord(raw: unknown): AlgorithmRecord | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Partial<AlgorithmRecord> & { isFavorite?: boolean };
  if (!r.id || !r.pllId || !r.algorithm) return null;
  return {
    id: r.id,
    pllId: r.pllId,
    auf: r.auf ?? 'U0',
    algorithm: r.algorithm,
    times: Array.isArray(r.times) ? r.times : [],
    isStarred: typeof r.isStarred === 'boolean' ? r.isStarred : !!r.isFavorite,
    createdAt: r.createdAt ?? new Date(0).toISOString(),
    updatedAt: r.updatedAt ?? new Date(0).toISOString(),
  };
}

function readFromStorage(): AlgorithmRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeRecord)
      .filter((r): r is AlgorithmRecord => r !== null);
  } catch {
    return [];
  }
}

function writeToStorage(records: AlgorithmRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

const EMPTY: AlgorithmRecord[] = [];

export function getSnapshot(): AlgorithmRecord[] {
  if (typeof window === 'undefined') return EMPTY;
  if (cached === null) cached = readFromStorage();
  return cached;
}

export function getServerSnapshot(): AlgorithmRecord[] {
  return EMPTY;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Enforce: each PLL with at least one algorithm has exactly one starred entry.
// Preserves an existing star if there is one; otherwise stars the first record.
export function enforceStarInvariant(records: AlgorithmRecord[]): AlgorithmRecord[] {
  const byPll = new Map<PllId, AlgorithmRecord[]>();
  for (const r of records) {
    const list = byPll.get(r.pllId) ?? [];
    list.push(r);
    byPll.set(r.pllId, list);
  }
  const fixedIds = new Map<string, boolean>();
  for (const [, list] of byPll) {
    if (list.length === 0) continue;
    const stars = list.filter((r) => r.isStarred);
    let starredId: string;
    if (stars.length === 1) {
      starredId = stars[0].id;
    } else if (stars.length === 0) {
      starredId = list[0].id;
    } else {
      // Multiple stars: keep the most recently updated one.
      const winner = stars.reduce((a, b) => (a.updatedAt > b.updatedAt ? a : b));
      starredId = winner.id;
    }
    for (const r of list) fixedIds.set(r.id, r.id === starredId);
  }
  let changed = false;
  const next = records.map((r) => {
    const want = fixedIds.get(r.id) ?? r.isStarred;
    if (want === r.isStarred) return r;
    changed = true;
    return { ...r, isStarred: want };
  });
  return changed ? next : records;
}

export function mutate(
  updater: (prev: AlgorithmRecord[]) => AlgorithmRecord[],
): void {
  const prev = getSnapshot();
  const next = enforceStarInvariant(updater(prev));
  if (next === prev) return;
  cached = next;
  writeToStorage(next);
  listeners.forEach((l) => l());
}
