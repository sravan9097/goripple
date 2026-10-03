/**
 * Scroll story maths. Pure functions, no DOM: the component measures, these
 * decide, the component writes. Everything is a function of progress, so every
 * scene plays the same scrolling down as up.
 */
import { clamp01 } from '../hero-grid/choreography';

export { clamp01 };

export function span(p: number, from: number, to: number): number {
  return clamp01((p - from) / (to - from));
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;
export const easeInQuad = (t: number): number => t * t;
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

export type Point = readonly [number, number];

/** Quadratic bezier: the soft arc the drop takes into the missing E's slot. */
export function arcPoint(t: number, p0: Point, p1: Point, p2: Point): [number, number] {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ];
}

/**
 * Pinned scenes run 0 to 1 while their sticky frame holds the viewport.
 * Pass-through scenes run 0 to 1 from entering the bottom edge to leaving the top.
 */
export function sceneProgress(
  scroll: number,
  top: number,
  height: number,
  vh: number,
  pinned: boolean,
): number {
  return pinned
    ? clamp01((scroll - top) / Math.max(1, height - vh))
    : clamp01((scroll - top + vh) / (height + vh));
}

/** Inverse of sceneProgress: the scroll position at which a scene reads `q`. */
export function progressToScroll(
  q: number,
  top: number,
  height: number,
  vh: number,
  pinned: boolean,
): number {
  return pinned ? top + q * Math.max(1, height - vh) : top - vh + q * (height + vh);
}

// ── Opening: the ripple reveals the name, the drop becomes the signature ──

/** Wordmark geometry in its own 488 x 250 units (wordmark.ts), plus the ghost E. */
export const MARK = {
  width: 488,
  impact: [204, 122] as Point,
  slot: [477.5, 179.5] as Point,
  slotHalf: 10.5,
  arcControl: [400, -60] as Point,
  eTop: 54,
};

const DROP_REST = 18;
const DROP_FULL = 40;

export const OPENING = {
  reveal: [0, 0.3],
  loosen: [0.3, 0.36],
  fall: [0.38, 0.46],
  fade: [0.42, 0.46],
  travel: [0.32, 0.48],
  square: [0.38, 0.48],
  land: [0.48, 0.53],
  echo: [0.48, 0.62],
  move: [0.5, 0.7],
  drift: [0.72, 1],
  promise: 0.58,
  handoff: 0.9,
} as const;

export interface Placement {
  x: number;
  y: number;
  s: number;
}

export interface OpeningLayout {
  w: number;
  h: number;
  diag: number;
  start: Placement;
  end: Placement;
  tag: { x: number; y: number };
}

/**
 * Start: the first p's bowl sits on the screen centre, where the drop lands.
 * End: the mark beside (wide) or above (narrow) the two promise lines.
 */
export function openingLayout(w: number, h: number, tagW: number, tagH: number): OpeningLayout {
  const s0 = Math.min((0.44 * w) / 399, (0.4 * h) / 128, 2.2);
  const start = { x: w / 2 - MARK.impact[0] * s0, y: h / 2 - MARK.impact[1] * s0, s: s0 };

  if (w >= 720) {
    const gap = 0.03 * w;
    const s = Math.min(s0 * 0.8, (0.86 * w - tagW - gap) / MARK.width);
    const x = (w - (MARK.width * s + gap + tagW)) / 2;
    const y = h / 2 - 122 * s;
    return { w, h, diag: Math.hypot(w, h), start, end: { x, y, s }, tag: { x: x + MARK.width * s + gap, y } };
  }

  const s = Math.min(s0, (0.84 * w) / MARK.width);
  const y = (h - (250 * s + 24 + tagH)) / 2;
  const x = (w - MARK.width * s) / 2;
  return { w, h, diag: Math.hypot(w, h), start, end: { x, y, s }, tag: { x, y: y + 250 * s + 24 } };
}

export interface OpeningFrame {
  impact: Point;
  mask: number;
  rings: { r: number; o: number }[];
  mark: Placement;
  e: { rot: number; dy: number; o: number };
  drop: { x: number; y: number; half: number; radius: number; sx: number; sy: number };
  echo: { r: number; o: number };
  drift: number;
  promise: boolean;
}

export function openingFrame(p: number, L: OpeningLayout): OpeningFrame {
  const reveal = easeOutCubic(span(p, ...OPENING.reveal));
  const move = easeInOutCubic(span(p, ...OPENING.move));
  const mark = {
    x: lerp(L.start.x, L.end.x, move),
    y: lerp(L.start.y, L.end.y, move),
    s: lerp(L.start.s, L.end.s, move),
  };
  const impact: Point = [
    L.start.x + MARK.impact[0] * L.start.s,
    L.start.y + MARK.impact[1] * L.start.s,
  ];

  // The leading ring is the reveal edge: the mask follows it exactly.
  const rings = [0, 1, 2].map((k) => {
    const t = span(p, k * 0.04, OPENING.reveal[1] + k * 0.04);
    return { r: easeOutCubic(t) * L.diag, o: t > 0 ? 0.5 * (1 - t) : 0 };
  });

  const fall = easeInQuad(span(p, ...OPENING.fall));
  const e = {
    rot: 14 * easeInOutCubic(span(p, ...OPENING.loosen)) + 30 * fall,
    dy: fall * (L.h / L.start.s + 260),
    o: 1 - span(p, ...OPENING.fade),
  };

  // Travel starts after the reveal ends, so the drop's size is continuous.
  const travel = easeInOutCubic(span(p, ...OPENING.travel));
  const [lx, ly] = arcPoint(travel, MARK.impact, MARK.arcControl, MARK.slot);
  const half = lerp(lerp(DROP_REST, DROP_FULL, reveal), MARK.slotHalf, travel);
  const radius = half * (1 - easeInOutCubic(span(p, ...OPENING.square)));
  const land = Math.sin(Math.PI * span(p, ...OPENING.land));
  const drop = {
    x: mark.x + lx * mark.s,
    y: mark.y + ly * mark.s,
    half: half * mark.s,
    radius: radius * mark.s,
    sx: 1 + 0.3 * land,
    sy: 1 - 0.25 * land,
  };

  const echoT = span(p, ...OPENING.echo);
  const echo = {
    r: mark.s * (MARK.slotHalf + 120 * easeOutCubic(echoT)),
    o: echoT > 0 && echoT < 1 ? 0.6 * (1 - echoT) : 0,
  };

  return {
    impact,
    mask: reveal * L.diag,
    rings,
    mark,
    e,
    drop,
    echo,
    drift: -span(p, ...OPENING.drift) * L.h * 0.08,
    promise: p >= OPENING.promise,
  };
}

// ── Closing: the square zooms out into the full wordmark ──

export const CLOSING_ZOOM = [0.02, 0.4] as const;

/** Geometric zoom (z0 ** (1 - t)) so the pull-back feels even at every scale. */
export function closingZoom(p: number, z0: number): { t: number; scale: number } {
  const t = easeInOutCubic(span(p, ...CLOSING_ZOOM));
  return { t, scale: z0 ** (1 - t) };
}

// ── Traveller: one amber object carried from scene to scene ──

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Corner radius in px. */
  r: number;
}

/** Scroll range over which the traveller sits exactly on its anchor. */
export interface Station {
  from: number;
  to: number;
}

/**
 * Where the traveller is at `scroll`, or null outside the first and last holds
 * (the anchors draw themselves then). `box(i)` is only called for the one or
 * two stations in play, so the caller reads at most two rects per frame.
 */
export function travellerAt(
  scroll: number,
  stations: readonly Station[],
  box: (i: number) => Box,
): Box | null {
  const last = stations.length - 1;
  if (last < 0 || scroll < stations[0].from || scroll > stations[last].to) return null;
  for (let i = 0; i <= last; i++) {
    const s = stations[i];
    if (scroll > s.to) continue;
    if (scroll >= s.from) return box(i);
    const t = easeInOutCubic(span(scroll, stations[i - 1].to, s.from));
    const a = box(i - 1);
    const b = box(i);
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      w: lerp(a.w, b.w, t),
      h: lerp(a.h, b.h, t),
      r: lerp(a.r, b.r, t),
    };
  }
  return null;
}
