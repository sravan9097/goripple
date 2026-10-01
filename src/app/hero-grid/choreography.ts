/**
 * Intro choreography, traced from brand.dropbox.com.
 *
 * Eight tiles sit in a 4x2 grid that fills the viewport (2x4 on mobile).
 * At progress 0 every tile is scaled up and thrown along its own vector so the
 * viewport is empty except the centre button; as progress reaches 1 the tiles
 * fly back in and settle flush into the grid.
 */

/** Grid order is row-major: [1 2 3 4 / 5 6 7 8]. Corners throw far, inner tiles pinwheel. */
export const DESKTOP_VECTORS: ReadonlyArray<readonly [number, number]> = [
  [4, 2],
  [-0.1, 1],
  [-1, -0.1],
  [-4, 2],
  [4, -2],
  [1, 0.1],
  [0.1, -1],
  [-4, -2],
];

/** Mobile grid is 2x4, so the throws are taller than they are wide. */
export const MOBILE_VECTORS: ReadonlyArray<readonly [number, number]> = [
  [2, 3],
  [-2, 3],
  [0.25, 1.5],
  [-1.5, 0.25],
  [1.5, -0.25],
  [-0.25, -1.5],
  [2, -3],
  [-2, -3],
];

export const INITIAL_SCALE = 2;

/** Centre button edge length at its smallest (also the gridline anchor). */
export const BUTTON_SIZE = 90;
export const BUTTON_SIZE_MOBILE = 64;

export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/**
 * Ease-out: tiles are thrown so far that they only enter the viewport past
 * ~45% of their travel, so the curve is front-loaded to get them on screen
 * within the first third of the scroll, while the box still holds.
 */
export function easeIntro(t: number): number {
  return 1 - (1 - clamp01(t)) ** 2;
}

export const SECOND_BREAKPOINT = 0.75;

/** Eased span of the large → mid settle. Scroll-linked, so it reverses. */
export const MID_SPAN = 0.18;

export type CentreState = 1 | 2 | 3;

/**
 * Centre button state from eased progress.
 * 1 = large box (paper), 2 = mid box (ink + tagline), 3 = small menu button.
 * State 1 holds through the paper→ink settle so callers stay in sync with boxInk.
 */
export function centreState(p: number): CentreState {
  const e = easeIntro(p);
  if (e < MID_SPAN) return 1;
  if (e < SECOND_BREAKPOINT) return 2;
  return 3;
}

/**
 * Eased windows for the end of the collapse, in order: the wordmark moves to
 * the centre of the box, its red square grows to half the box, then the S
 * mark comes in and fills it. Each only starts when the previous has ended.
 * Anchored after SECOND_BREAKPOINT so the mid tagline is not cut short.
 */
const CENTRE_AT = [0.875, 0.925] as const;
const GROW_AT = [0.925, 0.965] as const;
const S_AT = [0.965, 1] as const;

function span(e: number, [from, to]: readonly [number, number]): number {
  return clamp01((e - from) / (to - from));
}

/** How far one vector unit travels, in unscaled pixels. */
export function yeet(baseWindowSize: number, buttonSize: number): number {
  return (baseWindowSize - buttonSize) / 2 / INITIAL_SCALE;
}

/**
 * Corner tiles reach 4 units, which clears the viewport on its own. The inner
 * tiles only reach 1, which would leave them peeking in at the edges, so their
 * reach is stretched to this minimum while keeping the direction intact.
 */
const MIN_REACH = 2.6;

function boosted(vx: number, vy: number): readonly [number, number] {
  const reach = Math.max(Math.abs(vx), Math.abs(vy));
  if (reach === 0 || reach >= MIN_REACH) return [vx, vy];
  const scale = MIN_REACH / reach;
  return [vx * scale, vy * scale];
}

/** Tiles scale from 2 down to 1 as progress runs 0 to 1. */
export function tileScale(p: number): number {
  return INITIAL_SCALE - (INITIAL_SCALE - 1) * easeIntro(p);
}

export interface TileTransform {
  scale: number;
  x: number;
  y: number;
}

/**
 * Per-tile transform. Applied as `scale(s) translate(x, y)`, so x/y are in the
 * tile's own pre-scale space and end up multiplied by the scale on screen.
 */
export function tileTransform(
  index: number,
  p: number,
  isMobile: boolean,
  throwDistance: number,
): TileTransform {
  const e = easeIntro(p);
  const vectors = isMobile ? MOBILE_VECTORS : DESKTOP_VECTORS;
  const [rawX, rawY] = vectors[index] ?? [0, 0];
  const [vx, vy] = boosted(rawX, rawY);
  const fwd = e - 1;
  const bwd = 1 - e;
  return {
    scale: INITIAL_SCALE - (INITIAL_SCALE - 1) * e,
    x: (vx > 0 ? fwd : bwd) * Math.abs(vx * throwDistance),
    y: (vy > 0 ? fwd : bwd) * Math.abs(vy * throwDistance),
  };
}

/**
 * Where a tile's box ends up on screen, given its settled grid cell.
 * `transform: scale(s) translate(x, y)` moves the centre by (x, y) * s.
 */
export function tileScreenBox(
  cell: { x: number; y: number; width: number; height: number },
  t: TileTransform,
): { left: number; top: number; right: number; bottom: number } {
  const cx = cell.x + cell.width / 2 + t.x * t.scale;
  const cy = cell.y + cell.height / 2 + t.y * t.scale;
  const halfW = (cell.width * t.scale) / 2;
  const halfH = (cell.height * t.scale) / 2;
  return { left: cx - halfW, top: cy - halfH, right: cx + halfW, bottom: cy + halfH };
}

/** Centre button edge length in px for the given progress. */
export function centreSize(p: number, viewportMin: number, buttonSize: number): number {
  const e = easeIntro(p);
  const large = Math.min(800, viewportMin - 64);
  const mid = Math.min(560, viewportMin - 64);
  if (e <= 0) return large;
  if (e < MID_SPAN) return large + (mid - large) * (e / MID_SPAN);
  if (e < SECOND_BREAKPOINT) return mid;
  const shrink = (e - SECOND_BREAKPOINT) / (1 - SECOND_BREAKPOINT);
  return mid - shrink * (mid - buttonSize);
}

/** 0 = paper box, 1 = ink box. Tracks the large → mid settle. */
export function boxInk(p: number): number {
  return clamp01(easeIntro(p) / MID_SPAN);
}

export interface EndSequence {
  centre: number;
  grow: number;
  s: number;
}

/** Each step 0 → 1 from scroll, so the whole ending reverses exactly. */
export function endSequence(p: number): EndSequence {
  const e = easeIntro(p);
  return { centre: span(e, CENTRE_AT), grow: span(e, GROW_AT), s: span(e, S_AT) };
}

/**
 * The four centre rules hold while the tiles come in, then leave once the
 * grid has landed. Nothing is drawn on the settled grid.
 */
export function gridlineOpacity(p: number): number {
  const e = easeIntro(p);
  if (e <= 0.9) return 1;
  return clamp01(1 - (e - 0.9) / 0.1);
}

/**
 * Eased window in which each tile's own rules draw out from it. At rest only
 * the centre box's four rules show; the moment the scroll starts, every tile
 * brings its rules in with it, riding its transform as it flies in.
 */
export const TILE_LINES_AT = [0, 0.35] as const;

export function tileLineDraw(p: number): number {
  return span(easeIntro(p), TILE_LINES_AT);
}

/**
 * Desktop only. At rest one edge of each of the four tiles around the centre
 * box sits on a third of it, so with the box's own rules the screen opens on
 * four evenly spaced rules each way (brand.dropbox.com): the left tile's top
 * and the right tile's bottom, the lower tile's left and the upper tile's right.
 * Keyed by tile index; `at` is the fraction across the centre box.
 */
export type Edge = 'top' | 'bottom' | 'left' | 'right';

export const EDGE_ANCHORS: Readonly<Record<number, { edge: Edge; at: number }>> = {
  5: { edge: 'top', at: 1 / 3 },
  2: { edge: 'bottom', at: 2 / 3 },
  6: { edge: 'left', at: 1 / 3 },
  1: { edge: 'right', at: 2 / 3 },
};

/**
 * Pre-scale offset along the edge's axis that puts the tile's anchored edge on
 * `target` at progress 0 and eases it home to 0 with the rest of the fly-in.
 * `cellStart`/`cellLength` are the cell's top/height or left/width.
 */
export function anchoredThrow(
  cellStart: number,
  cellLength: number,
  target: number,
  edge: Edge,
  p: number,
): number {
  const half = (cellLength * INITIAL_SCALE) / 2;
  const leading = edge === 'top' || edge === 'left';
  const d0 = (target + (leading ? half : -half) - cellStart - cellLength / 2) / INITIAL_SCALE;
  return (1 - easeIntro(p)) * d0;
}

/** Tiles only accept clicks once the grid has settled. */
export function tilesInteractive(p: number): boolean {
  return easeIntro(p) > 0.95;
}
