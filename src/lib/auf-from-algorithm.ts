import type { Auf } from '@/types/pll';

// Detect a leading "(U)" / "(U2)" / "(U')" setup move on the algorithm string.
// Cube rotations like (y), (y2), (x') and "U as a regular move" without parens
// are intentionally NOT treated as setup AUFs.
export function aufFromAlgorithm(algorithm: string): Auf {
  const m = algorithm.trimStart().match(/^\(\s*(U2|U'|U)\s*\)/);
  if (!m) return 'U0';
  const token = m[1];
  if (token === 'U2') return 'U2';
  if (token === "U'") return "U'";
  return 'U';
}
