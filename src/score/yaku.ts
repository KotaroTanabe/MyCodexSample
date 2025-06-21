import { Tile } from '../types/mahjong';

export interface Yaku {
  name: string;
  han: number;
}

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

export function isTanyao(tiles: Tile[]): boolean {
  return tiles.every(t =>
    (t.suit === 'man' || t.suit === 'pin' || t.suit === 'sou') && t.rank > 1 && t.rank < 9,
  );
}

function countDragonTriplets(counts: Record<string, number>): number {
  let yakuhai = 0;
  for (let r = 1; r <= 3; r++) {
    const key = `dragon-${r}`;
    const c = counts[key] || 0;
    yakuhai += Math.floor(c / 3);
  }
  return yakuhai;
}

function canFormSequencesOnly(
  counts: Record<string, number>,
  memo = new Map<string, boolean>(),
): boolean {
  const serialized = JSON.stringify(counts);
  if (memo.has(serialized)) return memo.get(serialized)!;

  const keys = Object.keys(counts).filter(k => counts[k] > 0);
  if (keys.length === 0) {
    memo.set(serialized, true);
    return true;
  }

  const first = keys[0];
  const [suit, rankStr] = first.split('-');
  const rank = Number(rankStr);

  if (
    (suit === 'man' || suit === 'pin' || suit === 'sou') &&
    counts[`${suit}-${rank + 1}`] > 0 &&
    counts[`${suit}-${rank + 2}`] > 0
  ) {
    counts[first]--;
    counts[`${suit}-${rank + 1}`]--;
    counts[`${suit}-${rank + 2}`]--;
    if (canFormSequencesOnly(counts, memo)) {
      counts[first]++;
      counts[`${suit}-${rank + 1}`]++;
      counts[`${suit}-${rank + 2}`]++;
      memo.set(serialized, true);
      return true;
    }
    counts[first]++;
    counts[`${suit}-${rank + 1}`]++;
    counts[`${suit}-${rank + 2}`]++;
  }

  memo.set(serialized, false);
  return false;
}

export function isChiitoitsu(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const counts = countTiles(tiles);
  const keys = Object.keys(counts);
  if (keys.length !== 7) return false;
  return keys.every(k => counts[k] === 2);
}

export function isPinfu(tiles: Tile[]): boolean {
  if (isChiitoitsu(tiles)) return false;
  const counts = countTiles(tiles);
  for (const key of Object.keys(counts)) {
    if (counts[key] >= 2) {
      const [suit] = key.split('-');
      if (suit === 'wind' || suit === 'dragon') continue;
      counts[key] -= 2;
      if (canFormSequencesOnly(counts)) {
        counts[key] += 2;
        return true;
      }
      counts[key] += 2;
    }
  }
  return false;
}

export function isIipeiko(tiles: Tile[]): boolean {
  if (!isWinningHand(tiles)) return false;
  const counts = countTiles(tiles);
  for (const suit of ['man', 'pin', 'sou'] as const) {
    for (let r = 1; r <= 7; r++) {
      const c = Math.min(
        counts[`${suit}-${r}`] || 0,
        counts[`${suit}-${r + 1}`] || 0,
        counts[`${suit}-${r + 2}`] || 0,
      );
      if (c >= 2) return true;
    }
  }
  return false;
}

function canFormSets(counts: Record<string, number>, memo = new Map<string, boolean>()): boolean {
  const serialized = JSON.stringify(counts);
  if (memo.has(serialized)) return memo.get(serialized)!;

  const keys = Object.keys(counts).filter(k => counts[k] > 0);
  if (keys.length === 0) return true;

  const first = keys[0];
  const [suit, rankStr] = first.split('-');
  const rank = Number(rankStr);

  // try triplet
  if (counts[first] >= 3) {
    counts[first] -= 3;
    if (canFormSets(counts, memo)) {
      counts[first] += 3;
      memo.set(serialized, true);
      return true;
    }
    counts[first] += 3;
  }

  // try sequence
  if ((suit === 'man' || suit === 'pin' || suit === 'sou') && counts[`${suit}-${rank+1}`] > 0 && counts[`${suit}-${rank+2}`] > 0) {
    counts[first]--; counts[`${suit}-${rank+1}`]--; counts[`${suit}-${rank+2}`]--;
    if (canFormSets(counts, memo)) {
      counts[first]++; counts[`${suit}-${rank+1}`]++; counts[`${suit}-${rank+2}`]++;
      memo.set(serialized, true);
      return true;
    }
    counts[first]++; counts[`${suit}-${rank+1}`]++; counts[`${suit}-${rank+2}`]++;
  }

  memo.set(serialized, false);
  return false;
}

export function isWinningHand(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  if (isChiitoitsu(tiles)) return true;
  const counts = countTiles(tiles);
  const tileKeys = Object.keys(counts);
  for (const key of tileKeys) {
    if (counts[key] >= 2) {
      counts[key] -= 2;
      if (canFormSets(counts)) {
        counts[key] += 2;
        return true;
      }
      counts[key] += 2;
    }
  }
  return false;
}

export function detectYaku(tiles: Tile[]): Yaku[] {
  const result: Yaku[] = [];
  const counts = countTiles(tiles);
  if (isChiitoitsu(tiles)) {
    result.push({ name: 'Chiitoitsu', han: 2 });
  }
  if (isPinfu(tiles)) {
    result.push({ name: 'Pinfu', han: 1 });
  }
  if (isIipeiko(tiles)) {
    result.push({ name: 'Iipeiko', han: 1 });
  }
  if (isTanyao(tiles)) {
    result.push({ name: 'Tanyao', han: 1 });
  }
  const yakuhai = countDragonTriplets(counts);
  for (let i = 0; i < yakuhai; i++) {
    result.push({ name: 'Yakuhai', han: 1 });
  }
  return result;
}
