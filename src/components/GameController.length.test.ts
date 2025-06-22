import { describe, it, expect } from 'vitest';
import { maxKyokuForLength } from './GameController';

describe('maxKyokuForLength', () => {
  it('handles tonnan', () => {
    expect(maxKyokuForLength('tonnan')).toBe(8);
  });
  it('handles tonpu', () => {
    expect(maxKyokuForLength('tonpu')).toBe(4);
  });
  it('handles east1', () => {
    expect(maxKyokuForLength('east1')).toBe(1);
  });
});
