'use client';

import { formatSeconds } from '@/lib/stats';
import { PllImage } from './PllImage';
import type { PllDefinition, PllId, RandomSolve } from '@/types/pll';

interface RandomStatsGridProps {
  plls: readonly PllDefinition[];
  bestFor: (pllId: PllId) => number | null;
  ao5For: (pllId: PllId) => number | null;
  solvesFor: (pllId: PllId) => RandomSolve[];
  onReset: (pllId: PllId) => void;
}

export function RandomStatsGrid({
  plls,
  bestFor,
  ao5For,
  solvesFor,
  onReset,
}: RandomStatsGridProps) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {plls.map((pll) => {
        const best = bestFor(pll.id);
        const ao5 = ao5For(pll.id);
        const count = solvesFor(pll.id).length;
        return (
          <li
            key={pll.id}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
          >
            <div className="flex items-center gap-3">
              <PllImage pllId={pll.id} auf="U0" size={64} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">{pll.name}</div>
                  {count > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Reset all ${count} random solve${count === 1 ? '' : 's'} for ${pll.name}?`,
                          )
                        ) {
                          onReset(pll.id);
                        }
                      }}
                      className="text-[10px] uppercase tracking-wider text-zinc-400 hover:text-rose-500"
                    >
                      Reset
                    </button>
                  )}
                </div>
                {count === 0 ? (
                  <div className="text-xs text-zinc-400 italic mt-1">
                    No solves yet
                  </div>
                ) : (
                  <dl className="mt-1 text-xs grid grid-cols-3 gap-1">
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Best
                      </dt>
                      <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatSeconds(best)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-zinc-500">
                        ao5
                      </dt>
                      <dd className="font-mono font-semibold">
                        {formatSeconds(ao5)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Solves
                      </dt>
                      <dd className="font-mono font-semibold">{count}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
