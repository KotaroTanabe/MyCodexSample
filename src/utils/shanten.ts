import { Tile } from '../types/mahjong';

function tileIndex(tile: Tile): number {
  const base: Record<Tile['suit'], number> = { man: 0, pin: 9, sou: 18, wind: 27, dragon: 31 };
  return base[tile.suit] + tile.rank - 1;
}

export function calcStandardShanten(hand: Tile[], openMelds = 0): number {
  const counts = new Array(34).fill(0);
  for (const t of hand) counts[tileIndex(t)]++;

  let minShanten = 8;
  const memo = new Set<string>();

  function dfs(idx: number, melds: number, pairs: number, taatsu: number) {
    while (idx < 34 && counts[idx] === 0) idx++;
    if (idx >= 34) {
      let t = taatsu + Math.max(0, pairs - 1);
      if (t > 4 - melds) t = 4 - melds;
      const shanten = 8 - melds * 2 - t - (pairs > 0 ? 1 : 0);
      if (shanten < minShanten) minShanten = shanten;
      return;
    }

    const key = `${counts.join(',')}|${idx}|${melds}|${pairs}|${taatsu}`;
    if (memo.has(key)) return;
    memo.add(key);

    if (counts[idx] >= 3) {
      counts[idx] -= 3;
      dfs(idx, melds + 1, pairs, taatsu);
      counts[idx] += 3;
    }

    if (idx < 27 && idx % 9 <= 6 && counts[idx + 1] > 0 && counts[idx + 2] > 0) {
      counts[idx]--;
      counts[idx + 1]--;
      counts[idx + 2]--;
      dfs(idx, melds + 1, pairs, taatsu);
      counts[idx]++;
      counts[idx + 1]++;
      counts[idx + 2]++;
    }

    if (counts[idx] >= 2) {
      counts[idx] -= 2;
      dfs(idx, melds, pairs + 1, taatsu);
      dfs(idx, melds, pairs, taatsu + 1);
      counts[idx] += 2;
    }

    if (idx < 27 && idx % 9 <= 7 && counts[idx + 1] > 0) {
      counts[idx]--;
      counts[idx + 1]--;
      dfs(idx, melds, pairs, taatsu + 1);
      counts[idx]++;
      counts[idx + 1]++;
    }

    if (idx < 27 && idx % 9 <= 6 && counts[idx + 2] > 0) {
      counts[idx]--;
      counts[idx + 2]--;
      dfs(idx, melds, pairs, taatsu + 1);
      counts[idx]++;
      counts[idx + 2]++;
    }

    counts[idx]--;
    dfs(idx, melds, pairs, taatsu);
    counts[idx]++;
  }

  dfs(0, openMelds, 0, 0);
  return minShanten;
}

export function calcChiitoiShanten(hand: Tile[]): number {
  const counts = new Array(34).fill(0);
  for (const t of hand) counts[tileIndex(t)]++;
  let pairCount = 0;
  let unique = 0;
  for (const c of counts) {
    if (c >= 2) pairCount++;
    if (c > 0) unique++;
  }
  return 6 - pairCount + Math.max(0, 7 - unique);
}

export function calcKokushiShanten(hand: Tile[]): number {
  const yaochu = new Set([
    'man-1', 'man-9', 'pin-1', 'pin-9', 'sou-1', 'sou-9',
    'wind-1', 'wind-2', 'wind-3', 'wind-4',
    'dragon-1', 'dragon-2', 'dragon-3',
  ]);
  const counts: Record<string, number> = {};
  for (const t of hand) {
    const key = `${t.suit}-${t.rank}`;
    if (yaochu.has(key)) {
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  const unique = Object.keys(counts).length;
  const hasPair = Object.values(counts).some(c => c >= 2);
  return 13 - unique - (hasPair ? 1 : 0);
}

export function calcShanten(hand: Tile[], openMelds = 0): {
  standard: number;
  chiitoi: number;
  kokushi: number;
} {
  return {
    standard: calcStandardShanten(hand, openMelds),
    chiitoi: calcChiitoiShanten(hand),
    kokushi: calcKokushiShanten(hand),
  };
}
