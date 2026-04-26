import type { Auf } from '@/types/pll';

// Detect a leading setup move and split it off the algorithm body.
// Both U-layer turns (U/U2/U') and y-axis cube rotations (y/y2/y') are treated
// as AUF setups: from the U-face viewpoint they produce the identical visual
// rotation, so the PLL recognition image renders the same either way.
// Other rotations like (x), (z) are not AUFs and stay in the algorithm body.
export function splitAuf(algorithm: string): { auf: Auf; rest: string } {
  const trimmed = algorithm.trimStart();
  const m = trimmed.match(/^\(\s*(U2|U'|U|y2|y'|y)\s*\)\s*/);
  if (!m) return { auf: 'U0', rest: algorithm.trim() };
  const token = m[1];
  const auf: Auf =
    token === 'U2' || token === 'y2'
      ? 'U2'
      : token === "U'" || token === "y'"
        ? "U'"
        : 'U';
  return { auf, rest: trimmed.slice(m[0].length).trim() };
}
