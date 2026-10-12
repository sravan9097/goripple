import { FOLD_AT, openFoldCount } from './brochure';

describe('openFoldCount', () => {
  it('opens the middle panel before the right panel', () => {
    expect(FOLD_AT).toEqual([0.05, 0.45]);
    expect(openFoldCount(0)).toBe(0);
    expect(openFoldCount(0.05)).toBe(1);
    expect(openFoldCount(0.2)).toBe(1);
    expect(openFoldCount(0.45)).toBe(2);
    expect(openFoldCount(1)).toBe(2);
  });
});
