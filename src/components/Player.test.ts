import { describe, expect, it } from 'vitest';
import { incrementDiscardCount } from './DiscardUtil';
import { createInitialPlayerState, drawTiles, discardTile, sortHand, claimMeld, declareRiichi } from './Player';
import { generateTileWall } from './TileWall';
import { Tile, PlayerState, MeldType } from '../types/mahjong';

// Unit tests for Player helper functions

describe('drawTiles', () => {
  it('adds tiles to the player hand and removes them from the wall', () => {
    const wall = generateTileWall();
    const player = createInitialPlayerState('Alice', false);

    const { player: updated, wall: remaining } = drawTiles(player, wall, 4);

    // hand should gain 4 tiles
    expect(updated.hand).toHaveLength(4);
    // wall should lose 4 tiles
    expect(remaining).toHaveLength(wall.length - 4);
    // hand should be sorted
    expect(updated.hand).toEqual(sortHand(wall.slice(0, 4)));
    expect(remaining).toEqual(wall.slice(4));
    expect(updated.drawnTile).toBeNull();
  });

  it('sorts the hand by suit and rank', () => {
    const customWall: Tile[] = [
      { suit: 'sou', rank: 3, id: 's1' },
      { suit: 'man', rank: 1, id: 'm1' },
      { suit: 'pin', rank: 2, id: 'p1' },
      { suit: 'dragon', rank: 1, id: 'd1' },
      { suit: 'wind', rank: 3, id: 'w1' },
    ];
    const player = createInitialPlayerState('Alice', false);
    const result = drawTiles(player, customWall, customWall.length);
    expect(result.player.hand).toEqual(sortHand(customWall));
    expect(result.player.drawnTile).toBeNull();
  });

  it('records the last drawn tile when drawing a single tile', () => {
    const wall = generateTileWall();
    const player = createInitialPlayerState('Alice', false);
    const { player: updated } = drawTiles(player, wall, 1);
    expect(updated.drawnTile).toEqual(updated.hand[0]);
  });
});

describe('discardTile', () => {
  it('moves the specified tile from hand to discard pile', () => {
    const wall = generateTileWall();
    const player = createInitialPlayerState('Bob', false);
    const drawn = drawTiles(player, wall, 5).player;
    const tileToDiscard = drawn.hand[2];

    const updated = discardTile(drawn, tileToDiscard.id);

    expect(updated.hand).toHaveLength(4);
    expect(updated.hand.find(t => t.id === tileToDiscard.id)).toBeUndefined();
    expect(updated.hand).toEqual(
      sortHand(drawn.hand.filter(t => t.id !== tileToDiscard.id))
    );
    expect(updated.discard[updated.discard.length - 1]).toEqual(tileToDiscard);
    expect(updated.drawnTile).toBeNull();
  });

  it('keeps the hand sorted after discarding', () => {
    const hand: Tile[] = [
      { suit: 'sou', rank: 3, id: 's1' },
      { suit: 'man', rank: 1, id: 'm1' },
      { suit: 'pin', rank: 2, id: 'p1' },
      { suit: 'wind', rank: 3, id: 'w1' },
    ];
    const player: PlayerState = { ...createInitialPlayerState('Bob', false), hand };
    const updated = discardTile(player, 's1');
    expect(updated.hand).toEqual(sortHand(hand.filter(t => t.id !== 's1')));
  });
});

describe('claimMeld', () => {
  it('removes tiles and adds a meld', () => {
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'm1' },
      { suit: 'man', rank: 2, id: 'm2' },
      { suit: 'man', rank: 3, id: 'm3' },
      { suit: 'pin', rank: 5, id: 'p1' },
    ];
    const player: PlayerState = { ...createInitialPlayerState('Bob', false), hand };
    const tiles = hand.slice(0, 3);
    const updated = claimMeld(player, tiles, 'chi' as MeldType, 1, 'm2');
    expect(updated.hand).toHaveLength(1);
    expect(updated.hand[0].id).toBe('p1');
    expect(updated.melds).toEqual([{ type: 'chi', tiles, fromPlayer: 1, calledTileId: 'm2' }]);
  });
});

describe('incrementDiscardCount', () => {
  it('increments counts and identifies shonpai', () => {
    const tile: Tile = { suit: 'man', rank: 1, id: 'm1' };
    let record: Record<string, number> = {};
    let result = incrementDiscardCount(record, tile);
    record = result.record;
    expect(result.isShonpai).toBe(true);
    expect(record['man-1']).toBe(1);

    result = incrementDiscardCount(record, tile);
    record = result.record;
    expect(result.isShonpai).toBe(false);
    expect(record['man-1']).toBe(2);

    // reset for new round
    record = {};
    result = incrementDiscardCount(record, tile);
    expect(result.isShonpai).toBe(true);
    expect(result.record['man-1']).toBe(1);
  });
});

describe('initial hand distribution', () => {
  it('gives the dealer 14 tiles after the initial draw', () => {
    let wall = generateTileWall();
    const players: PlayerState[] = [
      createInitialPlayerState('you', false),
      createInitialPlayerState('AI1', true),
      createInitialPlayerState('AI2', true),
      createInitialPlayerState('AI3', true),
    ];
    for (let i = 0; i < 4; i++) {
      const result = drawTiles(players[i], wall, 13);
      players[i] = result.player;
      wall = result.wall;
    }
    const extra = drawTiles(players[0], wall, 1);
    players[0] = extra.player;
    wall = extra.wall;

    expect(players[0].hand).toHaveLength(14);
  });
});

describe('declareRiichi', () => {
  it('sets the riichi flag on the player', () => {
    const player = createInitialPlayerState('RiichiMan', false);
    const updated = declareRiichi(player);
    expect(updated.isRiichi).toBe(true);
  });
});
