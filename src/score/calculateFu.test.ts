import { describe, it, expect } from 'vitest';
import { SAMPLE_HANDS } from '../quiz/sampleHands';
import { calculateFu } from './score';
import { Tile } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
  suit,
  rank,
  id,
});

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

  it('adds pair fu for seat wind', () => {
    const hand = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('wind',1,'e1'),t('wind',1,'e2'),
    ];
    const fu = calculateFu(hand, [], { seatWind: 1, roundWind: 2 });
    // 基本符20 + 自風の雀頭2 = 22、切り上げで30符になるはず
    expect(fu).toBe(30);
  });

  it('adds 4 fu when seat and round wind are the same', () => {
    const hand = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('wind',2,'s1'),t('wind',2,'s2'),
    ];
    const fu = calculateFu(hand, [], { seatWind: 2, roundWind: 2 });
    // 基本符20 + ダブ南の雀頭4 = 24、切り上げで30符になるはず
    expect(fu).toBe(30);
  });
});
