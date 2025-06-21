import { PlayerState, Tile, MeldType } from '../types/mahjong';

export function sortHand(hand: Tile[]): Tile[] {
  const order: Record<Tile['suit'], number> = {
    man: 0,
    pin: 1,
    sou: 2,
    wind: 3,
    dragon: 4,
  };
  return [...hand].sort((a, b) => {
    const diff = order[a.suit] - order[b.suit];
    if (diff !== 0) return diff;
    return a.rank - b.rank;
  });
}

export function createInitialPlayerState(name: string, isAI: boolean): PlayerState {
  return {
    hand: [],
    discard: [],
    melds: [],
    score: 25000,
    isRiichi: false,
    name,
    isAI,
    drawnTile: null,
  };
}


export function drawTiles(player: PlayerState, wall: Tile[], count: number): { player: PlayerState; wall: Tile[] } {
  const drawn = wall.slice(0, count);
  return {
    player: {
      ...player,
      hand: sortHand([...player.hand, ...drawn]),
      drawnTile: count === 1 ? drawn[0] : null,
    },
    wall: wall.slice(count),
  };
}

export function discardTile(player: PlayerState, tileId: string): PlayerState {
  const idx = player.hand.findIndex(t => t.id === tileId);
  if (idx === -1) return player;
  const tile = player.hand[idx];
  const newHand = [...player.hand];
  newHand.splice(idx, 1);
  return {
    ...player,
    hand: sortHand(newHand),
    discard: [...player.discard, tile],
    drawnTile: null,
  };
}

export function claimMeld(
  player: PlayerState,
  tiles: Tile[],
  type: MeldType,
): PlayerState {
  // remove called tiles from hand
  const hand = player.hand.filter(h => !tiles.some(t => t.id === h.id));
  return {
    ...player,
    hand: sortHand(hand),
    melds: [...player.melds, { type, tiles }],
  };
}

export function declareRiichi(player: PlayerState): PlayerState {
  if (player.isRiichi) return player;
  return { ...player, isRiichi: true };
}
