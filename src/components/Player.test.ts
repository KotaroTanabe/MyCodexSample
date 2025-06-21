import { describe, expect, it } from 'vitest';
import { createInitialPlayerState, drawTiles, discardTile } from './Player';
import { generateTileWall } from './TileWall';

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
    // drawn tiles should be first 4 from original wall
    expect(updated.hand).toEqual(wall.slice(0, 4));
    expect(remaining).toEqual(wall.slice(4));
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
    expect(updated.discard[updated.discard.length - 1]).toEqual(tileToDiscard);
  });
});
