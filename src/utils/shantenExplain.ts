import { Tile } from '../types/mahjong';
// re-exporting algorithm breakdowns does not require importing calcShanten

function tileIndex(tile: Tile): number {
  const base: Record<Tile['suit'], number> = {
    man: 0,
    pin: 9,
    sou: 18,
    wind: 27,
    dragon: 31,
  };
  return base[tile.suit] + tile.rank - 1;
}

export function calcStandardDetail(hand: Tile[], openMelds = 0) {
  const counts = new Array(34).fill(0);
  for (const t of hand) counts[tileIndex(t)]++;
  let melds = 0;
  let pairs = 0; // pairs actually found in the hand
  // The pair count used in the shanten formula is capped at one.
  // Extra pairs are still tracked in `pairs` for explanation output.
  let pairForShanten = 0;
  let taatsu = 0;

  for (let i = 0; i < 34; i++) {
    while (counts[i] >= 3) {
      counts[i] -= 3;
      melds++;
    }
  }
  for (let i = 0; i < 27; i++) {
    while (counts[i] > 0 && i % 9 <= 6 && counts[i + 1] > 0 && counts[i + 2] > 0) {
      counts[i]--;
      counts[i + 1]--;
      counts[i + 2]--;
      melds++;
    }
  }
  for (let i = 0; i < 34; i++) {
    while (counts[i] >= 2) {
      counts[i] -= 2;
      pairs++;
    }
  }
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
  pairForShanten = Math.min(pairs, 1);
  melds += openMelds;
  if (taatsu > 4 - melds) taatsu = 4 - melds;
  const shanten = 8 - melds * 2 - taatsu - pairForShanten;
  return { shanten, melds, pairs, pairForShanten, taatsu };
}

export function calcChiitoiDetail(hand: Tile[]) {
  const counts = new Array(34).fill(0);
  for (const t of hand) counts[tileIndex(t)]++;
  let pairCount = 0;
  let unique = 0;
  for (const c of counts) {
    if (c >= 2) pairCount++;
    if (c > 0) unique++;
  }
  const shanten = 6 - pairCount + Math.max(0, 7 - unique);
  return { shanten, pairCount, unique };
}

export function calcKokushiDetail(hand: Tile[]) {
  const yaochu = new Set([
    'man-1',
    'man-9',
    'pin-1',
    'pin-9',
    'sou-1',
    'sou-9',
    'wind-1',
    'wind-2',
    'wind-3',
    'wind-4',
    'dragon-1',
    'dragon-2',
    'dragon-3',
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
  const shanten = 13 - unique - (hasPair ? 1 : 0);
  return { shanten, unique, hasPair };
}

export function calcShantenDetail(hand: Tile[], openMelds = 0) {
  return {
    standard: calcStandardDetail(hand, openMelds),
    chiitoi: calcChiitoiDetail(hand),
    kokushi: calcKokushiDetail(hand),
  };
}

export function explainShanten(hand: Tile[], openMelds = 0) {
  const detail = calcShantenDetail(hand, openMelds);
  const { standard, chiitoi, kokushi } = detail;
  const shanten = Math.min(standard.shanten, chiitoi.shanten, kokushi.shanten);
  let label = '';
  let explanation = '';

  if (chiitoi.shanten === shanten && shanten < standard.shanten) {
    label = `七対子${shanten}向聴`;
    explanation =
      `七対子形: 対子${chiitoi.pairCount}組、` +
      `異なる牌${chiitoi.unique}種 -> ` +
      `6 - ${chiitoi.pairCount} + max(0, 7 - ${chiitoi.unique}) = ${chiitoi.shanten}`;
  } else if (kokushi.shanten === shanten && shanten < standard.shanten) {
    label = `国士無双${shanten}向聴`;
    explanation =
      `国士無双形: 幺九牌${kokushi.unique}種` +
      `${kokushi.hasPair ? '、対子あり' : ''} -> ` +
      `13 - ${kokushi.unique} - ${kokushi.hasPair ? 1 : 0} = ${kokushi.shanten}`;
  } else {
    explanation =
      `標準形: 面子${standard.melds}組、` +
      `対子${standard.pairs}組、ターツ${standard.taatsu}組 -> ` +
      `8 - ${standard.melds}*2 - ${standard.taatsu} - ${standard.pairForShanten} = ${standard.shanten}`;
  }

  if (shanten === 0) {
    explanation = `聴牌。${explanation}`;
  }

  return { shanten, explanation, label };
}

