import { describe, it, expect } from 'vitest';
import { validateDiscard, appendDiscardLog } from './helpers';
import { Tile, PlayerState, LogEntry } from '../types/mahjong';
import { createInitialPlayerState } from '../components/Player';

function t(suit: Tile['suit'], rank: number, id: string): Tile {
  return { suit, rank, id };
}

describe('validateDiscard', () => {
  it('blocks non-drawn tiles after riichi', () => {
    const hand = [t('man', 1, 'a'), t('man', 2, 'b')];
    const player: PlayerState = {
      ...createInitialPlayerState('p', false),
      hand,
      isRiichi: true,
      drawnTile: hand[0],
    };
    expect(validateDiscard(player, 'b', false)).toBe(
      'リーチ後はツモ牌しか切れません',
    );
    expect(validateDiscard(player, 'a', false)).toBeNull();
  });

  it('ensures tenpai when declaring riichi', () => {
    const hand = [
      t('man', 1, 'a'),
      t('man', 1, 'a2'),
      t('man', 2, 'b1'),
      t('man', 2, 'b2'),
      t('pin', 3, 'c1'),
      t('pin', 3, 'c2'),
      t('pin', 4, 'd1'),
      t('pin', 4, 'd2'),
      t('sou', 5, 'e1'),
      t('sou', 5, 'e2'),
      t('sou', 6, 'f1'),
      t('sou', 6, 'f2'),
      t('man', 7, 'g1'),
      t('man', 8, 'h1'),
    ];
    const player: PlayerState = { ...createInitialPlayerState('p', false), hand };
    expect(validateDiscard(player, 'h1', true)).toBeNull();
    expect(validateDiscard(player, 'a', true)).toBe(
      'その牌ではリーチできません',
    );
  });
});

describe('appendDiscardLog', () => {
  it('adds a discard entry', () => {
    const log: LogEntry[] = [];
    const tile = t('man', 1, 'a');
    const result = appendDiscardLog(log, 0, tile);
    expect(result).toEqual([{ type: 'discard', player: 0, tile }]);
  });
});
