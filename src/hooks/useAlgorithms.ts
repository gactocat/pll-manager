'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  getServerSnapshot,
  getSnapshot,
  mutate,
  subscribe,
} from '@/lib/storage';
import { bestSeconds } from '@/lib/stats';
import type {
  AlgorithmRecord,
  Auf,
  PllId,
  TimeRecord,
} from '@/types/pll';

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface UseAlgorithmsResult {
  ready: boolean;
  all: AlgorithmRecord[];
  forPll: (pllId: PllId, auf?: Auf) => AlgorithmRecord[];
  bestTimeFor: (pllId: PllId) => number | null;
  add: (input: { pllId: PllId; auf: Auf; algorithm: string }) => AlgorithmRecord;
  update: (
    id: string,
    patch: Partial<Pick<AlgorithmRecord, 'algorithm' | 'auf' | 'isFavorite'>>,
  ) => void;
  remove: (id: string) => void;
  addTime: (algorithmId: string, seconds: number) => void;
  removeTime: (algorithmId: string, timeId: string) => void;
}

export function useAlgorithms(): UseAlgorithmsResult {
  const records = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = typeof window !== 'undefined';

  const forPll = useCallback(
    (pllId: PllId, auf?: Auf) =>
      records.filter(
        (r) => r.pllId === pllId && (auf === undefined || r.auf === auf),
      ),
    [records],
  );

  const bestTimeFor = useCallback(
    (pllId: PllId) => {
      const all = records
        .filter((r) => r.pllId === pllId)
        .flatMap((r) => r.times);
      return bestSeconds(all);
    },
    [records],
  );

  const add = useCallback<UseAlgorithmsResult['add']>((input) => {
    const created: AlgorithmRecord = {
      id: newId(),
      pllId: input.pllId,
      auf: input.auf,
      algorithm: input.algorithm.trim(),
      times: [],
      isFavorite: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mutate((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback<UseAlgorithmsResult['update']>((id, patch) => {
    mutate((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...patch,
              algorithm:
                patch.algorithm !== undefined
                  ? patch.algorithm.trim()
                  : r.algorithm,
              updatedAt: nowIso(),
            }
          : r,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    mutate((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addTime = useCallback((algorithmId: string, seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const t: TimeRecord = {
      id: newId(),
      seconds,
      recordedAt: nowIso(),
    };
    mutate((prev) =>
      prev.map((r) =>
        r.id === algorithmId
          ? { ...r, times: [t, ...r.times], updatedAt: nowIso() }
          : r,
      ),
    );
  }, []);

  const removeTime = useCallback((algorithmId: string, timeId: string) => {
    mutate((prev) =>
      prev.map((r) =>
        r.id === algorithmId
          ? {
              ...r,
              times: r.times.filter((t) => t.id !== timeId),
              updatedAt: nowIso(),
            }
          : r,
      ),
    );
  }, []);

  return useMemo(
    () => ({
      ready,
      all: records,
      forPll,
      bestTimeFor,
      add,
      update,
      remove,
      addTime,
      removeTime,
    }),
    [
      ready,
      records,
      forPll,
      bestTimeFor,
      add,
      update,
      remove,
      addTime,
      removeTime,
    ],
  );
}
