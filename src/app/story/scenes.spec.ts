import {
  closingZoom,
  MARK,
  OPENING,
  openingFrame,
  openingLayout,
  progressToScroll,
  sceneProgress,
  travellerAt,
  type Box,
} from './scenes';

describe('scenes', () => {
  it('scene progress clamps and inverts', () => {
    expect(sceneProgress(-50, 0, 3000, 1000, true)).toBe(0);
    expect(sceneProgress(5000, 0, 3000, 1000, true)).toBe(1);
    for (const pinned of [true, false]) {
      for (const q of [0, 0.25, 0.9, 1]) {
        const y = progressToScroll(q, 1200, 3000, 900, pinned);
        expect(sceneProgress(y, 1200, 3000, 900, pinned)).toBeCloseTo(q, 6);
      }
    }
  });

  for (const [w, h] of [
    [1440, 900],
    [390, 780],
  ]) {
    describe(`opening at ${w}x${h}`, () => {
      const L = openingLayout(w, h, 420, 140);

      it('lands the drop on the screen centre and starts round', () => {
        const f = openingFrame(0, L);
        expect(f.drop.x).toBeCloseTo(w / 2, 6);
        expect(f.drop.y).toBeCloseTo(h / 2, 6);
        expect(f.drop.radius).toBeCloseTo(f.drop.half, 6);
        expect(f.mask).toBe(0);
      });

      it('reveals the whole name by the end of the ripple', () => {
        expect(openingFrame(OPENING.reveal[1], L).mask).toBeCloseTo(L.diag, 6);
      });

      it('drops the E fully off-screen before the drop arrives', () => {
        const f = openingFrame(OPENING.fall[1], L);
        expect(f.mark.y + f.mark.s * (MARK.eTop + f.e.dy)).toBeGreaterThan(h);
        expect(openingFrame(OPENING.travel[1], L).e.o).toBe(0);
      });

      it('turns the drop into the square, in the slot', () => {
        const f = openingFrame(OPENING.travel[1], L);
        expect(f.drop.x).toBeCloseTo(f.mark.x + MARK.slot[0] * f.mark.s, 6);
        expect(f.drop.y).toBeCloseTo(f.mark.y + MARK.slot[1] * f.mark.s, 6);
        expect(f.drop.half).toBeCloseTo(MARK.slotHalf * f.mark.s, 6);
        expect(f.drop.radius).toBe(0);
      });

      it('never jumps: the drop moves smoothly at every step of the scroll', () => {
        let prev = openingFrame(0, L).drop;
        for (let i = 1; i <= 1000; i++) {
          const d = openingFrame(i / 1000, L).drop;
          expect(Math.hypot(d.x - prev.x, d.y - prev.y)).toBeLessThan(0.02 * L.diag);
          expect(Math.abs(d.half - prev.half)).toBeLessThan(1);
          prev = d;
        }
      });

      it('fits the final composition on screen', () => {
        expect(L.end.x).toBeGreaterThanOrEqual(0);
        expect(L.end.x + MARK.width * L.end.s).toBeLessThanOrEqual(w);
      });
    });
  }

  it('closing zoom pulls back from z0 to 1', () => {
    expect(closingZoom(0, 40).scale).toBeCloseTo(40, 6);
    expect(closingZoom(1, 40).scale).toBe(1);
  });

  describe('traveller', () => {
    const boxes: Box[] = [
      { x: 0, y: 0, w: 10, h: 10, r: 0 },
      { x: 100, y: 200, w: 30, h: 30, r: 15 },
    ];
    const stations = [
      { from: 100, to: 100 },
      { from: 300, to: 400 },
    ];
    const at = (y: number) => travellerAt(y, stations, (i) => boxes[i]);

    it('is absent outside the first and last holds', () => {
      expect(at(99)).toBeNull();
      expect(at(401)).toBeNull();
    });

    it('sits on its anchor during a hold', () => {
      expect(at(100)).toEqual(boxes[0]);
      expect(at(350)).toEqual(boxes[1]);
    });

    it('is halfway between anchors halfway between holds', () => {
      const b = at(200)!;
      expect(b.x).toBeCloseTo(50, 6);
      expect(b.w).toBeCloseTo(20, 6);
      expect(b.r).toBeCloseTo(7.5, 6);
    });
  });
});
