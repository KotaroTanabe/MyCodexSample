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

  it('detects Pinfu', () => {
    const hand: Tile[] = [
      t('man',2,'pf1'),t('man',3,'pf2'),t('man',4,'pf3'),
      t('man',3,'pf4'),t('man',4,'pf5'),t('man',5,'pf6'),
      t('pin',6,'pf7'),t('pin',7,'pf8'),t('pin',8,'pf9'),
      t('sou',4,'pf10'),t('sou',5,'pf11'),t('sou',6,'pf12'),
      t('sou',7,'pf13'),t('sou',7,'pf14'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Pinfu')).toBe(true);
  });

  it('detects Chiitoitsu', () => {
    const hand: Tile[] = [
      t('man',1,'m1a'),t('man',1,'m1b'),
      t('man',2,'m2a'),t('man',2,'m2b'),
      t('pin',3,'p3a'),t('pin',3,'p3b'),
      t('pin',4,'p4a'),t('pin',4,'p4b'),
      t('sou',5,'s5a'),t('sou',5,'s5b'),
      t('sou',6,'s6a'),t('sou',6,'s6b'),
      t('dragon',1,'d1a'),t('dragon',1,'d1b'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Chiitoitsu')).toBe(true);
  });

  it('detects Iipeiko', () => {
    const hand: Tile[] = [
      t('man',1,'i1'),t('man',2,'i2'),t('man',3,'i3'),
      t('man',1,'i4'),t('man',2,'i5'),t('man',3,'i6'),
      t('pin',4,'i7'),t('pin',5,'i8'),t('pin',6,'i9'),
      t('pin',4,'i10'),t('pin',5,'i11'),t('pin',6,'i12'),
      t('sou',7,'i13'),t('sou',7,'i14'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Iipeiko')).toBe(true);
  });

  it('detects Kokushi Musou', () => {
    const hand: Tile[] = [
      t('man',1,'m1a'),t('man',9,'m9a'),
      t('pin',1,'p1a'),t('pin',9,'p9a'),
      t('sou',1,'s1a'),t('sou',9,'s9a'),
      t('wind',1,'e'),t('wind',2,'s'),t('wind',3,'w'),t('wind',4,'n'),
      t('dragon',1,'d1a'),t('dragon',2,'d2a'),t('dragon',3,'d3a'),
      t('man',1,'m1b'),
    ];
    expect(isWinningHand(hand)).toBe(true);
    const yaku = detectYaku(hand);
    expect(yaku.some(y => y.name === 'Kokushi Musou')).toBe(true);
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
    expect(fu).toBe(20);
    expect(points).toBe(160);
  });

  it('adds fu for honor triplets', () => {
    const hand: Tile[] = [
      t('dragon',1,'d1a'),t('dragon',1,'d1b'),t('dragon',1,'d1c'),
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ];
    const yaku = detectYaku(hand);
    const { fu } = calculateScore(hand, yaku);
    expect(fu).toBe(30);
  });
});
