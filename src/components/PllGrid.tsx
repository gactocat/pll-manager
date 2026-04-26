'use client';

import Link from 'next/link';
import { ALL_PLLS } from '@/data/pll-definitions';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { averageOfN, bestSeconds, formatSeconds } from '@/lib/stats';
import { PllImage } from './PllImage';
import type { PllCategory } from '@/types/pll';

const CATEGORY_LABELS: Record<PllCategory, string> = {
  epll: 'Permutations of Edges Only',
  cpll: 'Permutations of Corners Only',
  'ec-pll': 'Permutations of Edges and Corners',
};

const CATEGORY_ORDER: PllCategory[] = ['epll', 'cpll', 'ec-pll'];

function timeBadgeClasses(seconds: number | null): string {
  if (seconds === null) return 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
  if (seconds < 2.5) return 'bg-emerald-500 text-white';
  if (seconds < 3.5) return 'bg-emerald-300 text-emerald-950';
  if (seconds < 4.5) return 'bg-amber-300 text-amber-950';
  return 'bg-rose-400 text-rose-950';
}

function formatLastDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function PllGrid() {
  const { ready, starredFor, all } = useAlgorithms();

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: ALL_PLLS.filter((p) => p.category === cat),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All PLLs</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Pick a PLL to manage algorithms and times for each orientation (U0 / U / U2 / U&apos;).
          {ready && (
            <span className="ml-2 text-xs">
              · {all.length} algorithm{all.length === 1 ? '' : 's'} saved
            </span>
          )}
        </p>
      </div>

      {grouped.map(({ category, items }) => (
        <section key={category}>
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">
            {CATEGORY_LABELS[category]}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((pll) => {
              const star = ready ? starredFor(pll.id) : null;
              const starTimes = star?.times ?? [];
              const best = bestSeconds(starTimes);
              const ao5 = averageOfN(starTimes, 5);
              const lastDate = formatLastDate(starTimes[0]?.recordedAt);
              const displayAuf = star?.auf ?? 'U0';
              return (
                <li key={pll.id}>
                  <Link
                    href={`/pll/${pll.id}`}
                    className="group flex flex-col h-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-medium text-sm">{pll.name}</span>
                      <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded ${timeBadgeClasses(best)}`}
                      >
                        {formatSeconds(best)}
                      </span>
                    </div>
                    <div className="flex justify-center mb-2">
                      <PllImage pllId={pll.id} auf={displayAuf} size={96} />
                    </div>
                    <div className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 break-words leading-snug min-h-[2.5em] flex items-center justify-center text-center">
                      {star ? (
                        <span>
                          <span
                            className="text-amber-500 mr-1"
                            aria-label="Starred"
                            title="Starred"
                          >
                            ★
                          </span>
                          {star.algorithm}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic">
                          No algorithm saved
                        </span>
                      )}
                    </div>
                    {star && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
                        <span>
                          ao5{' '}
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {formatSeconds(ao5)}
                          </span>
                        </span>
                        <span aria-hidden>·</span>
                        <span title="Last recorded date">{lastDate}</span>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
