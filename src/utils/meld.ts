import { PlayerState, Tile, MeldType } from '../types/mahjong';

export function getChiOptions(player: PlayerState, tile: Tile): Tile[][] {
  if (tile.suit !== 'man' && tile.suit !== 'pin' && tile.suit !== 'sou')
    return [];
  const ranks = [
    [tile.rank - 2, tile.rank - 1],
    [tile.rank - 1, tile.rank + 1],
    [tile.rank + 1, tile.rank + 2],
  ];
  const options: Tile[][] = [];
  for (const [a, b] of ranks) {
    const t1 = player.hand.find(t => t.suit === tile.suit && t.rank === a);
    const t2 = player.hand.find(t => t.suit === tile.suit && t.rank === b);
    if (t1 && t2) options.push([t1, t2]);
  }
  return options;
}

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
  if (type === 'chi') {
    const opts = getChiOptions(player, tile);
    if (opts.length > 0) return opts[0];
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
  const options = Object.values(groups)
    .filter(arr => arr.length >= 4)
    .map(arr => arr.slice(0, 4));

  for (const meld of player.melds) {
    if (meld.type === 'pon') {
      const match = player.hand.find(
        t => t.suit === meld.tiles[0].suit && t.rank === meld.tiles[0].rank,
      );
      if (match) {
        options.push([...meld.tiles, match]);
      }
    }
  }

  return options;
}
