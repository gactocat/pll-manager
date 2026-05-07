'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_PLLS, getPllDefinition } from '@/data/pll-definitions';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { useRandomSolves } from '@/hooks/useRandomSolves';
import { useSpacebar } from '@/hooks/useSpacebar';
import { PLL_IDS, type Auf, type PllId } from '@/types/pll';
import { PllImage } from './PllImage';
import { RandomStatsGrid } from './RandomStatsGrid';

type TrainerState = 'idle' | 'running' | 'stopped';

interface Pick {
  pllId: PllId;
  auf: Auf;
}

export function RandomTrainer() {
  const { ready, all, bestFor, ao5For, solvesFor, add, resetForPll } = useRandomSolves();
  const { starredFor } = useAlgorithms();

  // AUF for the picked PLL comes from its starred algorithm in All PLLs mode,
  // so the random case is presented in the orientation the user actually
  // practices. Falls back to U0 if no algorithm has been starred for that PLL.
  const pickRandom = useCallback((): Pick => {
    const pllId = PLL_IDS[Math.floor(Math.random() * PLL_IDS.length)];
    const auf = starredFor(pllId)?.auf ?? 'U0';
    return { pllId, auf };
  }, [starredFor]);

  const [state, setState] = useState<TrainerState>('idle');
  const [current, setCurrent] = useState<Pick | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (state !== 'running') return;
    const tick = () => {
      setElapsed((Date.now() - startRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  const start = useCallback(() => {
    setCurrent(pickRandom());
    startRef.current = Date.now();
    setElapsed(0);
    setState('running');
  }, [pickRandom]);

  const stop = useCallback(() => {
    setElapsed((Date.now() - startRef.current) / 1000);
    setState('stopped');
  }, []);

  const record = () => {
    if (current && elapsed > 0) add(current.pllId, elapsed);
    setState('idle');
    setElapsed(0);
    setCurrent(null);
  };

  const discard = () => {
    setState('idle');
    setElapsed(0);
    setCurrent(null);
  };

  // Spacebar mirrors the tap action: idle → start, running → stop. Stopped
  // state stays inert so a stray press doesn't lose the captured time
  // before the user picks Record / Discard.
  const onSpace = useCallback(() => {
    if (state === 'idle') start();
    else if (state === 'running') stop();
  }, [state, start, stop]);
  useSpacebar(onSpace);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Random Trainer</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Tap the surface, recognize the PLL, solve it, tap to stop.
          {ready && (
            <span className="ml-2 text-xs">
              · {all.length} random solve{all.length === 1 ? '' : 's'} recorded
            </span>
          )}
        </p>
      </div>

      <TrainerSurface
        state={state}
        current={current}
        elapsed={elapsed}
        onStart={start}
        onStop={stop}
        onRecord={record}
        onDiscard={discard}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          Per-PLL stats
          <span className="ml-2 text-sm text-zinc-500 font-normal">
            (random solves only)
          </span>
        </h2>
        <RandomStatsGrid
          plls={ALL_PLLS}
          bestFor={bestFor}
          ao5For={ao5For}
          solvesFor={solvesFor}
          onReset={resetForPll}
        />
      </section>
    </div>
  );
}

interface TrainerSurfaceProps {
  state: TrainerState;
  current: Pick | null;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
  onRecord: () => void;
  onDiscard: () => void;
}

function TrainerSurface({
  state,
  current,
  elapsed,
  onStart,
  onStop,
  onRecord,
  onDiscard,
}: TrainerSurfaceProps) {
  if (state === 'stopped' && current) {
    const def = getPllDefinition(current.pllId);
    return (
      <div className="rounded-lg border border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-6 flex flex-col items-center gap-4 select-none">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="rounded-md p-2 bg-zinc-100 dark:bg-zinc-900">
            <PllImage pllId={current.pllId} auf={current.auf} size={180} />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-sm uppercase tracking-wider text-amber-700 dark:text-amber-300">
              {def?.name ?? current.pllId} · {current.auf}
            </div>
            <div className="font-mono text-6xl sm:text-7xl font-bold tabular-nums text-amber-700 dark:text-amber-300">
              {elapsed.toFixed(3)}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRecord}
            className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 font-semibold"
          >
            ✓ Record
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✗ Discard
          </button>
        </div>
      </div>
    );
  }

  if (state === 'running' && current) {
    return (
      <button
        type="button"
        onPointerDown={onStop}
        className="w-full min-h-[320px] rounded-lg flex flex-col items-center justify-center gap-4 transition-colors select-none touch-none bg-rose-500 hover:bg-rose-600 text-white"
        aria-label="Tap to stop the timer"
      >
        <div className="rounded-md p-2 bg-white/15">
          <PllImage pllId={current.pllId} auf={current.auf} size={180} />
        </div>
        <div
          className="font-mono text-6xl sm:text-7xl font-bold tabular-nums leading-none"
          aria-live="polite"
        >
          {elapsed.toFixed(3)}
        </div>
        <div className="text-sm font-medium opacity-90 uppercase tracking-wider">
          Tap to stop
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onPointerDown={onStart}
      className="w-full min-h-[320px] rounded-lg flex flex-col items-center justify-center gap-3 transition-colors select-none touch-none bg-emerald-500 hover:bg-emerald-600 text-white"
      aria-label="Tap to start the random trainer"
    >
      <div className="font-mono text-6xl sm:text-7xl font-bold tabular-nums leading-none">
        0.000
      </div>
      <div className="text-sm font-medium opacity-90 uppercase tracking-wider">
        Tap to start
      </div>
      <div className="text-xs opacity-75 mt-2">
        A random PLL appears — name hidden until you stop
      </div>
    </button>
  );
}
