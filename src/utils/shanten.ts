import { Tile } from '../types/mahjong';

function tileIndex(tile: Tile): number {
  const base: Record<Tile['suit'], number> = { man: 0, pin: 9, sou: 18, wind: 27, dragon: 31 };
  return base[tile.suit] + tile.rank - 1;
}

export function calcStandardShanten(hand: Tile[], openMelds = 0): number {
  const counts = new Array(34).fill(0);
  for (const t of hand) counts[tileIndex(t)]++;
  let melds = 0;
  let pairs = 0;
  let taatsu = 0;

  // complete triples
  for (let i = 0; i < 34; i++) {
    while (counts[i] >= 3) {
      counts[i] -= 3;
      melds++;
    }
  }
  // complete sequences
  for (let i = 0; i < 27; i++) {
    while (counts[i] > 0 && i % 9 <= 6 && counts[i + 1] > 0 && counts[i + 2] > 0) {
      counts[i]--;
      counts[i + 1]--;
      counts[i + 2]--;
      melds++;
    }
  }
  // pairs for head
  for (let i = 0; i < 34; i++) {
    while (counts[i] >= 2) {
      counts[i] -= 2;
      pairs++;
    }
  }
  // incomplete sequences
  for (let i = 0; i < 27; i++) {
    while (counts[i] > 0 && i % 9 <= 7 && counts[i + 1] > 0) {
      counts[i]--;
      counts[i + 1]--;
      taatsu++;
    }
  }
  for (let i = 0; i < 27; i++) {
    while (counts[i] > 0 && i % 9 <= 6 && counts[i + 2] > 0) {
      counts[i]--;
      counts[i + 2]--;
      taatsu++;
    }
  }
  for (let i = 0; i < 34; i++) {
    while (counts[i] >= 2) {
      counts[i] -= 2;
      taatsu++;
    }
  }
  if (pairs > 1) pairs = 1;
  melds += openMelds;
  if (taatsu > 4 - melds) taatsu = 4 - melds;
  return 8 - melds * 2 - taatsu - pairs;
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
