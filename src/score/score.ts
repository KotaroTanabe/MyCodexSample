import { Tile, Meld } from '../types/mahjong';
import { Yaku } from './yaku';

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

function parseKey(key: string): Tile {
  const [suit, rankStr] = key.split('-');
  return { suit: suit as Tile['suit'], rank: Number(rankStr), id: '' };
}

interface ParsedMeld {
  type: 'chi' | 'pon';
  tiles: Tile[];
}

function isTerminalOrHonor(tile: Tile): boolean {
  return (
    tile.suit === 'wind' ||
    tile.suit === 'dragon' ||
    tile.rank === 1 ||
    tile.rank === 9
  );
}

function findMelds(counts: Record<string, number>): ParsedMeld[] | null {
  const keys = Object.keys(counts).filter(k => counts[k] > 0).sort();
  if (keys.length === 0) return [];

  const first = keys[0];
  const [suit, rankStr] = first.split('-');
  const rank = Number(rankStr);

  // try triplet
  if (counts[first] >= 3) {
    counts[first] -= 3;
    const rest = findMelds(counts);
    counts[first] += 3;
    if (rest) {
      return [{ type: 'pon', tiles: [parseKey(first), parseKey(first), parseKey(first)] }, ...rest];
    }
  }

  // try sequence
  if (
    (suit === 'man' || suit === 'pin' || suit === 'sou') &&
    counts[`${suit}-${rank + 1}`] > 0 &&
    counts[`${suit}-${rank + 2}`] > 0
  ) {
    counts[first]--;
    counts[`${suit}-${rank + 1}`]--;
    counts[`${suit}-${rank + 2}`]--;
    const rest = findMelds(counts);
    counts[first]++;
    counts[`${suit}-${rank + 1}`]++;
    counts[`${suit}-${rank + 2}`]++;
    if (rest) {
      return [
        {
          type: 'chi',
          tiles: [parseKey(first), parseKey(`${suit}-${rank + 1}`), parseKey(`${suit}-${rank + 2}`)],
        },
        ...rest,
      ];
    }
  }

  return null;
}

function decomposeHand(tiles: Tile[]): { pair: Tile[]; melds: ParsedMeld[] } | null {
  const counts = countTiles(tiles);
  const tileKeys = Object.keys(counts);
  for (const key of tileKeys) {
    if (counts[key] >= 2) {
      counts[key] -= 2;
      const melds = findMelds(counts);
      counts[key] += 2;
      if (melds) {
        return { pair: [parseKey(key), parseKey(key)], melds };
      }
    }
  }
  return null;
}

export function calculateFu(hand: Tile[], melds: Meld[] = []): number {
  const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
  const parsed = decomposeHand(allTiles);
  if (!parsed) return 0;

  let fu = 20; // base fu for a winning hand

  // pair fu (only dragons considered value tiles here)
  if (parsed.pair[0].suit === 'dragon') {
    fu += 2;
  }

  for (const meld of parsed.melds) {
    if (meld.type === 'pon') {
      fu += isTerminalOrHonor(meld.tiles[0]) ? 8 : 4;
    }
  }

  // round up to nearest 10
  fu = Math.ceil(fu / 10) * 10;
  return fu;
}

function doraFromIndicator(indicator: Tile): Tile {
  if (indicator.suit === 'man' || indicator.suit === 'pin' || indicator.suit === 'sou') {
    const rank = indicator.rank === 9 ? 1 : indicator.rank + 1;
    return { suit: indicator.suit, rank, id: '' };
  }
  if (indicator.suit === 'wind') {
    const rank = indicator.rank === 4 ? 1 : indicator.rank + 1;
    return { suit: 'wind', rank, id: '' };
  }
  // dragon
  const rank = indicator.rank === 3 ? 1 : indicator.rank + 1;
  return { suit: 'dragon', rank, id: '' };
}

function countDora(allTiles: Tile[], indicators: Tile[]): number {
  const counts = countTiles(allTiles);
  let total = 0;
  for (const ind of indicators) {
    const dora = doraFromIndicator(ind);
    total += counts[tileKey(dora)] || 0;
  }
  return total;
}

export function calculateScore(
  hand: Tile[],
  melds: Meld[],
  yaku: Yaku[],
  doraIndicators: Tile[] = [],
): { han: number; fu: number; points: number } {
  const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
  const dora = countDora(allTiles, doraIndicators);
  const han = yaku.reduce((sum, y) => sum + y.han, 0) + dora;
  const fu = calculateFu(hand, melds);
  const base = fu * Math.pow(2, han + 2);
  const points = base;
  return { han, fu, points };
}
