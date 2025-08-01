import { describe, it, expect } from 'vitest';
import { SAMPLE_HANDS } from './sampleHands';
import { calculateFu } from '../score/score';

describe('SAMPLE_HANDS', () => {
  it('calculates expected fu and includes winning tile', () => {
    const expected = [20, 30, 40];
    SAMPLE_HANDS.forEach((hand, i) => {
      const fu = calculateFu(hand.hand, hand.melds);
      // 基本符20のみ、役牌ポンやカンで加算した値になるはず
      expect(fu).toBe(expected[i]);
      expect(hand.hand.some(t => t.id === hand.winningTile.id)).toBe(true);
    });
  });
});
