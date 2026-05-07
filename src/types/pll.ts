export type PllId =
  | 'Aa'
  | 'Ab'
  | 'E'
  | 'Ua'
  | 'Ub'
  | 'H'
  | 'Z'
  | 'Ja'
  | 'Jb'
  | 'T'
  | 'F'
  | 'Ra'
  | 'Rb'
  | 'V'
  | 'Y'
  | 'Na'
  | 'Nb'
  | 'Ga'
  | 'Gb'
  | 'Gc'
  | 'Gd';

export const PLL_IDS: PllId[] = [
  // Permutations of Edges Only
  'H', 'Ua', 'Ub', 'Z',
  // Permutations of Corners Only
  'Aa', 'Ab', 'E',
  // Permutations of Edges and Corners (alphabetical per wiki)
  'F', 'Ga', 'Gb', 'Gc', 'Gd',
  'Ja', 'Jb', 'Na', 'Nb',
  'Ra', 'Rb', 'T', 'V', 'Y',
];

export type Auf = 'U0' | 'U' | 'U2' | "U'";

export const AUFS: Auf[] = ['U0', 'U', 'U2', "U'"];

export type StickerColor = 'R' | 'O' | 'G' | 'B';

export type PllCategory = 'epll' | 'cpll' | 'ec-pll';

// Side stickers around the U layer (12 in total).
// Order: clockwise starting from Back-left.
//   0,1,2  = Back  (left -> right)
//   3,4,5  = Right (top  -> bottom)
//   6,7,8  = Front (right -> left)
//   9,10,11 = Left  (bottom -> top)
// Note: indices 0/2/3/5/6/8/9/11 are corner stickers; 1/4/7/10 are edges.

// Piece position on the U face (top view).
//   Corners: TL=0, TR=1, BR=2, BL=3 (clockwise from top-left)
//   Edges:   T=0,  R=1,  B=2,  L=3
export type PieceKind = 'corner' | 'edge';
export interface PiecePosition {
  kind: PieceKind;
  index: 0 | 1 | 2 | 3;
}

export interface PieceSwap {
  from: PiecePosition;
  to: PiecePosition;
}

export interface PllDefinition {
  id: PllId;
  name: string;
  category: PllCategory;
  sideStickers: StickerColor[]; // length 12
  swaps: PieceSwap[]; // arrows
}

export interface TimeRecord {
  id: string;
  seconds: number;
  recordedAt: string;
}

export interface AlgorithmRecord {
  id: string;
  pllId: PllId;
  auf: Auf;
  algorithm: string;
  times: TimeRecord[];
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
}

// One solve from the Random PLL trainer. Not associated with any algorithm
// string — just a per-PLL time bucket for the recognition-and-speed mode.
export interface RandomSolve {
  id: string;
  pllId: PllId;
  seconds: number;
  recordedAt: string;
}
