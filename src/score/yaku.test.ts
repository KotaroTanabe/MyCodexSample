import { describe, expect, it } from 'vitest';
import { Tile } from '../types/mahjong';
import { detectYaku, isTanyao, isWinningHand } from './yaku';
import { calculateScore } from './score';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

describe('Yaku detection', () => {
  it('isTanyao helper works', () => {
    const hand: Tile[] = [
      t('man',2,'a'),t('man',3,'b'),t('man',4,'c'),
      t('pin',2,'d'),t('pin',3,'e'),t('pin',4,'f'),
      t('sou',2,'g'),t('sou',3,'h'),t('sou',4,'i'),
      t('man',6,'j'),t('man',7,'k'),t('man',8,'l'),
      t('pin',5,'m'),t('pin',5,'n'),
    ];
    expect(isTanyao(hand)).toBe(true);
  });
  it('detects Tanyao', () => {
    const hand: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Tanyao')).toBe(true);
  });

  it('does not detect Tanyao when terminals or honors are present', () => {
    const hand: Tile[] = [
      t('man',1,'m1a'),t('man',1,'m1b'),t('man',1,'m1c'),
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',6,'p6a'),t('pin',7,'p7a'),t('pin',8,'p8a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    expect(isTanyao(hand)).toBe(false);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Tanyao')).toBe(false);
  });

  it('detects Yakuhai', () => {
    const hand: Tile[] = [
      t('dragon',1,'d1a'),t('dragon',1,'d1b'),t('dragon',1,'d1c'),
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('man',5,'m5a'),t('man',6,'m6a'),t('man',7,'m7a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',2,'s2b'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Yakuhai')).toBe(true);
  });

  it('does not detect Yakuhai without a dragon triplet', () => {
    const hand: Tile[] = [
      t('man',2,'a1'),t('man',3,'a2'),t('man',4,'a3'),
      t('pin',2,'b1'),t('pin',3,'b2'),t('pin',4,'b3'),
      t('sou',2,'c1'),t('sou',3,'c2'),t('sou',4,'c3'),
      t('man',6,'d1'),t('man',7,'d2'),t('man',8,'d3'),
      t('pin',5,'e1'),t('pin',5,'e2'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Yakuhai')).toBe(false);
  });

  it('detects multiple Yakuhai triplets separately', () => {
    const hand: Tile[] = [
      t('dragon',1,'d1a'),t('dragon',1,'d1b'),t('dragon',1,'d1c'),
      t('dragon',2,'d2a'),t('dragon',2,'d2b'),t('dragon',2,'d2c'),
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',5,'s5a'),t('sou',5,'s5b'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.filter(y => y.name === 'Yakuhai')).toHaveLength(2);
  });
});

describe('Scoring', () => {
  it('calculates points from han and fu', () => {
    const hand: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    const yaku = detectYaku(hand);
    const { han, fu, points } = calculateScore(hand, yaku);
    expect(han).toBe(1);
    expect(fu).toBe(30);
    expect(points).toBe(240);
  });
});
