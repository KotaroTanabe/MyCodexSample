import { describe, expect, it } from 'vitest';
import { Tile, Meld } from '../types/mahjong';
import { detectYaku, isTanyao, isWinningHand, ScoreYaku } from './yaku';
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
    expect(isWinningHand(hand, [])).toBe(true);
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
    expect(isWinningHand(hand, [])).toBe(true);
    const yaku = detectYaku(hand, [], { isTsumo: true });
    const yh = yaku.find(y => y.name === 'Yakuhai');
    expect(yh?.detail).toBe('白');
  });

  it('detects Yakuhai for seat wind', () => {
    const hand: Tile[] = [
      t('wind',1,'e1'),t('wind',1,'e2'),t('wind',1,'e3'),
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('man',5,'m5a'),t('man',6,'m6a'),t('man',7,'m7a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',2,'s2b'),
    ];
    expect(isWinningHand(hand, [])).toBe(true);
    const yaku = detectYaku(hand, [], { isTsumo: true, seatWind: 1, roundWind: 2 });
    const yh = yaku.find(y => y.name === 'Yakuhai');
    expect(yh?.detail).toBe('自風 東');
  });

  it('counts Yakuhai twice for a double wind triplet', () => {
    const hand: Tile[] = [
      t('wind',1,'de1'),t('wind',1,'de2'),t('wind',1,'de3'),
      t('man',2,'dm2a'),t('man',3,'dm3a'),t('man',4,'dm4a'),
      t('man',5,'dm5a'),t('man',6,'dm6a'),t('man',7,'dm7a'),
      t('pin',2,'dp2a'),t('pin',3,'dp3a'),t('pin',4,'dp4a'),
      t('sou',2,'ds2a'),t('sou',2,'ds2b'),
    ];
    expect(isWinningHand(hand, [])).toBe(true);
    const yaku = detectYaku(hand, [], { isTsumo: true, seatWind: 1, roundWind: 1 });
    const details = yaku.filter(y => y.name === 'Yakuhai').map(y => y.detail);
    expect(details).toEqual(['自風 東', '場風 東']); // ダブ東の刻子は2翻になるはず
  });

  it('detects Yakuhai from an open meld', () => {
    const ponTiles = [t('dragon', 1, 'od1a'), t('dragon', 1, 'od1b'), t('dragon', 1, 'od1c')];
    const concealed: Tile[] = [
      t('man', 2, 'o1'), t('man', 3, 'o2'), t('man', 4, 'o3'),
      t('pin', 2, 'o4'), t('pin', 3, 'o5'), t('pin', 4, 'o6'),
      t('sou', 2, 'o7'), t('sou', 3, 'o8'), t('sou', 4, 'o9'),
      t('man', 5, 'o10'), t('man', 5, 'o11'),
    ];
    const melds: Meld[] = [{ type: 'pon', tiles: ponTiles, fromPlayer: 1, calledTileId: 'od1a' }];
    const yaku = detectYaku(concealed, melds, { isTsumo: true });
    const yh = yaku.find(y => y.name === 'Yakuhai');
    expect(yh?.detail).toBe('白');
  });

  it('detects open Ittsu as 1 han', () => {
    const chiTiles = [t('man', 1, 'i1'), t('man', 2, 'i2'), t('man', 3, 'i3')];
    const concealed: Tile[] = [
      t('man', 4, 'i4'), t('man', 5, 'i5'), t('man', 6, 'i6'),
      t('man', 7, 'i7'), t('man', 8, 'i8'), t('man', 9, 'i9'),
      t('pin', 2, 'ip1'), t('pin', 2, 'ip2'), t('pin', 2, 'ip3'),
      t('pin', 5, 'ip4'), t('pin', 5, 'ip5'),
    ];
    const melds: Meld[] = [{ type: 'chi', tiles: chiTiles, fromPlayer: 2, calledTileId: 'i1' }];
    const yaku = detectYaku(concealed, melds, { isTsumo: true });
    const ittsu = yaku.find(y => y.name === 'Ittsu');
    expect(ittsu?.han).toBe(1);
  });

  it('detects Pinfu', () => {
    const hand: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Pinfu')).toBe(true);
  });

  it('does not count Pinfu on tanki wait', () => {
    // 456678m 1234p 567s +4p tanki
    const hand: Tile[] = [
      t('man',4,'m4'),t('man',5,'m5'),t('man',6,'m6a'),
      t('man',6,'m6b'),t('man',7,'m7'),t('man',8,'m8'),
      t('pin',1,'p1'),t('pin',2,'p2'),t('pin',3,'p3'),
      t('pin',4,'p4a'),t('pin',4,'p4b'),
      t('sou',5,'s5'),t('sou',6,'s6'),t('sou',7,'s7'),
    ];
    const yaku = detectYaku(hand, [], { winTile: hand[10] });
    expect(yaku.some(y => y.name === 'Pinfu')).toBe(false);
  });

  it('detects Iipeiko', () => {
    const hand: Tile[] = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('man',2,'m2b'),t('man',3,'m3b'),t('man',4,'m4b'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',6,'s6a'),t('sou',7,'s7a'),t('sou',8,'s8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Iipeiko')).toBe(true);
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
    expect(isWinningHand(hand, [])).toBe(true);
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Chiitoitsu')).toBe(true);
  });

  it('scores Chiitoitsu as 25 fu', () => {
    const hand: Tile[] = [
      t('man',1,'m1a'),t('man',1,'m1b'),
      t('man',2,'m2a'),t('man',2,'m2b'),
      t('pin',3,'p3a'),t('pin',3,'p3b'),
      t('pin',4,'p4a'),t('pin',4,'p4b'),
      t('sou',5,'s5a'),t('sou',5,'s5b'),
      t('sou',6,'s6a'),t('sou',6,'s6b'),
      t('dragon',1,'d1a'),t('dragon',1,'d1b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    const { fu } = calculateScore(hand, [], yaku, []);
    // 七対子は常に25符になるはず
    expect(fu).toBe(25);
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
    expect(isWinningHand(hand, [])).toBe(true);
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Kokushi Musou')).toBe(true);
  });

  it('detects Toitoi', () => {
    const hand: Tile[] = [
      t('man',2,'a1'),t('man',2,'a2'),t('man',2,'a3'),
      t('pin',3,'b1'),t('pin',3,'b2'),t('pin',3,'b3'),
      t('sou',4,'c1'),t('sou',4,'c2'),t('sou',4,'c3'),
      t('dragon',1,'d1'),t('dragon',1,'d2'),t('dragon',1,'d3'),
      t('wind',1,'e1'),t('wind',1,'e2'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Toitoi')).toBe(true);
  });

  it('detects Sanankou', () => {
    const hand: Tile[] = [
      t('man',2,'sa1'),t('man',2,'sa2'),t('man',2,'sa3'),
      t('pin',5,'sb1'),t('pin',5,'sb2'),t('pin',5,'sb3'),
      t('sou',7,'sc1'),t('sou',7,'sc2'),t('sou',7,'sc3'),
      t('man',3,'sx1'),t('man',4,'sx2'),t('man',5,'sx3'),
      t('wind',1,'sp1'),t('wind',1,'sp2'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Sanankou')).toBe(true);
  });

  it('detects Sanshoku Doujun', () => {
    const hand: Tile[] = [
      t('man',1,'sdm1'),t('man',2,'sdm2'),t('man',3,'sdm3'),
      t('pin',1,'sdp1'),t('pin',2,'sdp2'),t('pin',3,'sdp3'),
      t('sou',1,'sds1'),t('sou',2,'sds2'),t('sou',3,'sds3'),
      t('man',9,'sd9a'),t('man',9,'sd9b'),t('man',9,'sd9c'),
      t('dragon',1,'sdpa'),t('dragon',1,'sdpb'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Sanshoku Doujun')).toBe(true);
  });

  it('detects San Doukou', () => {
    const hand: Tile[] = [
      t('man',5,'sd1'),t('man',5,'sd2'),t('man',5,'sd3'),
      t('pin',5,'sd4'),t('pin',5,'sd5'),t('pin',5,'sd6'),
      t('sou',5,'sd7'),t('sou',5,'sd8'),t('sou',5,'sd9'),
      t('man',2,'sda'),t('man',3,'sdb'),t('man',4,'sdc'),
      t('dragon',2,'sdd'),t('dragon',2,'sde'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'San Doukou')).toBe(true);
  });

  it('detects Ittsu', () => {
    const hand: Tile[] = [
      t('man',1,'i1'),t('man',2,'i2'),t('man',3,'i3'),
      t('man',4,'i4'),t('man',5,'i5'),t('man',6,'i6'),
      t('man',7,'i7'),t('man',8,'i8'),t('man',9,'i9'),
      t('dragon',1,'id1'),t('dragon',1,'id2'),t('dragon',1,'id3'),
      t('pin',2,'ip1'),t('pin',2,'ip2'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Ittsu')).toBe(true);
  });

  it('detects Chanta', () => {
    const hand: Tile[] = [
      t('man',1,'c1'),t('man',2,'c2'),t('man',3,'c3'),
      t('pin',7,'c4'),t('pin',8,'c5'),t('pin',9,'c6'),
      t('sou',1,'c7'),t('sou',1,'c8'),t('sou',1,'c9'),
      t('wind',1,'c10'),t('wind',1,'c11'),t('wind',1,'c12'),
      t('dragon',1,'c13'),t('dragon',1,'c14'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Chanta')).toBe(true);
  });

  it('detects Honitsu', () => {
    const hand: Tile[] = [
      t('man',2,'h1'),t('man',3,'h2'),t('man',4,'h3'),
      t('man',5,'h4'),t('man',6,'h5'),t('man',7,'h6'),
      t('man',1,'h7'),t('man',1,'h8'),t('man',1,'h9'),
      t('dragon',2,'h10'),t('dragon',2,'h11'),t('dragon',2,'h12'),
      t('man',9,'h13'),t('man',9,'h14'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Honitsu')).toBe(true);
  });

  it('detects Chinitsu', () => {
    const hand: Tile[] = [
      t('pin',1,'n1'),t('pin',2,'n2'),t('pin',3,'n3'),
      t('pin',4,'n4'),t('pin',5,'n5'),t('pin',6,'n6'),
      t('pin',7,'n7'),t('pin',8,'n8'),t('pin',9,'n9'),
      t('pin',2,'n10'),t('pin',2,'n11'),t('pin',2,'n12'),
      t('pin',5,'n13'),t('pin',5,'n14'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Chinitsu')).toBe(true);
  });

  it('detects Ippatsu', () => {
    const hand: Tile[] = [
      t('man',2,'i2a'),t('man',3,'i3a'),t('man',4,'i4a'),
      t('pin',2,'i2b'),t('pin',3,'i3b'),t('pin',4,'i4b'),
      t('sou',2,'i2c'),t('sou',3,'i3c'),t('sou',4,'i4c'),
      t('man',6,'i6a'),t('man',7,'i7a'),t('man',8,'i8a'),
      t('pin',5,'i5a'),t('pin',5,'i5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true, isRiichi: true, ippatsu: true });
    expect(yaku.some(y => y.name === 'Ippatsu')).toBe(true);
  });

  it('detects Double Riichi', () => {
    const hand: Tile[] = [
      t('man',2,'dr2a'),t('man',3,'dr3a'),t('man',4,'dr4a'),
      t('pin',2,'dr2b'),t('pin',3,'dr3b'),t('pin',4,'dr4b'),
      t('sou',2,'dr2c'),t('sou',3,'dr3c'),t('sou',4,'dr4c'),
      t('man',6,'dr6a'),t('man',7,'dr7a'),t('man',8,'dr8a'),
      t('pin',5,'dr5a'),t('pin',5,'dr5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true, isRiichi: true, doubleRiichi: true });
    expect(yaku.some(y => y.name === 'Double Riichi')).toBe(true);
  });

  it('detects Rinshan Kaihou', () => {
    const hand: Tile[] = [
      t('man',2,'r2a'),t('man',3,'r3a'),t('man',4,'r4a'),
      t('pin',2,'r2b'),t('pin',3,'r3b'),t('pin',4,'r4b'),
      t('sou',2,'r2c'),t('sou',3,'r3c'),t('sou',4,'r4c'),
      t('man',6,'r6a'),t('man',7,'r7a'),t('man',8,'r8a'),
      t('pin',5,'r5a'),t('pin',5,'r5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true, rinshan: true });
    expect(yaku.some(y => y.name === 'Rinshan Kaihou')).toBe(true);
  });

  it('detects Chankan', () => {
    const hand: Tile[] = [
      t('man',2,'c2a'),t('man',3,'c3a'),t('man',4,'c4a'),
      t('pin',2,'c2b'),t('pin',3,'c3b'),t('pin',4,'c4b'),
      t('sou',2,'c2c'),t('sou',3,'c3c'),t('sou',4,'c4c'),
      t('man',6,'c6a'),t('man',7,'c7a'),t('man',8,'c8a'),
      t('pin',5,'c5a'),t('pin',5,'c5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: false, chankan: true });
    expect(yaku.some(y => y.name === 'Chankan')).toBe(true);
  });

  it('detects Haitei and Houtei', () => {
    const hand: Tile[] = [
      t('man',2,'h2a'),t('man',3,'h3a'),t('man',4,'h4a'),
      t('pin',2,'h2b'),t('pin',3,'h3b'),t('pin',4,'h4b'),
      t('sou',2,'h2c'),t('sou',3,'h3c'),t('sou',4,'h4c'),
      t('man',6,'h6a'),t('man',7,'h7a'),t('man',8,'h8a'),
      t('pin',5,'h5a'),t('pin',5,'h5b'),
    ];
    const tsumoYaku = detectYaku(hand, [], { isTsumo: true, haitei: true });
    expect(tsumoYaku.some(y => y.name === 'Haitei')).toBe(true);
    const ronYaku = detectYaku(hand, [], { isTsumo: false, houtei: true });
    expect(ronYaku.some(y => y.name === 'Houtei')).toBe(true);
  });

  it('detects Ura Dora', () => {
    const hand: Tile[] = [
      t('man',2,'u2a'),t('man',3,'u3a'),t('man',4,'u4a'),
      t('pin',2,'u2b'),t('pin',3,'u3b'),t('pin',4,'u4b'),
      t('sou',2,'u2c'),t('sou',3,'u3c'),t('sou',4,'u4c'),
      t('man',6,'u6a'),t('man',7,'u7a'),t('man',8,'u8a'),
      t('pin',5,'u5a'),t('pin',5,'u5b'),
    ];
    const ura = [t('pin',4,'di')];
    const yaku = detectYaku(hand, [], { isTsumo: true, isRiichi: true, uraDoraIndicators: ura });
    const count = yaku.filter(y => y.name === 'Ura Dora').length;
    expect(count).toBe(2);
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
    // 20符5翻は満貫扱いなので、子ロンなら 2000 * 4 = 8000 点になるはず
    expect(han).toBe(5);
    expect(fu).toBe(20);
    expect(points).toBe(8000);
  });

  it('calculates dealer tsumo for haneman', () => {
    const hand: Tile[] = [
      t('man',2,'d1'),t('man',3,'d2'),t('man',4,'d3'),
      t('pin',2,'d4'),t('pin',3,'d5'),t('pin',4,'d6'),
      t('sou',2,'d7'),t('sou',3,'d8'),t('sou',4,'d9'),
      t('man',6,'d10'),t('man',7,'d11'),t('man',8,'d12'),
      t('pin',5,'d13'),t('pin',5,'d14'),
    ];
    const yaku: ScoreYaku[] = [{ name: 'Test', han: 6 }];
    const { han, fu, points } = calculateScore(hand, [], yaku, [], {
      seatWind: 1,
      roundWind: 1,
      winType: 'tsumo',
    });
    // 20符はツモなので22符、切り上げで30符。6翻は跳満で基本点3000、
    // 親ツモは2倍支払いの6000オールになるはず
    expect(han).toBe(6);
    expect(fu).toBe(30);
    expect(points).toBe(6000);
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
    const melds: Meld[] = [
      { type: 'pon', tiles: ponTiles, fromPlayer: 1, calledTileId: 'd1a' },
    ];
    const yaku = detectYaku(concealed, melds, { isTsumo: true });
    expect(yaku.some(y => y.name === 'Menzen Tsumo')).toBe(false);
    const { fu } = calculateScore(concealed, melds, yaku, []);
    // 基本符20 + 明刻(役牌)8 = 28、切り上げで30符になるはず
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
  expect(han).toBe(7);
});

 it('includes dora in ron score', () => {
   const hand: Tile[] = [
     t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
     t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
     t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
     t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
     t('pin',5,'p5a'),t('pin',5,'p5b'),
   ];
   const yaku = detectYaku(hand, [], { isTsumo: true });
   const doraIndicator = t('pin',4,'di');
   const { points } = calculateScore(hand, [], yaku, [doraIndicator]);
   // ドラ表示牌4ピンは5ピンがドラになる。5ピンを2枚持っているのでドラ2、
   // 素点5翻にドラ2で7翻、20符は跳満扱いで基本点3000、
   // 子ロンなら4倍して12000点になるはず
   expect(points).toBe(12000);
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
    const melds: Meld[] = [
      { type: 'kan', tiles: kanTiles, fromPlayer: 2, calledTileId: 'k1a', kanType: 'daiminkan' },
    ];
    const yaku = detectYaku(concealed, melds, { isTsumo: true });
    const { fu } = calculateScore(concealed, melds, yaku);
    // 基本符20 + 明カン(役牌)16 = 36、切り上げで40符になるはず
    expect(fu).toBe(40);
  });

  it('detects Junchan', () => {
    const hand: Tile[] = [
      t('man',1,'j1'),t('man',2,'j2'),t('man',3,'j3'),
      t('man',7,'j4'),t('man',8,'j5'),t('man',9,'j6'),
      t('pin',1,'j7'),t('pin',1,'j8'),t('pin',1,'j9'),
      t('sou',9,'j10'),t('sou',9,'j11'),t('sou',9,'j12'),
      t('sou',1,'j13'),t('sou',1,'j14'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Junchan')).toBe(true);
  });

  it('detects San Kantsu', () => {
    const concealed: Tile[] = [
      t('man',1,'sk1'),t('man',1,'sk2'),t('man',1,'sk3'),
      t('sou',1,'skp1'),t('sou',1,'skp2'),
    ];
    const melds: Meld[] = [
      { type: 'kan', tiles: [t('dragon',1,'kd1'),t('dragon',1,'kd2'),t('dragon',1,'kd3')], fromPlayer: 0, calledTileId: 'kd1', kanType: 'daiminkan' },
      { type: 'kan', tiles: [t('dragon',2,'kd4'),t('dragon',2,'kd5'),t('dragon',2,'kd6')], fromPlayer: 0, calledTileId: 'kd4', kanType: 'daiminkan' },
      { type: 'kan', tiles: [t('dragon',3,'kd7'),t('dragon',3,'kd8'),t('dragon',3,'kd9')], fromPlayer: 0, calledTileId: 'kd7', kanType: 'daiminkan' },
    ];
    const yaku = detectYaku(concealed, melds, { isTsumo: true });
    expect(yaku.some(y => y.name === 'San Kantsu')).toBe(true);
  });

  it('detects Su Kantsu', () => {
    const concealed: Tile[] = [t('sou',1,'sks1'),t('sou',1,'sks2')];
    const melds: Meld[] = [
      { type: 'kan', tiles: [t('dragon',1,'k1a'),t('dragon',1,'k1b'),t('dragon',1,'k1c')], fromPlayer: 0, calledTileId: 'k1a', kanType: 'daiminkan' },
      { type: 'kan', tiles: [t('dragon',2,'k2a'),t('dragon',2,'k2b'),t('dragon',2,'k2c')], fromPlayer: 0, calledTileId: 'k2a', kanType: 'daiminkan' },
      { type: 'kan', tiles: [t('dragon',3,'k3a'),t('dragon',3,'k3b'),t('dragon',3,'k3c')], fromPlayer: 0, calledTileId: 'k3a', kanType: 'daiminkan' },
      { type: 'kan', tiles: [t('man',1,'k4a'),t('man',1,'k4b'),t('man',1,'k4c')], fromPlayer: 0, calledTileId: 'k4a', kanType: 'daiminkan' },
    ];
    const yaku = detectYaku(concealed, melds, { isTsumo: true });
    expect(yaku.some(y => y.name === 'Su Kantsu')).toBe(true);
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
    // メンタンピン三色なので6ハンのはず
    expect(han).toBe(6);
  });

  it('detects Daisangen', () => {
    const hand: Tile[] = [
      t('dragon',1,'a1'),t('dragon',1,'a2'),t('dragon',1,'a3'),
      t('dragon',2,'b1'),t('dragon',2,'b2'),t('dragon',2,'b3'),
      t('dragon',3,'c1'),t('dragon',3,'c2'),t('dragon',3,'c3'),
      t('man',2,'d1'),t('man',3,'d2'),t('man',4,'d3'),
      t('man',5,'d4'),t('man',5,'d5'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Daisangen')).toBe(true);
  });

  it('detects Suu Ankou', () => {
    const hand: Tile[] = [
      t('man',1,'s1a'),t('man',1,'s1b'),t('man',1,'s1c'),
      t('pin',2,'s2a'),t('pin',2,'s2b'),t('pin',2,'s2c'),
      t('sou',3,'s3a'),t('sou',3,'s3b'),t('sou',3,'s3c'),
      t('man',9,'s4a'),t('man',9,'s4b'),t('man',9,'s4c'),
      t('pin',5,'p1'),t('pin',5,'p2'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Suu Ankou')).toBe(true);
  });

  it('detects Daisuushii', () => {
    const hand: Tile[] = [
      t('wind',1,'w1a'),t('wind',1,'w1b'),t('wind',1,'w1c'),
      t('wind',2,'w2a'),t('wind',2,'w2b'),t('wind',2,'w2c'),
      t('wind',3,'w3a'),t('wind',3,'w3b'),t('wind',3,'w3c'),
      t('wind',4,'w4a'),t('wind',4,'w4b'),t('wind',4,'w4c'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Daisuushii')).toBe(true);
  });

  it('detects Tsuuiisou', () => {
    const hand: Tile[] = [
      t('wind',1,'t1'),t('wind',1,'t2'),t('wind',1,'t3'),
      t('wind',2,'t4'),t('wind',2,'t5'),t('wind',2,'t6'),
      t('dragon',1,'d1'),t('dragon',1,'d2'),t('dragon',1,'d3'),
      t('dragon',2,'d4'),t('dragon',2,'d5'),t('dragon',2,'d6'),
      t('dragon',3,'d7'),t('dragon',3,'d8'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Tsuuiisou')).toBe(true);
  });

  it('detects Chuuren Poutou', () => {
    const hand: Tile[] = [
      t('man',1,'c1'),t('man',1,'c2'),t('man',1,'c3'),
      t('man',2,'c4'),t('man',3,'c5'),t('man',4,'c6'),
      t('man',5,'c7'),t('man',6,'c8'),t('man',7,'c9'),
      t('man',8,'c10'),t('man',9,'c11'),t('man',9,'c12'),
      t('man',9,'c13'),t('man',5,'c14'),
    ];
    const yaku = detectYaku(hand, [], { isTsumo: true });
    expect(yaku.some(y => y.name === 'Chuuren Poutou')).toBe(true);
  });

  it('detects Tenhou and Renhou', () => {
    const hand: Tile[] = [
      t('man',1,'r1'),t('man',1,'r2'),t('man',1,'r3'),
      t('pin',2,'r4'),t('pin',2,'r5'),t('pin',2,'r6'),
      t('sou',3,'r7'),t('sou',3,'r8'),t('sou',3,'r9'),
      t('man',2,'r10'),t('man',3,'r11'),t('man',4,'r12'),
      t('pin',5,'r13'),t('pin',5,'r14'),
    ];
    const th = detectYaku(hand, [], { isTsumo: true, tenhou: true });
    expect(th.some(y => y.name === 'Tenhou')).toBe(true);
    const rh = detectYaku(hand, [], { isTsumo: false, renhou: true });
    expect(rh.some(y => y.name === 'Renhou')).toBe(true);
  });

  it('rejects hands that split meld tiles', () => {
    const p = (r: number, id: string) => t('pin', r, id);
    const w = (s: number, id: string) => t('wind', s, id);
    const concealed = [p(1,'a'), p(2,'b'), p(3,'c'), p(4,'d'), p(6,'win')];
    const melds: Meld[] = [
      { type: 'pon', tiles: [p(5,'e1'), p(5,'e2'), p(5,'e3')], fromPlayer: 1, calledTileId: 'e1' },
      { type: 'pon', tiles: [w(1,'ea'), w(1,'eb'), w(1,'ec')], fromPlayer: 2, calledTileId: 'ea' },
      { type: 'pon', tiles: [w(3,'wa'), w(3,'wb'), w(3,'wc')], fromPlayer: 3, calledTileId: 'wa' },
    ];
    expect(isWinningHand(concealed, melds)).toBe(false);
  });
});
