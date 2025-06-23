import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { calcShanten } from '../utils/shanten';

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

export function createInitialPlayerState(
  name: string,
  isAI: boolean,
  seat = 0,
): PlayerState {
  return {
    hand: [],
    discard: [],
    melds: [],
    score: 25000,
    isRiichi: false,
    ippatsu: false,
    name,
    isAI,
    drawnTile: null,
    seat,
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

export function discardTile(
  player: PlayerState,
  tileId: string,
  riichiDiscard = false,
): PlayerState {
  const idx = player.hand.findIndex(t => t.id === tileId);
  if (idx === -1) return player;
  const tile = { ...player.hand[idx], riichiDiscard };
  const newHand = [...player.hand];
  newHand.splice(idx, 1);
  return {
    ...player,
    hand: sortHand(newHand),
    discard: [...player.discard, tile],
    drawnTile: null,
  };
}

export function canDiscardTile(player: PlayerState, tileId: string): boolean {
  if (!player.isRiichi) return true;
  return player.drawnTile?.id === tileId;
}

export function canCallMeld(player: PlayerState): boolean {
  return !player.isRiichi;
}

export function removeDiscardTile(
  player: PlayerState,
  tileId: string,
): PlayerState {
  return {
    ...player,
    discard: player.discard.filter(t => t.id !== tileId),
  };
}

export function claimMeld(
  player: PlayerState,
  tiles: Tile[],
  type: MeldType,
  fromPlayer: number,
  calledTileId: string,
): PlayerState {
  // remove called tiles from hand
  const hand = player.hand.filter(h => !tiles.some(t => t.id === h.id));
  let meldTiles = tiles;
  if (type === 'chi') {
    const idx = tiles.findIndex(t => t.id === calledTileId);
    if (idx >= 0) {
      const called = tiles[idx];
      const others = tiles.filter((_, i) => i !== idx);
      // when calling from the player on the left (standard chi),
      // place the called tile at the leftmost position
      if (fromPlayer === (player.seat + 3) % 4) {
        meldTiles = [called, ...others];
      } else {
        meldTiles = [...others, called];
      }
    }
  }
  return {
    ...player,
    hand: sortHand(hand),
    melds: [...player.melds, { type, tiles: meldTiles, fromPlayer, calledTileId }],
  };
}

export function declareRiichi(player: PlayerState): PlayerState {
  if (player.isRiichi) return player;
  return { ...player, isRiichi: true, ippatsu: true };
}

export function canDeclareRiichi(player: PlayerState): boolean {
  if (player.isRiichi || player.melds.length > 0 || !player.drawnTile) {
    return false;
  }
  for (const tile of player.hand) {
    const remaining = player.hand.filter(t => t.id !== tile.id);
    const shanten = calcShanten(remaining, player.melds.length);
    const base = Math.min(shanten.standard, shanten.chiitoi, shanten.kokushi);
    if (base === 0) {
      return true;
    }
  }
  return false;
}

export function isTenpaiAfterDiscard(player: PlayerState, tileId: string): boolean {
  const remaining = player.hand.filter(t => t.id !== tileId);
  const shanten = calcShanten(remaining, player.melds.length);
  const base = Math.min(shanten.standard, shanten.chiitoi, shanten.kokushi);
  return base === 0;
}

export function clearIppatsu(player: PlayerState): PlayerState {
  if (!player.ippatsu) return player;
  return { ...player, ippatsu: false };
}
