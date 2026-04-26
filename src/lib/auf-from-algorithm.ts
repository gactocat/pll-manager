import type { Auf } from '@/types/pll';

// Detect a leading "(U)" / "(U2)" / "(U')" setup move and split it off the
// algorithm body. Cube rotations like (y), (y2), (x') and bare U moves are
// intentionally NOT treated as setup AUFs — preset data normalizes leading
// y rotations to U turns before reaching this function.
export function splitAuf(algorithm: string): { auf: Auf; rest: string } {
  const trimmed = algorithm.trimStart();
  const m = trimmed.match(/^\(\s*(U2|U'|U)\s*\)\s*/);
  if (!m) return { auf: 'U0', rest: algorithm.trim() };
  const token = m[1];
  const auf: Auf = token === 'U2' ? 'U2' : token === "U'" ? "U'" : 'U';
  return { auf, rest: trimmed.slice(m[0].length).trim() };
}
