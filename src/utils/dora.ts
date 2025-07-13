import { Tile } from '../types/mahjong';

function tileKey(t: Tile): string {
  return `${t.suit}-${t.rank}`;
}

function countTiles(tiles: Tile[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tiles) {
    const key = tileKey(t);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

export function doraFromIndicator(ind: Tile): Tile {
  if (ind.suit === 'man' || ind.suit === 'pin' || ind.suit === 'sou') {
    const rank = ind.rank === 9 ? 1 : ind.rank + 1;
    return { suit: ind.suit, rank, id: '' };
  }
  if (ind.suit === 'wind') {
    const rank = ind.rank === 4 ? 1 : ind.rank + 1;
    return { suit: 'wind', rank, id: '' };
  }
  const rank = ind.rank === 3 ? 1 : ind.rank + 1;
  return { suit: 'dragon', rank, id: '' };
}

export function countDora(allTiles: Tile[], indicators: Tile[]): number {
  const counts = countTiles(allTiles);
  let total = 0;
  for (const ind of indicators) {
    const dora = doraFromIndicator(ind);
    total += counts[tileKey(dora)] || 0;
  }
  return total;
}
