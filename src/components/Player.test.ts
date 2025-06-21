import { describe, expect, it } from 'vitest';
import { createInitialPlayerState, drawTiles, discardTile, sortHand } from './Player';
import { generateTileWall } from './TileWall';
import { Tile, PlayerState } from '../types/mahjong';

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
