'use client';

import type { Auf } from '@/types/pll';
import { AUFS } from '@/types/pll';

interface AufTabsProps {
  value: Auf;
  onChange: (auf: Auf) => void;
  countByAuf?: Record<Auf, number>;
}

const LABELS: Record<Auf, string> = {
  U0: 'U0',
  U: 'U',
  U2: 'U2',
  "U'": "U'",
};

export function AufTabs({ value, onChange, countByAuf }: AufTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Starting orientation (AUF)"
      className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 gap-1"
    >
      {AUFS.map((auf) => {
        const active = auf === value;
        const count = countByAuf?.[auf] ?? 0;
        return (
          <button
            key={auf}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(auf)}
            className={`relative px-3 py-1.5 text-sm font-mono rounded-md transition-colors ${
              active
                ? 'bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {LABELS[auf]}
            {count > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] rounded-full px-1 ${
                  active
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
