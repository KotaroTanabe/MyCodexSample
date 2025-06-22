import { Tile, Meld } from '../types/mahjong';
import { tileToKanji } from '../utils/tileString';

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

  if (counts[first] >= 3) {
    counts[first] -= 3;
    const rest = findMelds(counts);
    counts[first] += 3;
    if (rest) {
      return [{ type: 'pon', tiles: [parseKey(first), parseKey(first), parseKey(first)] }, ...rest];
    }
  }

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
        { type: 'chi', tiles: [parseKey(first), parseKey(`${suit}-${rank + 1}`), parseKey(`${suit}-${rank + 2}`)] },
        ...rest,
      ];
    }
  }

  return null;
}

function tilesToString(tiles: Tile[]): string {
  return tiles.map(tileToKanji).join('');
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

export function calculateFuDetail(
  hand: Tile[],
  melds: Meld[] = [],
  seatWind = 1,
  roundWind = 1,
  winType: 'ron' | 'tsumo' = 'ron',
): { fu: number; steps: string[] } {
  const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
  const parsed = decomposeHand(allTiles);
  if (!parsed) return { fu: 0, steps: ['invalid hand'] };

  let fu = 20;
  const steps = ['基本符20'];

  if (winType === 'tsumo') {
    fu += 2;
    steps.push('ツモ符 +2');
  } else if (winType === 'ron' && melds.length === 0) {
    fu += 10;
    steps.push('面前ロン +10');
  }

  let pairFu = 0;
  if (parsed.pair[0].suit === 'dragon') {
    pairFu = 2;
  } else if (parsed.pair[0].suit === 'wind') {
    if (parsed.pair[0].rank === seatWind) pairFu += 2;
    if (parsed.pair[0].rank === roundWind) pairFu += 2;
  }
  if (pairFu > 0) {
    fu += pairFu;
    steps.push(`役牌の雀頭 +${pairFu}`);
  }

  for (const meld of parsed.melds) {
    if (meld.type === 'pon') {
      if (isTerminalOrHonor(meld.tiles[0])) {
        fu += 8;
        steps.push(`么九刻子 +8 (${tilesToString(meld.tiles)})`);
      } else {
        fu += 4;
        steps.push(`刻子 +4 (${tilesToString(meld.tiles)})`);
      }
    }
  }

  for (const meld of melds) {
    if (meld.type === 'kan') {
      const base = isTerminalOrHonor(meld.tiles[0]) ? 8 : 4;
      const kanFu = isTerminalOrHonor(meld.tiles[0]) ? 32 : 16;
      fu += kanFu - base;
      steps.push(`カンボーナス +${kanFu - base} (${tilesToString(meld.tiles)})`);
    }
  }

  const rounded = Math.ceil(fu / 10) * 10;
  if (rounded !== fu) {
    steps.push(`繰り上げて${rounded}符`);
  }
  return { fu: rounded, steps };
}
