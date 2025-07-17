import { Tile } from '../types/mahjong';
import { calcShanten } from './shanten';
import { countUnseenTiles } from './unseen';

function baseKeys(): string[] {
  const keys: string[] = [];
  for (const suit of ['man', 'pin', 'sou'] as const) {
    for (let r = 1; r <= 9; r++) keys.push(`${suit}-${r}`);
  }
  for (let r = 1; r <= 4; r++) keys.push(`wind-${r}`);
  for (let r = 1; r <= 3; r++) keys.push(`dragon-${r}`);
  return keys;
}

export interface UkeireResult {
  counts: Record<string, number>;
  types: number;
  total: number;
}

/**
 * Count unseen tiles that reduce shanten if drawn.
 * `openMelds` should be the current number of melds.
 */
export function countUkeireTiles(
  hand: Tile[],
  openMelds = 0,
  indicators: Tile[] = [],
  river: Tile[] = [],
  meldTiles: Tile[] = [],
): UkeireResult {
  const unseen = countUnseenTiles(hand, indicators, river, meldTiles);
  const base = calcShanten(hand, openMelds);
  const baseValue = Math.min(base.standard, base.chiitoi, base.kokushi);

  const counts: Record<string, number> = {};
  const keys = baseKeys();
  for (const key of keys) {
    const remain = unseen[key];
    if (!remain) continue;
    const [suit, rankStr] = key.split('-');
    const tile: Tile = {
      suit: suit as Tile['suit'],
      rank: parseInt(rankStr, 10),
      id: 'tmp',
    };
    const newHand = [...hand, tile];
    let best = Infinity;
    for (const t of newHand) {
      const after = newHand.filter(x => x !== t);
      const s = calcShanten(after, openMelds);
      const val = Math.min(s.standard, s.chiitoi, s.kokushi);
      if (val < best) best = val;
    }
    if (best < baseValue) counts[key] = remain;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, types: Object.keys(counts).length, total };
}
