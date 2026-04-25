'use client';

import { useState } from 'react';
import { AlgorithmForm } from './AlgorithmForm';
import { TimeHistoryPanel } from './TimeHistoryPanel';
import { averageSeconds, bestSeconds, formatSeconds } from '@/lib/stats';
import type { AlgorithmRecord } from '@/types/pll';

interface AlgorithmRowProps {
  record: AlgorithmRecord;
  onUpdate: (id: string, patch: { algorithm?: string; isFavorite?: boolean }) => void;
  onRemove: (id: string) => void;
  onAddTime: (id: string, seconds: number) => void;
  onRemoveTime: (id: string, timeId: string) => void;
}

export function AlgorithmRow({
  record,
  onUpdate,
  onRemove,
  onAddTime,
  onRemoveTime,
}: AlgorithmRowProps) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const best = bestSeconds(record.times);
  const avg = averageSeconds(record.times);

  return (
    <li
      className={`rounded-lg border ${
        record.isFavorite
          ? 'border-amber-400 dark:border-amber-500'
          : 'border-zinc-200 dark:border-zinc-800'
      } bg-white dark:bg-zinc-900`}
    >
      <div className="p-3 flex items-start gap-3">
        <button
          type="button"
          onClick={() => onUpdate(record.id, { isFavorite: !record.isFavorite })}
          className={`mt-1 text-lg leading-none ${
            record.isFavorite
              ? 'text-amber-500'
              : 'text-zinc-300 hover:text-amber-400 dark:text-zinc-700'
          }`}
          aria-label={record.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          title="Favorite"
        >
          ★
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <AlgorithmForm
              initialValue={record.algorithm}
              submitLabel="Update"
              onSubmit={(v) => {
                onUpdate(record.id, { algorithm: v });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <p className="font-mono text-sm break-words">{record.algorithm}</p>
          )}

          <div className="mt-2 flex items-center gap-4 text-xs">
            <span>
              Best:{' '}
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {formatSeconds(best)}
              </span>
            </span>
            <span>
              Avg:{' '}
              <span className="font-mono font-semibold">
                {formatSeconds(avg)}
              </span>
            </span>
            <span className="text-zinc-500">
              {record.times.length} solve{record.times.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-expanded={expanded}
            >
              {expanded ? 'Close' : 'Times'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this algorithm?')) onRemove(record.id);
              }}
              className="text-xs px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <TimeHistoryPanel
            times={record.times}
            onAdd={(s) => onAddTime(record.id, s)}
            onRemove={(tid) => onRemoveTime(record.id, tid)}
          />
        </div>
      )}
    </li>
  );
}
