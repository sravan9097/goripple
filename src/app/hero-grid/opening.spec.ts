import { HANDOFF, heroFrame, MARK, OPENING, openingFrame, openingLayout } from './opening';

describe('opening', () => {
  for (const [w, h] of [
    [1440, 900],
    [390, 780],
  ]) {
    describe(`at ${w}x${h}`, () => {
      const L = openingLayout(w, h);
      const target = { x: 100, y: h - 200, s: 0.4 };

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

      it('hands the mark and its square off to the box corner', () => {
        const f = heroFrame(1, L, target);
        expect(f.box).toBe(1);
        expect(f.mark).toEqual(target);
        expect(f.drop.x).toBeCloseTo(target.x + MARK.slot[0] * target.s, 6);
        expect(f.drop.half).toBeCloseTo(MARK.slotHalf * target.s, 6);
        expect(heroFrame(HANDOFF[0], L, target).box).toBe(0);
      });

      it('never jumps: the drop moves smoothly through the whole scrub', () => {
        let prev = heroFrame(0, L, target).drop;
        for (let i = 1; i <= 1000; i++) {
          const d = heroFrame(i / 1000, L, target).drop;
          expect(Math.hypot(d.x - prev.x, d.y - prev.y)).toBeLessThan(0.02 * L.diag);
          expect(Math.abs(d.half - prev.half)).toBeLessThan(1);
          prev = d;
        }
      });
    });
  }
});
