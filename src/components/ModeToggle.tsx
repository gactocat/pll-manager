'use client';

import Link from 'next/link';
import type { PllGridMode } from './PllGrid';

interface ModeToggleProps {
  current: PllGridMode;
}

const TABS: ReadonlyArray<{ mode: PllGridMode; label: string; href: string }> = [
  { mode: 'all', label: 'All PLLs', href: '/' },
  { mode: 'random', label: 'Random', href: '/?mode=random' },
];

export function ModeToggle({ current }: ModeToggleProps) {
  return (
    <nav
      aria-label="Mode"
      className="inline-flex rounded-md bg-zinc-100 dark:bg-zinc-800 p-0.5 gap-0.5"
    >
      {TABS.map((tab) => {
        const active = tab.mode === current;
        return (
          <Link
            key={tab.mode}
            href={tab.href}
            scroll={false}
            aria-current={active ? 'page' : undefined}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              active
                ? 'bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
