import { PlayerState, Tile } from '../types/mahjong';

export function createInitialPlayerState(name: string, isAI: boolean): PlayerState {
  return {
    hand: [],
    discard: [],
    melds: [],
    score: 25000,
    isRiichi: false,
    name,
    isAI,
  };
}


export function drawTiles(player: PlayerState, wall: Tile[], count: number): { player: PlayerState; wall: Tile[] } {
  const drawn = wall.slice(0, count);
  return {
    player: {
      ...player,
      hand: [...player.hand, ...drawn],
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
    hand: newHand,
    discard: [...player.discard, tile],
  };
}
