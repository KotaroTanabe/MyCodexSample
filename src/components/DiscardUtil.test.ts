import { describe, it, expect } from 'vitest';
import { findRonWinner } from './DiscardUtil';
import { Tile } from '../types/mahjong';
import { createInitialPlayerState } from './Player';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

const winningBase: Tile[] = [
  t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
  t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
  t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
  t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
  t('pin',5,'p5a'),
];

const winningTile = t('pin',5,'p5b');

describe('findRonWinner', () => {
  it('identifies a winning player on discard', () => {
    const p1 = createInitialPlayerState('p1', false);
    const p2 = { ...createInitialPlayerState('p2', false), hand: winningBase };
    const players = [p1, p2];
    const idx = findRonWinner(players, 0, winningTile, 1);
    expect(idx).toBe(1);
  });

  it('returns null when no one can win', () => {
    const p1 = createInitialPlayerState('p1', false);
    const p2 = createInitialPlayerState('p2', false);
    const players = [p1, p2];
    const idx = findRonWinner(players, 0, winningTile, 1);
    expect(idx).toBeNull();
  });

  it('ignores hands with only dora', () => {
    const base: Tile[] = [
      t('man',1,'a1'),t('man',2,'a2'),t('man',3,'a3'),
      t('pin',4,'b4'),t('pin',5,'b5'),t('pin',6,'b6'),
      t('sou',7,'c7'),t('sou',8,'c8'),t('sou',9,'c9'),
      t('man',3,'d3'),t('man',4,'d4'),t('man',5,'d5'),
      t('wind',3,'w1'),
    ];
    const win = t('wind',3,'w2');
    const p1 = createInitialPlayerState('p1', false);
    const p2 = { ...createInitialPlayerState('p2', false), hand: base };
    const players = [p1, p2];
    const idx = findRonWinner(players, 0, win, 1);
    expect(idx).toBeNull();
  });

  it('counts riichi as valid yaku', () => {
    const base: Tile[] = [
      t('man', 1, 'm1'),
      t('man', 2, 'm2'),
      t('man', 3, 'm3'),
      t('pin', 2, 'p2'),
      t('pin', 3, 'p3'),
      t('pin', 4, 'p4'),
      t('sou', 2, 's2'),
      t('sou', 3, 's3'),
      t('sou', 4, 's4'),
      t('man', 5, 'm5'),
      t('man', 6, 'm6'),
      t('wind', 3, 'w1'),
      t('wind', 3, 'w2'),
    ];
    const winTile = t('man', 7, 'm7');
    const p1 = { ...createInitialPlayerState('p1', false), hand: base, isRiichi: true };
    const p2 = createInitialPlayerState('p2', false);
    const players = [p1, p2];
    const idx = findRonWinner(players, 1, winTile, 1);
    expect(idx).toBe(0);
  });

  it('detects ron on tsumogiri 6p for 6p/9p wait', () => {
    const base: Tile[] = [
      t('pin', 2, 'a'),
      t('pin', 3, 'b'),
      t('pin', 4, 'c'),
      t('pin', 5, 'd'),
      t('pin', 6, 'e'),
      t('pin', 7, 'f'),
      t('pin', 7, 'g'),
      t('pin', 8, 'h'),
      t('sou', 2, 'i'),
      t('sou', 2, 'j'),
      t('sou', 3, 'k'),
      t('sou', 4, 'l'),
      t('sou', 5, 'm'),
    ];
    const winTile = t('pin', 6, 'ron');
    const p1 = { ...createInitialPlayerState('p1', false), hand: base };
    const p2 = createInitialPlayerState('p2', false);
    const players = [p1, p2];
    const idx = findRonWinner(players, 1, winTile, 1);
    expect(idx).toBe(0);
  });

  it('handles ron with open melds', () => {
    const melds = [
      {
        type: 'pon' as const,
        tiles: [
          t('dragon', 2, 'dr1'),
          t('dragon', 2, 'dr2'),
          t('dragon', 2, 'dr3'),
        ],
        fromPlayer: 0,
        calledTileId: 'dr1',
      },
      {
        type: 'chi' as const,
        tiles: [
          t('sou', 4, 's4'),
          t('sou', 5, 's5'),
          t('sou', 6, 's6'),
        ],
        fromPlayer: 0,
        calledTileId: 's4',
      },
      {
        type: 'pon' as const,
        tiles: [
          t('pin', 2, 'p2a'),
          t('pin', 2, 'p2b'),
          t('pin', 2, 'p2c'),
        ],
        fromPlayer: 0,
        calledTileId: 'p2a',
      },
    ];
    const concealed = [
      t('pin', 4, 'p4'),
      t('pin', 6, 'p6'),
      t('pin', 8, 'p8a'),
      t('pin', 8, 'p8b'),
    ];
    const discard = t('pin', 5, 'p5');
    const p1 = createInitialPlayerState('p1', false);
    const p2 = {
      ...createInitialPlayerState('p2', false, 1),
      hand: concealed,
      melds,
    };
    const players = [p1, p2];
    const idx = findRonWinner(players, 0, discard, 1);
    expect(idx).toBe(1);
  });

  it('detects ron on 4p/5s/8s wait with mixed melds', () => {
    // 44p55567s with pon 333m and chi 567m. Winning tile is 8s.
    const melds = [
      {
        type: 'pon' as const,
        tiles: [t('man', 3, 'm3a'), t('man', 3, 'm3b'), t('man', 3, 'm3c')],
        fromPlayer: 1,
        calledTileId: 'm3a',
      },
      {
        type: 'chi' as const,
        tiles: [t('man', 5, 'm5a'), t('man', 6, 'm6a'), t('man', 7, 'm7a')],
        fromPlayer: 2,
        calledTileId: 'm5a',
      },
    ];
    const concealed = [
      t('pin', 4, 'p4a'),
      t('pin', 4, 'p4b'),
      t('sou', 5, 's5a'),
      t('sou', 5, 's5b'),
      t('sou', 5, 's5c'),
      t('sou', 6, 's6'),
      t('sou', 7, 's7'),
    ];
    const discard = t('sou', 8, 's8');
    const p1 = createInitialPlayerState('p1', false);
    const p2 = {
      ...createInitialPlayerState('p2', false, 1),
      hand: concealed,
      melds,
    };
    const players = [p1, p2];
    const idx = findRonWinner(players, 0, discard, 1);
    expect(idx).toBe(1);
  });
});
