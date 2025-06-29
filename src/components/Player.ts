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
    doubleRiichi: false,
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

export function markDiscardCalled(
  player: PlayerState,
  tileId: string,
  callerSeat: number,
): PlayerState {
  return {
    ...player,
    discard: player.discard.map(t =>
      t.id === tileId ? { ...t, called: true, calledFrom: callerSeat } : t,
    ),
  };
}

function arrangeChiTiles(
  tiles: Tile[],
  calledTileId: string,
  callerSeat: number,
  fromSeat: number,
): Tile[] {
  const sorted = [...tiles].sort((a, b) => a.rank - b.rank);
  const idx = sorted.findIndex(t => t.id === calledTileId);
  if (idx === -1) return sorted;
  const [called] = sorted.splice(idx, 1);
  const diff = (fromSeat - callerSeat + 4) % 4;
  const pos = diff === 3 ? 0 : diff === 2 ? 1 : 2;
  sorted.splice(pos, 0, called);
  return sorted;
}

export function claimMeld(
  player: PlayerState,
  tiles: Tile[],
  type: MeldType,
  fromPlayer: number,
  calledTileId: string,
  kanType?: 'ankan' | 'kakan' | 'daiminkan',
): PlayerState {
  // remove called tiles from hand
  const hand = player.hand.filter(h => !tiles.some(t => t.id === h.id));
  let meldTiles = tiles;
  const idx = tiles.findIndex(t => t.id === calledTileId);
  if (idx >= 0) {
    const called = tiles[idx];
    const others = tiles.filter((_, i) => i !== idx);
    if (type === 'chi') {
      meldTiles = arrangeChiTiles([...others, called], calledTileId, player.seat, fromPlayer);
    } else {
      // Standard layout places the claimed tile on the right end regardless of
      // which seat discarded it.
      meldTiles = [...others, called];
    }
  }
  return {
    ...player,
    hand: sortHand(hand),
    melds: [
      ...player.melds,
      { type, tiles: meldTiles, fromPlayer, calledTileId, kanType },
    ],
  };
}

export function declareRiichi(
  player: PlayerState,
  doubleRiichi = false,
): PlayerState {
  if (player.isRiichi) return player;
  return { ...player, isRiichi: true, ippatsu: true, doubleRiichi };
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
