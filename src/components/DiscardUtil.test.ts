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
    const idx = findRonWinner(players, 0, winningTile);
    expect(idx).toBe(1);
  });

  it('returns null when no one can win', () => {
    const p1 = createInitialPlayerState('p1', false);
    const p2 = createInitialPlayerState('p2', false);
    const players = [p1, p2];
    const idx = findRonWinner(players, 0, winningTile);
    expect(idx).toBeNull();
  });
});
