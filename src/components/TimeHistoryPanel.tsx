'use client';

import { useState, type FormEvent } from 'react';
import {
  averageOfN,
  averageSeconds,
  bestSeconds,
  formatSeconds,
} from '@/lib/stats';
import type { TimeRecord } from '@/types/pll';

interface TimeHistoryPanelProps {
  times: TimeRecord[];
  onAdd: (seconds: number) => void;
  onRemove: (timeId: string) => void;
}

function formatRecordedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function TimeHistoryPanel({
  times,
  onAdd,
  onRemove,
}: TimeHistoryPanelProps) {
  const [input, setInput] = useState('');

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const seconds = Number.parseFloat(input);
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    onAdd(seconds);
    setInput('');
  };

  const best = bestSeconds(times);
  const avg = averageSeconds(times);
  const ao5 = averageOfN(times, 5);

  return (
    <div className="rounded-md bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-3 space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Best" value={formatSeconds(best)} accent="emerald" />
        <Stat label="Avg" value={formatSeconds(avg)} />
        <Stat label="ao5" value={formatSeconds(ao5)} />
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Seconds (e.g. 3.42)"
          className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 font-medium"
        >
          Record
        </button>
      </form>

      {times.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-2">
          No times recorded yet.
        </p>
      ) : (
        <ul className="max-h-48 overflow-auto divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
          {times.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between py-1.5 gap-2"
            >
              <span className="font-mono tabular-nums">
                {t.seconds.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-500">
                {formatRecordedAt(t.recordedAt)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(t.id)}
                className="text-xs text-zinc-400 hover:text-rose-500"
                aria-label="Delete this entry"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'emerald';
}) {
  const valueColor = accent === 'emerald'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-zinc-900 dark:text-zinc-100';
  return (
    <div className="rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-2">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className={`font-mono text-base font-semibold tabular-nums ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}
