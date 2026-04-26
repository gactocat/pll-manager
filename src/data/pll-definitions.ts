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

// Cycles below are derived from speedsolving.com PLL diagrams (the wiki PDF).
// Indexing: corners 0=UBL, 1=UBR, 2=UFR, 3=UFL; edges 0=UB, 1=UR, 2=UF, 3=UL.
// Cycle [a,b,c] = piece at a moves to b after the algorithm
// (so in the scrambled state shown, position a holds the b-piece).
const PLL_CYCLES: Record<PllId, PllCycles> = {
  // Permutations of Edges Only (EPLL)
  H:  { corners: [], edges: [[0, 2], [1, 3]] },                  // (UB UF)(UR UL)
  Ua: { corners: [], edges: [[0, 3, 1]] },                       // (UB UL UR), leaves UF
  Ub: { corners: [], edges: [[0, 1, 3]] },                       // (UB UR UL), leaves UF
  Z:  { corners: [], edges: [[0, 3], [1, 2]] },                  // (UB UL)(UR UF)

  // Permutations of Corners Only (CPLL)
  Aa: { corners: [[1, 2, 3]], edges: [] },                       // (UBR UFR UFL), leaves UBL
  Ab: { corners: [[1, 3, 2]], edges: [] },                       // (UBR UFL UFR), leaves UBL
  E:  { corners: [[0, 1], [2, 3]], edges: [] },                  // (UBL UBR)(UFR UFL) — adjacent pairs per wiki diagram

  // Permutations of Edges and Corners
  F:  { corners: [[0, 1]],         edges: [[1, 3]] },            // (UBL UBR) + (UR UL)
  Ga: { corners: [[0, 2, 3]],      edges: [[0, 3, 2]] },         // (UBL UFR UFL) + (UB UL UF)
  Gb: { corners: [[0, 3, 2]],      edges: [[0, 2, 3]] },         // (UBL UFL UFR) + (UB UF UL)
  Gc: { corners: [[1, 3, 2]],      edges: [[0, 1, 2]] },         // (UBR UFL UFR) + (UB UR UF)
  Gd: { corners: [[1, 2, 3]],      edges: [[0, 2, 1]] },         // (UBR UFR UFL) + (UB UF UR)
  Ja: { corners: [[0, 3]],         edges: [[2, 3]] },            // (UBL UFL) + (UF UL)
  Jb: { corners: [[1, 2]],         edges: [[1, 2]] },            // (UBR UFR) + (UR UF)
  Na: { corners: [[1, 3]],         edges: [[1, 3]] },            // (UBR UFL) + (UR UL)
  Nb: { corners: [[0, 2]],         edges: [[1, 3]] },            // (UBL UFR) + (UR UL)
  Ra: { corners: [[2, 3]],         edges: [[0, 1]] },            // (UFR UFL) + (UB UR)
  Rb: { corners: [[0, 1]],         edges: [[1, 2]] },            // (UBL UBR) + (UR UF)
  T:  { corners: [[1, 2]],         edges: [[1, 3]] },            // (UBR UFR) + (UR UL)
  V:  { corners: [[0, 2]],         edges: [[0, 1]] },            // (UBL UFR) + (UB UR)
  Y:  { corners: [[0, 2]],         edges: [[0, 3]] },            // (UBL UFR) + (UB UL)
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
  H: 'epll', Ua: 'epll', Ub: 'epll', Z: 'epll',
  Aa: 'cpll', Ab: 'cpll', E: 'cpll',
  F: 'ec-pll', Ga: 'ec-pll', Gb: 'ec-pll', Gc: 'ec-pll', Gd: 'ec-pll',
  Ja: 'ec-pll', Jb: 'ec-pll', Na: 'ec-pll', Nb: 'ec-pll',
  Ra: 'ec-pll', Rb: 'ec-pll', T: 'ec-pll', V: 'ec-pll', Y: 'ec-pll',
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
