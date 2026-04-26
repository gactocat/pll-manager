'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { getPllDefinition } from '@/data/pll-definitions';
import { useAlgorithms } from '@/hooks/useAlgorithms';
import { aufFromAlgorithm } from '@/lib/auf-from-algorithm';
import { type Auf, type PllId } from '@/types/pll';
import { AlgorithmForm } from './AlgorithmForm';
import { AlgorithmRow } from './AlgorithmRow';
import { AufTabs } from './AufTabs';
import { PllImage } from './PllImage';

interface PllDetailProps {
  pllId: PllId;
}

export function PllDetail({ pllId }: PllDetailProps) {
  const def = getPllDefinition(pllId);
  const [manualAuf, setManualAuf] = useState<Auf | null>(null);
  const [adding, setAdding] = useState(false);
  const {
    ready,
    all,
    starredFor,
    add,
    update,
    setStar,
    remove,
    addTime,
    removeTime,
  } = useAlgorithms();

  const recordsByAuf = useMemo(() => {
    const map: Record<Auf, typeof all> = { U0: [], U: [], U2: [], "U'": [] };
    for (const r of all) {
      if (r.pllId !== pllId) continue;
      map[r.auf].push(r);
    }
    return map;
  }, [all, pllId]);

  const star = ready ? starredFor(pllId) : null;
  const starAuf: Auf = star ? aufFromAlgorithm(star.algorithm) : 'U0';
  // Tabs follow the starred algorithm's setup AUF until the user picks a tab,
  // after which their choice sticks for the rest of the visit.
  const auf: Auf = manualAuf ?? starAuf;

  const countByAuf: Record<Auf, number> = {
    U0: recordsByAuf.U0.length,
    U: recordsByAuf.U.length,
    U2: recordsByAuf.U2.length,
    "U'": recordsByAuf["U'"].length,
  };

  if (!def) {
    return (
      <div className="space-y-4">
        <p>PLL not found: {pllId}</p>
        <Link href="/" className="text-emerald-600 hover:underline text-sm">
          ← Back to all PLLs
        </Link>
      </div>
    );
  }

  const current = recordsByAuf[auf].slice().sort((a, b) => {
    if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← All PLLs
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{def.name}</h1>
          <AufTabs value={auf} onChange={setManualAuf} countByAuf={countByAuf} />
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="rounded-lg p-2 bg-zinc-100 dark:bg-zinc-900">
            <PllImage pllId={pllId} auf={auf} size={220} />
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Algorithms
            <span className="ml-2 text-sm text-zinc-500 font-normal">
              ({auf} orientation · {countByAuf[auf]})
            </span>
          </h2>
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 font-medium"
            >
              + Add
            </button>
          )}
        </header>

        {adding && (
          <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
            <AlgorithmForm
              pllId={pllId}
              onSubmit={(v) => {
                add({ pllId, auf, algorithm: v });
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}

        {!ready ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : current.length === 0 && !adding ? (
          <p className="text-sm text-zinc-500 py-6 text-center">
            No algorithms saved for this orientation yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {current.map((record) => (
              <AlgorithmRow
                key={record.id}
                record={record}
                onUpdate={update}
                onSetStar={setStar}
                onRemove={remove}
                onAddTime={addTime}
                onRemoveTime={removeTime}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
