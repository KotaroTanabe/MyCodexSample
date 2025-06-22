import { describe, it, expect } from 'vitest';
import { generateRandomAgari } from './randomAgari';
import { isWinningHand } from '../score/yaku';

describe('generateRandomAgari', () => {
  it('creates a 14-tile winning hand', () => {
    const { hand, melds } = generateRandomAgari();
    expect(hand).toHaveLength(14);
    expect(melds).toHaveLength(0);
    expect(isWinningHand(hand)).toBe(true);
  });
});
