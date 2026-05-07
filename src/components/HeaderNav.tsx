'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'All PLLs', match: (p: string) => p === '/' || p.startsWith('/pll') },
  { href: '/random', label: 'Random', match: (p: string) => p.startsWith('/random') },
] as const;

export function HeaderNav() {
  const pathname = usePathname() ?? '/';
  return (
    <nav
      aria-label="Mode"
      className="inline-flex rounded-md bg-zinc-100 dark:bg-zinc-800 p-0.5 gap-0.5"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
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
