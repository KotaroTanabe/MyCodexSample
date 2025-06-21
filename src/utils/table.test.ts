import { describe, it, expect } from 'vitest';
import { isLeftOf, filterChiOptions } from './table';

describe('isLeftOf', () => {
  it('returns true when first seat is immediately left of second', () => {
    expect(isLeftOf(1, 0)).toBe(true);
    expect(isLeftOf(2, 1)).toBe(true);
    expect(isLeftOf(3, 2)).toBe(true);
    expect(isLeftOf(0, 3)).toBe(true);
  });

  it('returns false otherwise', () => {
    expect(isLeftOf(0, 0)).toBe(false);
    expect(isLeftOf(2, 0)).toBe(false);
  });
});

describe('filterChiOptions', () => {
  it('removes chi when caller is not left of discarder', () => {
    const opts = ['pon', 'chi', 'kan', 'pass'];
    expect(filterChiOptions(opts, 2, 0)).toEqual(['pon', 'kan', 'pass']);
  });

  it('keeps chi when caller is left of discarder', () => {
    const opts = ['pon', 'chi', 'kan', 'pass'];
    expect(filterChiOptions(opts, 1, 0)).toEqual(opts);
  });
});
