import {
  anchoredThrow,
  boxInk,
  BUTTON_SIZE,
  EDGE_ANCHORS,
  centreSize,
  centreState,
  endSequence,
  clamp01,
  easeIntro,
  gridlineOpacity,
  SECOND_BREAKPOINT,
  TILE_LINES_AT,
  tileLineDraw,
  tileScale,
  tileScreenBox,
  tileTransform,
  tilesInteractive,
  yeet,
} from './choreography';

describe('choreography', () => {
  it('easeIntro pins the endpoints and stays monotonic', () => {
    expect(easeIntro(0)).toBe(0);
    expect(easeIntro(1)).toBe(1);
    let prev = -1;
    for (let i = 0; i <= 20; i++) {
      const v = easeIntro(i / 20);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('clamp01 bounds out-of-range progress', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });

  it('centre state crosses 1 -> 2 -> 3', () => {
    expect(centreState(0)).toBe(1);
    expect(centreState(0.02)).toBe(1);
    expect(centreState(0.35)).toBe(2);
    expect(centreState(0.8)).toBe(3);
    expect(centreState(1)).toBe(3);
  });

  it('tagline ink and centre state 1 share the same settle window', () => {
    // Forward and back: paper box (state 1, ink < 1) then ink box (state 2, ink = 1).
    for (let i = 0; i <= 200; i++) {
      const p = i / 200;
      const ink = boxInk(p);
      const state = centreState(p);
      if (state === 1) expect(ink).withContext(`p=${p}`).toBeLessThan(1);
      if (state === 2) expect(ink).withContext(`p=${p}`).toBe(1);
    }
  });

  // The bug this guards: the state flipped on raw progress while the size
  // shrank on eased progress, so the box sat static for tens of vh between.
  it('centre state 3 begins exactly where the box starts shrinking', () => {
    const vmin = 900;
    const mid = Math.min(560, vmin - 64);
    let flipped = -1;
    let held = false;
    for (let i = 1; i <= 1000; i++) {
      const p = i / 1000;
      const size = centreSize(p, vmin, BUTTON_SIZE);
      if (centreState(p) === 3) {
        flipped = p;
        break;
      }
      if (Math.abs(size - mid) < 0.5) held = true;
      else if (held) expect(size).withContext(`left the mid hold at ${p}`).toBeCloseTo(mid, 0);
    }
    expect(held).toBeTrue();
    expect(flipped).toBeGreaterThan(0);
    expect(centreSize(flipped + 0.01, vmin, BUTTON_SIZE)).toBeLessThan(mid);
  });

  // The dot used to become the S as soon as the box started shrinking, on a
  // CSS timer, so a slow scroll or a scroll back lost the wordmark.
  it('the ending runs centre, then grow, then S, and none starts mid-collapse', () => {
    expect(endSequence(0)).toEqual({ centre: 0, grow: 0, s: 0 });
    expect(endSequence(1)).toEqual({ centre: 1, grow: 1, s: 1 });
    const vmin = 900;
    const mid = centreSize(0.2, vmin, BUTTON_SIZE);
    for (let i = 0; i <= 1000; i++) {
      const p = i / 1000;
      const { centre, grow, s } = endSequence(p);
      if (grow > 0) expect(centre).withContext(`p=${p}`).toBe(1);
      if (s > 0) expect(grow).withContext(`p=${p}`).toBe(1);
      if (centreSize(p, vmin, BUTTON_SIZE) > (mid + BUTTON_SIZE) / 2) expect(centre).toBe(0);
    }
  });

  it('centre button shrinks monotonically to the menu size', () => {
    const vmin = 900;
    const large = centreSize(0, vmin, BUTTON_SIZE);
    const mid = centreSize(SECOND_BREAKPOINT / 2, vmin, BUTTON_SIZE);
    const small = centreSize(1, vmin, BUTTON_SIZE);
    expect(large).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(small);
    expect(small).toBeCloseTo(BUTTON_SIZE, 5);
  });

  it('tiles scale 2 -> 1', () => {
    expect(tileScale(0)).toBe(2);
    expect(tileScale(1)).toBe(1);
  });

  it('tiles start thrown off-screen and settle flush', () => {
    const distance = yeet(1200, BUTTON_SIZE);
    for (let i = 0; i < 8; i++) {
      const start = tileTransform(i, 0, false, distance);
      const end = tileTransform(i, 1, false, distance);
      expect(Math.abs(start.x) + Math.abs(start.y)).toBeGreaterThan(0);
      expect(end.x).toBeCloseTo(0, 6);
      expect(end.y).toBeCloseTo(0, 6);
    }
  });

  it('corner tiles are thrown further than inner tiles', () => {
    const distance = yeet(1200, BUTTON_SIZE);
    const corner = tileTransform(0, 0, false, distance);
    const inner = tileTransform(1, 0, false, distance);
    const reach = (t: { x: number; y: number }) => Math.hypot(t.x, t.y);
    expect(reach(corner)).toBeGreaterThan(reach(inner));
  });

  /**
   * Desktop tiles pinwheel around a centre cell: columns 1fr 1.45fr [button]
   * 1.45fr 1fr, rows 1fr [button] 1fr, with grid-areas as in hero-grid.scss.
   * Mobile is a plain 2x4.
   */
  function cellFor(i: number, vw: number, vh: number, isMobile: boolean) {
    if (isMobile) {
      const w = vw / 2, h = vh / 4;
      return { x: (i % 2) * w, y: Math.floor(i / 2) * h, width: w, height: h };
    }
    const b = BUTTON_SIZE;
    const unit = (vw - b) / (2 * (1 + 1.45));
    const colX = [0, unit, unit * 2.45, unit * 2.45 + b, unit * 3.9 + b, vw];
    const rowH = (vh - b) / 2;
    const rowY = [0, rowH, rowH + b, vh];
    // [rowStart, colStart, rowEnd, colEnd], 1-based like grid-area
    const areas = [
      [1, 1, 3, 2], [1, 2, 2, 4], [1, 4, 3, 5], [1, 5, 2, 6],
      [3, 1, 4, 2], [2, 2, 4, 3], [3, 3, 4, 5], [2, 5, 4, 6],
    ];
    const [r1, c1, r2, c2] = areas[i];
    return {
      x: colX[c1 - 1], y: rowY[r1 - 1],
      width: colX[c2 - 1] - colX[c1 - 1], height: rowY[r2 - 1] - rowY[r1 - 1],
    };
  }

  // The bug this guards: inner tiles used to peek in at the viewport edge at p = 0.
  it('every tile fully clears the viewport at rest', () => {
    for (const [vw, vh] of [
      [1440, 900],
      [1920, 1080],
      [1280, 1024],
      [430, 932],
    ] as const) {
      const isMobile = vw <= 991;
      const distance = yeet(Math.max(vw, vh), isMobile ? 64 : BUTTON_SIZE);

      for (let i = 0; i < 8; i++) {
        const cell = cellFor(i, vw, vh, isMobile);
        const box = tileScreenBox(cell, tileTransform(i, 0, isMobile, distance));
        const offScreen =
          box.right <= 0 || box.left >= vw || box.bottom <= 0 || box.top >= vh;
        expect(offScreen)
          .withContext(`tile ${i} at ${vw}x${vh} => ${JSON.stringify(box)}`)
          .toBeTrue();
      }
    }
  });

  // Dropbox holds the mid box while the tiles visibly close in; the box only
  // collapses over the last stretch. So tiles must be on screen before state 3.
  it('tiles are on screen while the box still holds at mid size', () => {
    const [vw, vh] = [1440, 900];
    const distance = yeet(vw, BUTTON_SIZE);
    let p = 0;
    while (centreState(p + 0.001) !== 3) p += 0.001;
    const onScreen = [...Array(8).keys()].some((i) => {
      const box = tileScreenBox(cellFor(i, vw, vh, false), tileTransform(i, p, false, distance));
      return box.right > 0 && box.left < vw && box.bottom > 0 && box.top < vh;
    });
    expect(onScreen).withContext(`at p=${p.toFixed(3)}`).toBeTrue();
  });

  it('gridlines hold while the tiles arrive and are gone once the grid has landed', () => {
    expect(gridlineOpacity(0)).toBeCloseTo(1, 6);
    expect(gridlineOpacity(0.5)).toBeCloseTo(1, 6);
    expect(gridlineOpacity(1)).toBeCloseTo(0, 6);
  });

  it('only the centre rules show at rest; tile rules are fully drawn before the tiles land', () => {
    expect(tileLineDraw(0)).toBe(0);
    expect(tileLineDraw(0.2)).toBeGreaterThan(0);
    const landed = 1 - Math.sqrt(1 - TILE_LINES_AT[1]);
    expect(tileLineDraw(landed)).toBeCloseTo(1, 6);
    expect(TILE_LINES_AT[1]).toBeLessThan(SECOND_BREAKPOINT);
  });

  it('anchored tile edges open on the centre box thirds and land home', () => {
    const [vw, vh] = [1440, 900];
    const size = centreSize(0, Math.min(vw, vh), BUTTON_SIZE);
    for (const [key, { edge, at }] of Object.entries(EDGE_ANCHORS)) {
      const i = Number(key);
      const cell = cellFor(i, vw, vh, false);
      const vertical = edge === 'left' || edge === 'right';
      const [start, length] = vertical ? [cell.x, cell.width] : [cell.y, cell.height];
      const target = ((vertical ? vw : vh) - size) / 2 + size * at;
      const d = anchoredThrow(start, length, target, edge, 0);
      const t = tileTransform(i, 0, false, 1);
      const box = tileScreenBox(cell, vertical ? { ...t, x: d } : { ...t, y: d });
      expect(box[edge]).withContext(edge).toBeCloseTo(target, 6);
      expect(anchoredThrow(start, length, target, edge, 1)).toBeCloseTo(0, 6);
    }
  });

  it('tiles only become interactive once settled', () => {
    expect(tilesInteractive(0)).toBeFalse();
    expect(tilesInteractive(0.5)).toBeFalse();
    expect(tilesInteractive(1)).toBeTrue();
  });
});
