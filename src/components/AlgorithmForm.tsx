'use client';

import { useState, type FormEvent } from 'react';

interface AlgorithmFormProps {
  initialValue?: string;
  submitLabel?: string;
  placeholder?: string;
  onSubmit: (algorithm: string) => void;
  onCancel?: () => void;
}

export function AlgorithmForm({
  initialValue = '',
  submitLabel = 'Save',
  placeholder = "e.g. (R U R' F') (R U R' U') (R' F R2 U' R')",
  onSubmit,
  onCancel,
}: AlgorithmFormProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    if (!initialValue) setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 font-medium"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 text-sm px-4 py-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
