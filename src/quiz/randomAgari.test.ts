import { describe, it, expect } from 'vitest';
import { generateRandomAgari } from './randomAgari';
import { isWinningHand } from '../score/yaku';

describe('generateRandomAgari', () => {
  it('creates a 14-tile winning hand with a winning tile', () => {
    const { hand, melds, winningTile } = generateRandomAgari();
    expect(hand).toHaveLength(14);
    expect(melds).toHaveLength(0);
    expect(hand.includes(winningTile)).toBe(true);
    expect(isWinningHand(hand, melds)).toBe(true);
  });
});
