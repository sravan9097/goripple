import { sampleWordmark } from './north-star';

describe('sampleWordmark', () => {
  const dots = sampleWordmark(8);

  it('covers the five letters and the tip square inside the 488 x 250 viewBox', () => {
    expect(dots.length).toBeGreaterThan(300);
    expect(dots.filter((d) => d.tip).length).toBeGreaterThan(0);
    expect(dots.every((d) => d.x >= 0 && d.x <= 488 && d.y >= 0 && d.y <= 250)).toBeTrue();
  });

  it('leaves the bowl of each p empty', () => {
    // Inner circles of the two p's: centre (204,122) and (352,122), radius 47.
    for (const cx of [204, 352]) {
      expect(dots.some((d) => Math.hypot(d.x - cx, d.y - 122) < 40))
        .withContext(`bowl at ${cx}`)
        .toBeFalse();
    }
  });
});
