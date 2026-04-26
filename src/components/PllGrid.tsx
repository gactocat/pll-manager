'use client';

import Link from 'next/link';
import { ALL_PLLS } from '@/data/pll-definitions';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { useDefaultAufs } from '@/hooks/useDefaultAufs';
import { formatSeconds } from '@/lib/stats';
import { PllImage } from './PllImage';
import { AUFS, type Auf, type PllCategory, type PllId } from '@/types/pll';

const CATEGORY_LABELS: Record<PllCategory, string> = {
  epll: 'Permutations of Edges Only',
  cpll: 'Permutations of Corners Only',
  'ec-pll': 'Permutations of Edges and Corners',
};

const CATEGORY_ORDER: PllCategory[] = ['epll', 'cpll', 'ec-pll'];

const AUF_LABEL: Record<Auf, string> = {
  U0: 'U0',
  U: 'U',
  U2: 'U2',
  "U'": "U'",
};

function timeBadgeClasses(seconds: number | null): string {
  if (seconds === null) return 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
  if (seconds < 2.5) return 'bg-emerald-500 text-white';
  if (seconds < 3.5) return 'bg-emerald-300 text-emerald-950';
  if (seconds < 4.5) return 'bg-amber-300 text-amber-950';
  return 'bg-rose-400 text-rose-950';
}

interface AufPickerProps {
  value: Auf;
  onChange: (auf: Auf) => void;
}

function AufPicker({ value, onChange }: AufPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Default orientation"
      className="flex justify-center gap-1"
    >
      {AUFS.map((auf) => {
        const active = auf === value;
        return (
          <button
            key={auf}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(auf)}
            className={`flex-1 text-[10px] font-mono px-1 py-0.5 rounded border transition-colors ${
              active
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {AUF_LABEL[auf]}
          </button>
        );
      })}
    </div>
  );
}

export function PllGrid() {
  const { ready, bestTimeFor, all } = useAlgorithms();
  const { getDefault, setDefault } = useDefaultAufs();

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
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((pll) => {
              const best = ready ? bestTimeFor(pll.id) : null;
              const defaultAuf = getDefault(pll.id);
              return (
                <li
                  key={pll.id}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  <Link
                    href={`/pll/${pll.id}?auf=${encodeURIComponent(defaultAuf)}`}
                    className="block p-3 pb-2"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-medium text-sm">{pll.name}</span>
                      <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded ${timeBadgeClasses(best)}`}
                      >
                        {formatSeconds(best)}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <PllImage pllId={pll.id} auf={defaultAuf} size={96} />
                    </div>
                  </Link>
                  <div className="px-3 pb-3 pt-1">
                    <AufPicker
                      value={defaultAuf}
                      onChange={(auf) => setDefault(pll.id as PllId, auf)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
