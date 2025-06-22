import { PlayerState, Tile, MeldType } from '../types/mahjong';

export function selectMeldTiles(
  player: PlayerState,
  tile: Tile,
  type: MeldType,
): Tile[] | null {
  if (type === 'pon' || type === 'kan') {
    const need = type === 'pon' ? 2 : 3;
    const matches = player.hand.filter(
      t => t.suit === tile.suit && t.rank === tile.rank,
    );
    if (matches.length >= need) return matches.slice(0, need);
    return null;
  }
  // chi
  if (tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou') {
    const opts = [
      [tile.rank - 2, tile.rank - 1],
      [tile.rank - 1, tile.rank + 1],
      [tile.rank + 1, tile.rank + 2],
    ];
    for (const [a, b] of opts) {
      const t1 = player.hand.find(t => t.suit === tile.suit && t.rank === a);
      const t2 = player.hand.find(t => t.suit === tile.suit && t.rank === b);
      if (t1 && t2) return [t1, t2];
    }
  }
  return null;
}

export function getValidCallOptions(
  player: PlayerState,
  tile: Tile,
): (MeldType | 'pass')[] {
  const actions: (MeldType | 'pass')[] = [];
  (['pon', 'chi', 'kan'] as MeldType[]).forEach(t => {
    if (selectMeldTiles(player, tile, t)) actions.push(t);
  });
  if (actions.length > 0) actions.push('pass');
  return actions;
}

export function getSelfKanOptions(player: PlayerState): Tile[][] {
  const groups: Record<string, Tile[]> = {};
  for (const t of player.hand) {
    const key = `${t.suit}-${t.rank}`;
    (groups[key] = groups[key] || []).push(t);
  }
  return Object.values(groups)
    .filter(arr => arr.length >= 4)
    .map(arr => arr.slice(0, 4));
}
