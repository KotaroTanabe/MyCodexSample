import { describe, expect, it } from 'vitest';
import { Tile, Meld } from '../types/mahjong';
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
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Tanyao')).toBe(true);
  });

  it('detects Menzen Tsumo', () => {
    const hand: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Menzen Tsumo')).toBe(true);
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
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Yakuhai')).toBe(true);
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
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Chiitoitsu')).toBe(true);
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
    const yaku = detectYaku(hand, [], { isTsumo: true });
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
    const yaku = detectYaku(hand, [], { isTsumo: true });
    const { han, fu, points } = calculateScore(hand, [], yaku, []);
    expect(han).toBe(2);
    expect(fu).toBe(20);
    expect(points).toBe(320);
  });

  it('adds fu for honor triplets', () => {
    const hand: Tile[] = [
      t('dragon',1,'d1a'),t('dragon',1,'d1b'),t('dragon',1,'d1c'),
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    const { fu } = calculateScore(hand, [], yaku, []);
    expect(fu).toBe(30);
  });

  it('scores correctly with an open meld', () => {
    const ponTiles = [
      t('dragon',1,'d1a'),
      t('dragon',1,'d1b'),
      t('dragon',1,'d1c'),
    ];
    const concealed: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ];
    const melds: Meld[] = [{ type: 'pon', tiles: ponTiles }];
    const fullHand = [...concealed, ...ponTiles];
    const yaku = detectYaku(fullHand, melds, { isTsumo: true });
    expect(yaku.some(y => y.name === 'Menzen Tsumo')).toBe(false);
    const { fu } = calculateScore(concealed, melds, yaku, []);
    expect(fu).toBe(30);
  });

  it('adds dora to han calculation', () => {
    const hand: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    const doraIndicator = t('pin',4,'di');
    const { han } = calculateScore(hand, [], yaku, [doraIndicator]);
    expect(han).toBe(4);
  });

  it('adds fu for a kan meld', () => {
    // use 3 tiles for simplicity; scoring treats kan as pon plus bonus
    const kanTiles = [
      t('dragon',1,'k1a'),
      t('dragon',1,'k1b'),
      t('dragon',1,'k1c'),
    ];
    const concealed: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ];
    const melds: Meld[] = [{ type: 'kan', tiles: kanTiles }];
    const fullHand = [...concealed, ...kanTiles];
    const yaku = detectYaku(fullHand, melds, { isTsumo: true });
    const { fu } = calculateScore(concealed, melds, yaku);
    expect(fu).toBe(60);
  });

  it('adds riichi han when declared', () => {
    const hand: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true, isRiichi: true });
    expect(yaku.some(y => y.name === 'Riichi')).toBe(true);
    const { han } = calculateScore(hand, [], yaku, []);
    expect(han).toBe(3);
  });
});
