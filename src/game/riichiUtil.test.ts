import { describe, it, expect } from 'vitest';
import { shouldRotateRiichi } from './riichiUtil';

describe('shouldRotateRiichi', () => {
  it('returns true when seat matches pending', () => {
    expect(shouldRotateRiichi(1, 1, [])).toBe(true);
  });
  it('returns true when seat is in indicators', () => {
    expect(shouldRotateRiichi(2, null, [0, 2])).toBe(true);
  });
  it('returns false otherwise', () => {
    expect(shouldRotateRiichi(0, null, [1])).toBe(false);
  });
});
