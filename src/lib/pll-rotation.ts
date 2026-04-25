import type {
  Auf,
  PieceSwap,
  PiecePosition,
  PllDefinition,
  StickerColor,
} from '@/types/pll';

const AUF_STEPS: Record<Auf, number> = {
  U0: 0,
  U: 1,
  U2: 2,
  "U'": 3,
};

export function getAufSteps(auf: Auf): number {
  return AUF_STEPS[auf];
}

// Rotate the 12-element side-sticker array CW by `steps` × 90°.
// Each 90° step shifts stickers by 3 positions (one face's worth).
export function rotateSideStickers(
  stickers: StickerColor[],
  steps: number,
): StickerColor[] {
  const n = stickers.length;
  const shift = ((steps % 4) * 3 + n) % n;
  return stickers.map((_, i) => stickers[(i - shift + n) % n]);
}

// Rotate piece positions CW by `steps` × 90° (corner & edge indices share
// the same CW indexing 0..3 starting from back-left / back).
function rotatePiecePosition(pos: PiecePosition, steps: number): PiecePosition {
  const s = ((steps % 4) + 4) % 4;
  return {
    kind: pos.kind,
    index: ((pos.index + s) % 4) as 0 | 1 | 2 | 3,
  };
}

export function rotateSwaps(swaps: PieceSwap[], steps: number): PieceSwap[] {
  return swaps.map((swap) => ({
    from: rotatePiecePosition(swap.from, steps),
    to: rotatePiecePosition(swap.to, steps),
  }));
}

export interface RotatedPllView {
  sideStickers: StickerColor[];
  swaps: PieceSwap[];
}

export function rotatePllForAuf(
  def: PllDefinition,
  auf: Auf,
): RotatedPllView {
  const steps = getAufSteps(auf);
  return {
    sideStickers: rotateSideStickers(def.sideStickers, steps),
    swaps: rotateSwaps(def.swaps, steps),
  };
}
