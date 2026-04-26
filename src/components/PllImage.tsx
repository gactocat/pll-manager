import { rotatePllForAuf } from '@/lib/pll-rotation';
import { getPllDefinition } from '@/data/pll-definitions';
import type { Auf, PiecePosition, PllId, StickerColor } from '@/types/pll';

interface PllImageProps {
  pllId: PllId;
  auf?: Auf;
  size?: number;
  showArrows?: boolean;
  className?: string;
}

// Sticker colors sampled directly from the speedsolving.com wiki PLL diagrams
// so the rendered cube reads the same way as the reference images. Red/orange
// here are clearly distinct (orange is yellow-leaning, not just dark red).
const STICKER_COLORS: Record<StickerColor | 'Y', string> = {
  Y: '#f0f000',
  R: '#e00000',
  B: '#0000f0',
  G: '#00d000',
  O: '#f0a000',
};

const CELL_SIZE = 18;
const CELL_GAP = 2;
const PADDING = 1;
const CELL_STRIDE = CELL_SIZE + CELL_GAP;
const VIEW_SIZE = PADDING * 2 + CELL_STRIDE * 5 - CELL_GAP; // 1 + 18*5 + 2*4 + 1

const ARROW_CORNER_COLOR = '#0f172a';
const ARROW_EDGE_COLOR = '#475569';

function cellTopLeft(col: number, row: number): { x: number; y: number } {
  return { x: PADDING + col * CELL_STRIDE, y: PADDING + row * CELL_STRIDE };
}

function cellCenter(col: number, row: number): { cx: number; cy: number } {
  const { x, y } = cellTopLeft(col, row);
  return { cx: x + CELL_SIZE / 2, cy: y + CELL_SIZE / 2 };
}

const SIDE_STICKER_CELLS: ReadonlyArray<{ col: number; row: number }> = [
  { col: 1, row: 0 }, // 0 Back-L
  { col: 2, row: 0 }, // 1 Back-M
  { col: 3, row: 0 }, // 2 Back-R
  { col: 4, row: 1 }, // 3 Right-T
  { col: 4, row: 2 }, // 4 Right-M
  { col: 4, row: 3 }, // 5 Right-B
  { col: 3, row: 4 }, // 6 Front-R
  { col: 2, row: 4 }, // 7 Front-M
  { col: 1, row: 4 }, // 8 Front-L
  { col: 0, row: 3 }, // 9 Left-B
  { col: 0, row: 2 }, // 10 Left-M
  { col: 0, row: 1 }, // 11 Left-T
];

const CORNER_CELLS: ReadonlyArray<{ col: number; row: number }> = [
  { col: 1, row: 1 }, // 0 UBL
  { col: 3, row: 1 }, // 1 UBR
  { col: 3, row: 3 }, // 2 UFR
  { col: 1, row: 3 }, // 3 UFL
];

const EDGE_CELLS: ReadonlyArray<{ col: number; row: number }> = [
  { col: 2, row: 1 }, // 0 UB
  { col: 3, row: 2 }, // 1 UR
  { col: 2, row: 3 }, // 2 UF
  { col: 1, row: 2 }, // 3 UL
];

function piecePositionCenter(pos: PiecePosition) {
  const cells = pos.kind === 'corner' ? CORNER_CELLS : EDGE_CELLS;
  const cell = cells[pos.index];
  return cellCenter(cell.col, cell.row);
}

// Shrink an arrow toward both endpoints so it doesn't cover the sticker centers.
function trimSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  margin: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x1, y1, x2, y2 };
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: x1 + ux * margin,
    y1: y1 + uy * margin,
    x2: x2 - ux * margin,
    y2: y2 - uy * margin,
  };
}

export function PllImage({
  pllId,
  auf = 'U0',
  size = 120,
  showArrows = true,
  className,
}: PllImageProps) {
  const def = getPllDefinition(pllId);
  if (!def) return null;
  const { sideStickers, swaps } = rotatePllForAuf(def, auf);

  const cornerArrowId = `arrow-corner-${pllId}-${auf}`;
  const edgeArrowId = `arrow-edge-${pllId}-${auf}`;

  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      width={size}
      height={size}
      className={className}
      aria-label={`${def.name} (${auf})`}
      role="img"
    >
      <defs>
        <marker
          id={cornerArrowId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ARROW_CORNER_COLOR} />
        </marker>
        <marker
          id={edgeArrowId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ARROW_EDGE_COLOR} />
        </marker>
      </defs>

      <rect
        x={0}
        y={0}
        width={VIEW_SIZE}
        height={VIEW_SIZE}
        fill="#18181b"
        rx={2}
      />

      {/* Side stickers around perimeter */}
      {sideStickers.map((color, i) => {
        const cell = SIDE_STICKER_CELLS[i];
        const { x, y } = cellTopLeft(cell.col, cell.row);
        return (
          <rect
            key={`side-${i}`}
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={STICKER_COLORS[color]}
            rx={1.5}
          />
        );
      })}

      {/* U-face stickers (always yellow) */}
      {[0, 1, 2, 3].map((i) => {
        const cell = CORNER_CELLS[i];
        const { x, y } = cellTopLeft(cell.col, cell.row);
        return (
          <rect
            key={`corner-${i}`}
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={STICKER_COLORS.Y}
            rx={1.5}
          />
        );
      })}
      {[0, 1, 2, 3].map((i) => {
        const cell = EDGE_CELLS[i];
        const { x, y } = cellTopLeft(cell.col, cell.row);
        return (
          <rect
            key={`edge-${i}`}
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={STICKER_COLORS.Y}
            rx={1.5}
          />
        );
      })}
      {/* U center sticker */}
      {(() => {
        const { x, y } = cellTopLeft(2, 2);
        return (
          <rect
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={STICKER_COLORS.Y}
            rx={1.5}
          />
        );
      })()}

      {/* Swap arrows */}
      {showArrows &&
        swaps.map((swap, i) => {
          const from = piecePositionCenter(swap.from);
          const to = piecePositionCenter(swap.to);
          const trimmed = trimSegment(from.cx, from.cy, to.cx, to.cy, 5);
          const isCorner = swap.from.kind === 'corner';
          const color = isCorner ? ARROW_CORNER_COLOR : ARROW_EDGE_COLOR;
          const markerEnd = `url(#${isCorner ? cornerArrowId : edgeArrowId})`;
          return (
            <line
              key={`swap-${i}`}
              x1={trimmed.x1}
              y1={trimmed.y1}
              x2={trimmed.x2}
              y2={trimmed.y2}
              stroke={color}
              strokeWidth={1.4}
              markerEnd={markerEnd}
              opacity={0.85}
            />
          );
        })}
    </svg>
  );
}
