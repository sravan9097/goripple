/**
 * Opening maths, shared with the scroll story (v1: story/scenes.ts). Pure
 * functions, no DOM: the component measures, these decide, the component
 * writes. Everything is a function of progress, so the opening plays the same
 * scrolling down as up.
 */
import { clamp01 } from './choreography';

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
} as const;

/** Once the square has landed, the whole composition eases into the centre box. */
export const HANDOFF = [0.53, 1] as const;

/**
 * The reveal plays once. After it lands, scrolling back through the tagline
 * frames stays on the landed frame instead of running the drop and ripple again.
 */
export function landedReveal(q: number, landed: boolean): { q: number; landed: boolean } {
  const done = landed || q >= 1;
  return { q: done ? 1 : q, landed: done };
}

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
}

/**
 * Start: the first p's bowl sits on the screen centre, where the drop lands.
 * End: where the story would settle the mark; the hero hands off before it matters.
 */
export function openingLayout(w: number, h: number): OpeningLayout {
  const s0 = Math.min((0.44 * w) / 399, (0.4 * h) / 128, 2.2);
  const start = { x: w / 2 - MARK.impact[0] * s0, y: h / 2 - MARK.impact[1] * s0, s: s0 };
  const s = Math.min(s0 * 0.8, (0.86 * w) / MARK.width);
  const end = { x: (w - MARK.width * s) / 2, y: h / 2 - 122 * s, s };
  return { w, h, diag: Math.hypot(w, h), start, end };
}

export interface OpeningFrame {
  impact: Point;
  mask: number;
  rings: { r: number; o: number }[];
  mark: Placement;
  e: { rot: number; dy: number; o: number };
  drop: { x: number; y: number; half: number; radius: number; sx: number; sy: number };
  echo: { r: number; o: number };
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

  return { impact, mask: reveal * L.diag, rings, mark, e, drop, echo };
}

export interface HeroFrame extends OpeningFrame {
  /** 0 = full-screen navy, 1 = the navy is the centre box and the mark sits in its corner. */
  box: number;
}

/**
 * The story's opening up to the landed square, then the hand-off: the mark
 * eases to `target` (the box's settled corner mark) with the square riding in
 * its slot, while the caller shrinks the navy to the box by `box`.
 */
export function heroFrame(q: number, L: OpeningLayout, target: Placement): HeroFrame {
  const t = easeInOutCubic(span(q, ...HANDOFF));
  const f = openingFrame(Math.min(q, HANDOFF[0]), L);
  if (t === 0) return { ...f, box: 0 };
  const mark = {
    x: lerp(f.mark.x, target.x, t),
    y: lerp(f.mark.y, target.y, t),
    s: lerp(f.mark.s, target.s, t),
  };
  return {
    ...f,
    mark,
    drop: {
      ...f.drop,
      x: mark.x + MARK.slot[0] * mark.s,
      y: mark.y + MARK.slot[1] * mark.s,
      half: MARK.slotHalf * mark.s,
      radius: 0,
    },
    echo: openingFrame(q, L).echo,
    box: t,
  };
}
