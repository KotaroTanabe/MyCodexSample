import { Tile } from '../types/mahjong';

function tileKey(t: Tile): string {
  return `${t.suit}-${t.rank}`;
}

function baseCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const suit of ['man', 'pin', 'sou'] as const) {
    for (let r = 1; r <= 9; r++) counts[`${suit}-${r}`] = 4;
  }
  for (let r = 1; r <= 4; r++) counts[`wind-${r}`] = 4;
  for (let r = 1; r <= 3; r++) counts[`dragon-${r}`] = 4;
  return counts;
}

/**
 * Count how many tiles of each type remain unseen.
 * Pass in the tiles currently visible to the player
 * (hand, dora indicators, discards and meld tiles).
 */
export function countUnseenTiles(
  hand: Tile[] = [],
  indicators: Tile[] = [],
  river: Tile[] = [],
  meldTiles: Tile[] = [],
): Record<string, number> {
  const counts = baseCounts();
  const visible = [...hand, ...indicators, ...river, ...meldTiles];
  for (const t of visible) {
    const key = tileKey(t);
    if (counts[key] !== undefined && counts[key] > 0) counts[key]--;
  }
  return counts;
}
