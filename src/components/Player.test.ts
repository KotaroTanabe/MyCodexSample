import { describe, expect, it } from 'vitest';
import { incrementDiscardCount } from './DiscardUtil';
import {
  createInitialPlayerState,
  drawTiles,
  discardTile,
  sortHand,
  claimMeld,
  declareRiichi,
  clearIppatsu,
  canDeclareRiichi,
  isTenpaiAfterDiscard,
  canDiscardTile,
  canCallMeld,
  removeDiscardTile,
  markDiscardCalled,
} from './Player';
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

describe('removeDiscardTile', () => {
  it('removes the specified tile from the discard pile', () => {
    const player: PlayerState = {
      ...createInitialPlayerState('test', false),
      discard: [
        { suit: 'man', rank: 1, id: 'a' },
        { suit: 'man', rank: 2, id: 'b' },
      ],
    };
    const updated = removeDiscardTile(player, 'a');
    expect(updated.discard).toHaveLength(1);
    expect(updated.discard[0].id).toBe('b');
  });
});

describe('markDiscardCalled', () => {
  it('marks the specified tile as called with the caller seat', () => {
    const player: PlayerState = {
      ...createInitialPlayerState('test', false),
      discard: [{ suit: 'man', rank: 1, id: 'a' }],
    };
    const updated = markDiscardCalled(player, 'a', 3);
    expect(updated.discard[0].called).toBe(true);
    expect(updated.discard[0].calledFrom).toBe(3);
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
    expect(updated.discard[updated.discard.length - 1]).toEqual({
      ...tileToDiscard,
      riichiDiscard: false,
    });
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

  it('marks riichi discards', () => {
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'a' },
      { suit: 'man', rank: 2, id: 'b' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('Bob', false),
      hand,
      isRiichi: true,
      drawnTile: hand[1],
    };
    const updated = discardTile(player, 'b', true);
    expect(updated.discard[updated.discard.length - 1].riichiDiscard).toBe(true);
  });

  it('clears drawnTile when discarding the drawn tile', () => {
    const wall = generateTileWall();
    const base = createInitialPlayerState('Bob', false);
    const { player } = drawTiles(base, wall, 1);
    const tileId = player.hand[0].id;
    const updated = discardTile(player, tileId);
    expect(updated.drawnTile).toBeNull();
  });
});

describe('claimMeld', () => {
  it('removes tiles and adds a meld', () => {
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'm1' },
      { suit: 'man', rank: 2, id: 'm2' },
      { suit: 'pin', rank: 5, id: 'p1' },
    ];
    const discard: Tile = { suit: 'man', rank: 3, id: 'm3' };
    const player: PlayerState = { ...createInitialPlayerState('Bob', false), hand };
    const tiles = [...hand.slice(0, 2), discard];
    const updated = claimMeld(player, tiles, 'chi' as MeldType, 1, discard.id);
    expect(updated.hand).toHaveLength(1);
    expect(updated.hand[0].id).toBe('p1');
    expect(updated.melds[0].tiles.map(t => t.id)).toEqual(['m1', 'm2', 'm3']);
  });

  it('orders chi tiles based on discarder seat', () => {
    const t = (rank: number, id: string): Tile => ({ suit: 'man', rank, id });

    const left = claimMeld(
      { ...createInitialPlayerState('Bob', false), hand: [t(2, 'b'), t(3, 'c')] },
      [t(2, 'b'), t(3, 'c'), t(1, 'a')],
      'chi' as MeldType,
      3,
      'a',
    );
    expect(left.melds[0].tiles.map(t => t.id)).toEqual(['a', 'b', 'c']);

    const opposite = claimMeld(
      { ...createInitialPlayerState('Bob', false), hand: [t(1, 'a'), t(3, 'c')] },
      [t(1, 'a'), t(3, 'c'), t(2, 'b')],
      'chi' as MeldType,
      2,
      'b',
    );
    expect(opposite.melds[0].tiles.map(t => t.id)).toEqual(['a', 'b', 'c']);

    const right = claimMeld(
      { ...createInitialPlayerState('Bob', false), hand: [t(1, 'a'), t(2, 'b')] },
      [t(1, 'a'), t(2, 'b'), t(3, 'c')],
      'chi' as MeldType,
      1,
      'c',
    );
    expect(right.melds[0].tiles.map(t => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('orders pon tiles based on caller position', () => {
    const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
      suit,
      rank,
      id,
    });
    const hand: Tile[] = [t('man', 1, 'a'), t('man', 1, 'b'), t('man', 1, 'c')];
    const player: PlayerState = { ...createInitialPlayerState('Bob', false), hand };
    const tiles = hand.slice();
    const fromRight = claimMeld(player, tiles, 'pon', 1, 'a');
    const fromOpposite = claimMeld(player, tiles, 'pon', 2, 'a');
    const fromLeft = claimMeld(player, tiles, 'pon', 3, 'a');
    expect(fromRight.melds[0].tiles[2].id).toBe('a');
    expect(fromOpposite.melds[0].tiles[2].id).toBe('a');
    expect(fromLeft.melds[0].tiles[2].id).toBe('a');
  });

  it('orders kan tiles based on caller position', () => {
    const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
      suit,
      rank,
      id,
    });
    const hand: Tile[] = [
      t('man', 1, 'a'),
      t('man', 1, 'b'),
      t('man', 1, 'c'),
      t('man', 1, 'd'),
    ];
    const player: PlayerState = { ...createInitialPlayerState('Bob', false), hand };
    const tiles = hand.slice();
    const fromRight = claimMeld(player, tiles, 'kan', 1, 'a', 'daiminkan');
    const fromOpposite = claimMeld(player, tiles, 'kan', 2, 'a', 'daiminkan');
    const fromLeft = claimMeld(player, tiles, 'kan', 3, 'a', 'daiminkan');
    expect(fromRight.melds[0].tiles[3].id).toBe('a');
    expect(fromOpposite.melds[0].tiles[3].id).toBe('a');
    expect(fromLeft.melds[0].tiles[3].id).toBe('a');
  });

  it('clears drawnTile when calling a meld', () => {
    const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
      suit,
      rank,
      id,
    });
    const hand: Tile[] = [t('man', 1, 'a'), t('man', 1, 'b'), t('pin', 5, 'p')];
    const player: PlayerState = {
      ...createInitialPlayerState('Bob', false),
      hand,
      drawnTile: hand[0],
    };
    const updated = claimMeld(
      player,
      [t('man', 1, 'a'), t('man', 1, 'b'), t('man', 1, 'c')],
      'pon' as MeldType,
      1,
      'c',
    );
    expect(updated.drawnTile).toBeNull();
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
  it('initializes ippatsu to false', () => {
    const p = createInitialPlayerState('foo', false);
    expect(p.ippatsu).toBe(false);
  });
  it('initializes doubleRiichi to false', () => {
    const p = createInitialPlayerState('foo', false);
    expect(p.doubleRiichi).toBe(false);
  });
});

describe('declareRiichi', () => {
  it('sets the riichi flag on the player', () => {
    const player = createInitialPlayerState('RiichiMan', false);
    const updated = declareRiichi(player);
    expect(updated.isRiichi).toBe(true);
    expect(updated.ippatsu).toBe(true);
    expect(updated.doubleRiichi).toBe(false);
  });

  it('can mark double riichi when specified', () => {
    const player = createInitialPlayerState('RiichiMan', false);
    const updated = declareRiichi(player, true);
    expect(updated.doubleRiichi).toBe(true);
  });
});

describe('clearIppatsu', () => {
  it('resets the ippatsu flag', () => {
    const player = { ...createInitialPlayerState('test', false), ippatsu: true };
    const updated = clearIppatsu(player);
    expect(updated.ippatsu).toBe(false);
  });
});

describe('canDeclareRiichi', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

  it('returns true for a closed tenpai hand with drawn tile', () => {
    const hand: Tile[] = [
      t('man', 1, 'a1'), t('man', 1, 'a2'),
      t('man', 2, 'b1'), t('man', 2, 'b2'),
      t('pin', 3, 'c1'), t('pin', 3, 'c2'),
      t('pin', 4, 'd1'), t('pin', 4, 'd2'),
      t('sou', 5, 'e1'), t('sou', 5, 'e2'),
      t('sou', 6, 'f1'), t('sou', 6, 'f2'),
      t('man', 7, 'g1'), t('man', 8, 'h1'),
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('Tenpai', false),
      hand,
      drawnTile: hand[13],
    };
    expect(canDeclareRiichi(player)).toBe(true);
  });

  it('returns false when not in tenpai', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 1, 'j'), t('pin', 1, 'k'),
      t('sou', 2, 'l'), t('sou', 2, 'm'), t('sou', 3, 'n'),
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('NoTen', false),
      hand,
      drawnTile: null,
    };
    expect(canDeclareRiichi(player)).toBe(false);
  });
});

describe('isTenpaiAfterDiscard', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

  it('detects tenpai after discarding a tile', () => {
    const hand: Tile[] = [
      t('man', 1, 'a1'), t('man', 1, 'a2'),
      t('man', 2, 'b1'), t('man', 2, 'b2'),
      t('pin', 3, 'c1'), t('pin', 3, 'c2'),
      t('pin', 4, 'd1'), t('pin', 4, 'd2'),
      t('sou', 5, 'e1'), t('sou', 5, 'e2'),
      t('sou', 6, 'f1'), t('sou', 6, 'f2'),
      t('man', 7, 'g1'), t('man', 8, 'h1'),
    ];
    const player: PlayerState = { ...createInitialPlayerState('test', false), hand };
    expect(isTenpaiAfterDiscard(player, 'h1')).toBe(true);
  });

  it('returns false if noten after discard', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 1, 'j'), t('pin', 1, 'k'),
      t('sou', 2, 'l'), t('sou', 2, 'm'), t('sou', 3, 'n'),
    ];
    const player: PlayerState = { ...createInitialPlayerState('bad', false), hand };
    expect(isTenpaiAfterDiscard(player, 'a')).toBe(false);
  });
});

describe('riichi restrictions', () => {
  it('allows discarding only drawn tile after riichi', () => {
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'a' },
      { suit: 'man', rank: 2, id: 'b' },
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('r', false),
      hand,
      isRiichi: true,
      drawnTile: hand[0],
    };
    expect(canDiscardTile(player, 'a')).toBe(true);
    expect(canDiscardTile(player, 'b')).toBe(false);
    expect(canCallMeld(player)).toBe(false);
  });
});
