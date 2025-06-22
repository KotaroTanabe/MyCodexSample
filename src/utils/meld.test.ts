import { describe, it, expect } from 'vitest';
import { getValidCallOptions, selectMeldTiles, getSelfKanOptions, getChiOptions } from './meld';
import { PlayerState, Tile } from '../types/mahjong';
import { createInitialPlayerState } from '../components/Player';

describe('getValidCallOptions', () => {
  it('returns pon when two matching tiles exist', () => {
    const discard: Tile = { suit: 'man', rank: 5, id: 'd1' };
    const hand: Tile[] = [
      { suit: 'man', rank: 5, id: 'a' },
      { suit: 'man', rank: 5, id: 'b' },
      { suit: 'sou', rank: 1, id: 'x' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    expect(getValidCallOptions(player, discard)).toEqual(['pon', 'pass']);
  });

  it('includes kan when three matching tiles exist', () => {
    const discard: Tile = { suit: 'pin', rank: 2, id: 'd2' };
    const hand: Tile[] = [
      { suit: 'pin', rank: 2, id: 'a' },
      { suit: 'pin', rank: 2, id: 'b' },
      { suit: 'pin', rank: 2, id: 'c' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    expect(getValidCallOptions(player, discard)).toEqual(['pon', 'kan', 'pass']);
  });

  it('detects chi sequences', () => {
    const discard: Tile = { suit: 'sou', rank: 3, id: 'd3' };
    const hand: Tile[] = [
      { suit: 'sou', rank: 2, id: 'a' },
      { suit: 'sou', rank: 4, id: 'b' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    expect(getValidCallOptions(player, discard)).toEqual(['chi', 'pass']);
  });

  it('returns empty array when no meld is possible', () => {
    const discard: Tile = { suit: 'wind', rank: 1, id: 'd4' };
    const hand: Tile[] = [
      { suit: 'man', rank: 3, id: 'x' },
      { suit: 'pin', rank: 5, id: 'y' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    expect(getValidCallOptions(player, discard)).toEqual([]);
  });
});

describe('selectMeldTiles', () => {
  it('returns tiles for pon', () => {
    const tile: Tile = { suit: 'man', rank: 7, id: 'd' };
    const hand: Tile[] = [
      { suit: 'man', rank: 7, id: 'a' },
      { suit: 'man', rank: 7, id: 'b' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    const result = selectMeldTiles(player, tile, 'pon');
    expect(result?.length).toBe(2);
  });
});

describe('getChiOptions', () => {
  it('returns multiple chi candidates', () => {
    const discard: Tile = { suit: 'man', rank: 3, id: 'd' };
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'a' },
      { suit: 'man', rank: 2, id: 'b' },
      { suit: 'man', rank: 4, id: 'c' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    const opts = getChiOptions(player, discard);
    // 1-2-3 と 2-3-4 の二通りが考えられるため2件になる
    expect(opts.length).toBe(2);
  });
});

describe('getSelfKanOptions', () => {
  it('detects four of a kind in hand', () => {
    const hand: Tile[] = [
      { suit: 'pin', rank: 5, id: 'a' },
      { suit: 'pin', rank: 5, id: 'b' },
      { suit: 'pin', rank: 5, id: 'c' },
      { suit: 'pin', rank: 5, id: 'd' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    const options = getSelfKanOptions(player);
    expect(options).toHaveLength(1);
    expect(options[0].length).toBe(4);
  });

  it('returns empty array when no kan possible', () => {
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'a' },
      { suit: 'man', rank: 1, id: 'b' },
      { suit: 'man', rank: 1, id: 'c' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('you', false),
      hand,
    };
    expect(getSelfKanOptions(player)).toHaveLength(0);
  });
});
