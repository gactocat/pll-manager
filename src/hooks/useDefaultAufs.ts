'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  type DefaultAufs,
  getServerSnapshot,
  getSnapshot,
  setDefaultAuf,
  subscribe,
} from '@/lib/default-aufs-store';
import type { Auf, PllId } from '@/types/pll';

export interface UseDefaultAufsResult {
  defaults: DefaultAufs;
  getDefault: (pllId: PllId) => Auf;
  setDefault: (pllId: PllId, auf: Auf) => void;
}

export function useDefaultAufs(): UseDefaultAufsResult {
  const defaults = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const getDefault = useCallback(
    (pllId: PllId): Auf => defaults[pllId] ?? 'U0',
    [defaults],
  );

  return { defaults, getDefault, setDefault: setDefaultAuf };
}
