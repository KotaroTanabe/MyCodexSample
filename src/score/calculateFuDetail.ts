import { Tile, Meld } from '../types/mahjong';
import { tileToKanji } from '../utils/tileString';
import { detectYaku } from './yaku';

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

  const yaku = detectYaku(allTiles, melds, { seatWind, roundWind });
  if (yaku.some(y => y.name === 'Chiitoitsu')) {
    return { fu: 25, steps: ['七対子25符'] };
  }

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

  const remainingOpen = [...melds];
  const seatIndex = seatWind - 1;

  const takeOpen = (m: ParsedMeld): Meld | undefined => {
    const idx = remainingOpen.findIndex(o => {
      if (o.type === 'chi' && m.type === 'chi') {
        const a = o.tiles.map(tileKey).sort().join(',');
        const b = m.tiles.map(tileKey).sort().join(',');
        return a === b;
      }
      if (m.type === 'pon' && (o.type === 'pon' || o.type === 'kan')) {
        const key = tileKey(m.tiles[0]);
        return o.tiles.every(t => tileKey(t) === key);
      }
      return false;
    });
    if (idx >= 0) {
      return remainingOpen.splice(idx, 1)[0];
    }
    return undefined;
  };

  for (const meld of parsed.melds) {
    const open = takeOpen(meld);
    if (open) {
      if (open.type === 'pon') {
        const val = isTerminalOrHonor(open.tiles[0]) ? 4 : 2;
        const label = isTerminalOrHonor(open.tiles[0]) ? '明么九刻子' : '明刻子';
        fu += val;
        steps.push(`${label} +${val} (${tilesToString(open.tiles)})`);
      } else if (open.type === 'kan') {
        const closed = open.fromPlayer === seatIndex;
        const val = isTerminalOrHonor(open.tiles[0])
          ? closed
            ? 32
            : 16
          : closed
          ? 16
          : 8;
        const labelBase = closed ? '暗' : '明';
        const label = isTerminalOrHonor(open.tiles[0])
          ? `${labelBase}么九カン`
          : `${labelBase}カン`;
        fu += val;
        steps.push(`${label} +${val} (${tilesToString(open.tiles)})`);
      }
    } else if (meld.type === 'pon') {
      const val = isTerminalOrHonor(meld.tiles[0]) ? 8 : 4;
      const label = isTerminalOrHonor(meld.tiles[0]) ? '暗么九刻子' : '暗刻子';
      fu += val;
      steps.push(`${label} +${val} (${tilesToString(meld.tiles)})`);
    }
  }

  const rounded = Math.ceil(fu / 10) * 10;
  if (rounded !== fu) {
    steps.push(`繰り上げて${rounded}符`);
  }
  return { fu: rounded, steps };
}
