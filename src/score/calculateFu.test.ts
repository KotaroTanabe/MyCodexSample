import { describe, it, expect } from 'vitest';
import { SAMPLE_HANDS } from '../quiz/sampleHands';
import { calculateFu } from './score';

describe('calculateFu', () => {
  it('computes fu for a hand with only sequences', () => {
    const { hand, melds } = SAMPLE_HANDS[0];
    const fu = calculateFu(hand, melds);
    // 基本符20のみなので20符になるはず
    expect(fu).toBe(20);
  });

  it('computes fu for a hand with a dragon pon', () => {
    const { hand, melds } = SAMPLE_HANDS[1];
    const fu = calculateFu(hand, melds);
    // 基本符20 + 明刻(役牌)8 = 28、切り上げで30符になるはず
    expect(fu).toBe(30);
  });

  it('computes fu for a hand with a dragon kan', () => {
    const { hand, melds } = SAMPLE_HANDS[2];
    const fu = calculateFu(hand, melds);
    // 基本符20 + カン(役牌)32 = 52、切り上げで60符になるはず
    expect(fu).toBe(60);
  });
});
