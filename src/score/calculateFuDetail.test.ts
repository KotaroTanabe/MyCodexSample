import { describe, it, expect } from 'vitest';
import { SAMPLE_HANDS } from '../quiz/sampleHands';
import { calculateFuDetail } from './calculateFuDetail';

// SAMPLE_HANDS[1] では白ポンがあり、明刻として4符追加される

describe('calculateFuDetail', () => {
  it('includes meld description in fu steps', () => {
    const { hand, melds } = SAMPLE_HANDS[1];
    const detail = calculateFuDetail(hand, melds);
    expect(detail.steps).toContain('明么九刻子 +4 (白白白)');
  });
});
