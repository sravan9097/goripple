import { sceneProgress } from './scene.directive';

describe('sceneProgress', () => {
  it('pinned: 0 while the frame arrives, 1 once the sticky run is spent', () => {
    expect(sceneProgress(0, 50, 3000, 1000, true)).toBe(0);
    expect(sceneProgress(0, -1000, 3000, 1000, true)).toBeCloseTo(0.5, 6);
    expect(sceneProgress(0, -2000, 3000, 1000, true)).toBe(1);
    expect(sceneProgress(0, -5000, 3000, 1000, true)).toBe(1);
  });

  it('pass-through: 0 at the bottom edge, 1 when fully scrolled past', () => {
    expect(sceneProgress(0, 1000, 600, 1000, false)).toBe(0);
    expect(sceneProgress(0, 200, 600, 1000, false)).toBeCloseTo(0.5, 6);
    expect(sceneProgress(0, -600, 600, 1000, false)).toBe(1);
  });
});
