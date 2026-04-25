import type { TimeRecord } from '@/types/pll';

export function bestSeconds(times: TimeRecord[]): number | null {
  if (times.length === 0) return null;
  return times.reduce((min, t) => (t.seconds < min ? t.seconds : min), Infinity);
}

export function averageSeconds(times: TimeRecord[]): number | null {
  if (times.length === 0) return null;
  const sum = times.reduce((s, t) => s + t.seconds, 0);
  return sum / times.length;
}

// Average of N: drop best & worst, mean the rest. Returns null if not enough.
export function averageOfN(times: TimeRecord[], n: number): number | null {
  if (times.length < n) return null;
  const recent = times.slice(0, n).map((t) => t.seconds);
  recent.sort((a, b) => a - b);
  const trimmed = recent.slice(1, n - 1);
  const sum = trimmed.reduce((s, v) => s + v, 0);
  return sum / trimmed.length;
}

export function formatSeconds(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(2);
}
