import type {
  PieceSwap,
  PllCategory,
  PllDefinition,
  PllId,
  StickerColor,
} from '@/types/pll';
import { PLL_IDS } from '@/types/pll';

// ---------------------------------------------------------------------------
// Coordinate convention (top view, looking down the U axis)
//
//   Corners (CW from back-left): 0=UBL, 1=UBR, 2=UFR, 3=UFL
//   Edges   (CW from back):      0=UB,  1=UR,  2=UF,  3=UL
//
// Each corner has 2 visible side facets at adjacent face directions. Stored in
// CW perimeter order: facet[0] is the "leading" face encountered going CW
// around the cube, facet[1] is the next.
//
//   UBL: (L, B)   home colors (O, B)
//   UBR: (B, R)   home colors (B, R)
//   UFR: (R, F)   home colors (R, G)
//   UFL: (F, L)   home colors (G, O)
//
// When a piece moves to another corner via a U-layer rotation (no twist),
// facet[0] of the source maps to facet[0] of the destination, facet[1] to
// facet[1]. Edges have a single side facet so colors map directly.
// ---------------------------------------------------------------------------

const CORNER_HOME_COLORS: ReadonlyArray<readonly [StickerColor, StickerColor]> = [
  ['O', 'B'], // UBL: (L=O, B=B)
  ['B', 'R'], // UBR: (B, R)
  ['R', 'G'], // UFR: (R, F=G)
  ['G', 'O'], // UFL: (F=G, L=O)
];

const EDGE_HOME_COLORS: ReadonlyArray<StickerColor> = ['B', 'R', 'G', 'O'];

// Side sticker positions 0..11 (CW from back-left).
//   0,1,2 = Back  (left -> right)
//   3,4,5 = Right (top  -> bottom)
//   6,7,8 = Front (right -> left)
//   9,10,11 = Left  (bottom -> top)
type SideStickerSlot =
  | { kind: 'corner'; cornerIdx: 0 | 1 | 2 | 3; facet: 0 | 1 }
  | { kind: 'edge'; edgeIdx: 0 | 1 | 2 | 3 };

const SIDE_STICKER_MAP: ReadonlyArray<SideStickerSlot> = [
  { kind: 'corner', cornerIdx: 0, facet: 1 }, // 0  UBL.B
  { kind: 'edge', edgeIdx: 0 },               // 1  UB
  { kind: 'corner', cornerIdx: 1, facet: 0 }, // 2  UBR.B
  { kind: 'corner', cornerIdx: 1, facet: 1 }, // 3  UBR.R
  { kind: 'edge', edgeIdx: 1 },               // 4  UR
  { kind: 'corner', cornerIdx: 2, facet: 0 }, // 5  UFR.R
  { kind: 'corner', cornerIdx: 2, facet: 1 }, // 6  UFR.F
  { kind: 'edge', edgeIdx: 2 },               // 7  UF
  { kind: 'corner', cornerIdx: 3, facet: 0 }, // 8  UFL.F
  { kind: 'corner', cornerIdx: 3, facet: 1 }, // 9  UFL.L
  { kind: 'edge', edgeIdx: 3 },               // 10 UL
  { kind: 'corner', cornerIdx: 0, facet: 0 }, // 11 UBL.L
];

// ---------------------------------------------------------------------------
// PLL permutations as cycles in our index convention.
// Cycle [a, b, c] means: piece at a -> b -> c -> a (algorithm direction).
// In the SCRAMBLED state shown in the diagram, position a contains the b-piece
// (because the algorithm will move it from a to b to solve the cube).
// ---------------------------------------------------------------------------

interface PllCycles {
  corners: number[][];
  edges: number[][];
}

const PLL_CYCLES: Record<PllId, PllCycles> = {
  // Corner 3-cycle PLLs (no edge swap)
  Aa: { corners: [[1, 2, 3]], edges: [] },
  Ab: { corners: [[3, 2, 1]], edges: [] },
  E:  { corners: [[0, 2], [1, 3]], edges: [] },
  // Edge-only PLLs
  Ua: { corners: [], edges: [[1, 3, 2]] },
  Ub: { corners: [], edges: [[2, 3, 1]] },
  H:  { corners: [], edges: [[0, 2], [1, 3]] },
  Z:  { corners: [], edges: [[0, 1], [2, 3]] },
  // Adjacent corner swap + edge swap
  Ja: { corners: [[0, 1]], edges: [[0, 3]] },
  Jb: { corners: [[1, 2]], edges: [[1, 2]] },
  T:  { corners: [[1, 2]], edges: [[1, 3]] },
  F:  { corners: [[2, 3]], edges: [[0, 2]] },
  Ra: { corners: [[1, 2, 3]], edges: [[0, 1, 3]] },
  Rb: { corners: [[1, 3, 2]], edges: [[0, 3, 1]] },
  // Diagonal corner swap PLLs
  V:  { corners: [[1, 3]], edges: [[1, 2]] },
  Y:  { corners: [[0, 2]], edges: [[2, 3]] },
  Na: { corners: [[1, 3]], edges: [[0, 2]] },
  Nb: { corners: [[0, 2]], edges: [[1, 3]] },
  // G perms (corner 3-cycle + edge 3-cycle)
  Ga: { corners: [[1, 2, 3]], edges: [[1, 3, 2]] },
  Gb: { corners: [[1, 3, 2]], edges: [[1, 2, 3]] },
  Gc: { corners: [[3, 2, 1]], edges: [[3, 1, 2]] },
  Gd: { corners: [[2, 1, 3]], edges: [[3, 2, 1]] },
};

const NAMES: Record<PllId, string> = {
  Aa: 'Aa Perm',
  Ab: 'Ab Perm',
  E: 'E Perm',
  Ua: 'Ua Perm',
  Ub: 'Ub Perm',
  H: 'H Perm',
  Z: 'Z Perm',
  Ja: 'Ja Perm',
  Jb: 'Jb Perm',
  T: 'T Perm',
  F: 'F Perm',
  Ra: 'Ra Perm',
  Rb: 'Rb Perm',
  V: 'V Perm',
  Y: 'Y Perm',
  Na: 'Na Perm',
  Nb: 'Nb Perm',
  Ga: 'Ga Perm',
  Gb: 'Gb Perm',
  Gc: 'Gc Perm',
  Gd: 'Gd Perm',
};

const CATEGORIES: Record<PllId, PllCategory> = {
  Aa: 'corner', Ab: 'corner', E: 'corner',
  Ua: 'edge', Ub: 'edge', H: 'edge', Z: 'edge',
  Ja: 'adjacent', Jb: 'adjacent', T: 'adjacent', F: 'adjacent',
  Ra: 'adjacent', Rb: 'adjacent', V: 'adjacent', Y: 'adjacent',
  Na: 'diagonal', Nb: 'diagonal',
  Ga: 'g', Gb: 'g', Gc: 'g', Gd: 'g',
};

// Apply a list of disjoint cycles to an identity permutation [0,1,...,n-1].
// Cycle [a,b,c] sets arr[a]=b, arr[b]=c, arr[c]=a.
function applyCycles(n: number, cycles: number[][]): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (const cycle of cycles) {
    const len = cycle.length;
    for (let i = 0; i < len; i++) {
      arr[cycle[i]] = cycle[(i + 1) % len];
    }
  }
  return arr;
}

function computeSideStickers(cycles: PllCycles): StickerColor[] {
  const cornerAt = applyCycles(4, cycles.corners);
  const edgeAt = applyCycles(4, cycles.edges);
  return SIDE_STICKER_MAP.map((slot) => {
    if (slot.kind === 'corner') {
      const pieceIdx = cornerAt[slot.cornerIdx];
      return CORNER_HOME_COLORS[pieceIdx][slot.facet];
    }
    const pieceIdx = edgeAt[slot.edgeIdx];
    return EDGE_HOME_COLORS[pieceIdx];
  });
}

function computeSwaps(cycles: PllCycles): PieceSwap[] {
  const swaps: PieceSwap[] = [];
  const pushCycle = (kind: 'corner' | 'edge', cycle: number[]) => {
    const len = cycle.length;
    for (let i = 0; i < len; i++) {
      swaps.push({
        from: { kind, index: cycle[i] as 0 | 1 | 2 | 3 },
        to: { kind, index: cycle[(i + 1) % len] as 0 | 1 | 2 | 3 },
      });
    }
  };
  for (const c of cycles.corners) pushCycle('corner', c);
  for (const c of cycles.edges) pushCycle('edge', c);
  return swaps;
}

function buildDefinition(id: PllId): PllDefinition {
  const cycles = PLL_CYCLES[id];
  return {
    id,
    name: NAMES[id],
    category: CATEGORIES[id],
    sideStickers: computeSideStickers(cycles),
    swaps: computeSwaps(cycles),
  };
}

export const PLL_DEFINITIONS: Record<PllId, PllDefinition> = PLL_IDS.reduce(
  (acc, id) => {
    acc[id] = buildDefinition(id);
    return acc;
  },
  {} as Record<PllId, PllDefinition>,
);

export const ALL_PLLS: PllDefinition[] = PLL_IDS.map((id) => PLL_DEFINITIONS[id]);

export function getPllDefinition(id: PllId): PllDefinition | undefined {
  return PLL_DEFINITIONS[id];
}
