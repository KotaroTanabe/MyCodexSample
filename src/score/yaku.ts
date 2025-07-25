import { Tile, Meld } from '../types/mahjong';
import { tileToKanji } from '../utils/tileString';

export interface ScoreYaku {
  name: string;
  han: number;
  /**
   * Additional detail for the yaku. Used mainly for Yakuhai to
   * differentiate which value tile provided the han.
   */
  detail?: string;
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

function doraFromIndicator(ind: Tile): Tile {
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

function countDora(allTiles: Tile[], indicators: Tile[]): number {
  const counts = countTiles(allTiles);
  let total = 0;
  for (const ind of indicators) {
    const dora = doraFromIndicator(ind);
    total += counts[tileKey(dora)] || 0;
  }
  total += allTiles.filter(t => t.red).length;
  return total;
}

export function isTanyao(tiles: Tile[]): boolean {
  return tiles.every(t =>
    (t.suit === 'man' || t.suit === 'pin' || t.suit === 'sou') && t.rank > 1 && t.rank < 9,
  );
}

function isChiitoitsu(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const counts = countTiles(tiles);
  const keys = Object.keys(counts);
  if (keys.length !== 7) return false;
  return keys.every(k => counts[k] === 2);
}

function isKokushi(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const yaochu = [
    'man-1', 'man-9', 'pin-1', 'pin-9', 'sou-1', 'sou-9',
    'wind-1', 'wind-2', 'wind-3', 'wind-4',
    'dragon-1', 'dragon-2', 'dragon-3',
  ];
  const counts = countTiles(tiles);
  // must consist solely of yaochu tiles
  if (Object.keys(counts).some(k => !yaochu.includes(k))) return false;
  let pairFound = false;
  for (const key of yaochu) {
    const c = counts[key] || 0;
    if (c === 0) return false;
    if (c === 2) {
      if (pairFound) return false;
      pairFound = true;
    } else if (c > 2) {
      return false;
    }
  }
  return pairFound;
}

function getYakuhaiDetails(
  counts: Record<string, number>,
  seatWind?: number,
  roundWind?: number,
): string[] {
  const details: string[] = [];
  for (let r = 1; r <= 3; r++) {
    const key = `dragon-${r}`;
    const triplets = Math.floor((counts[key] || 0) / 3);
    for (let i = 0; i < triplets; i++) {
      details.push(tileToKanji({ suit: 'dragon', rank: r, id: '' }));
    }
  }
  const windMap: Record<number, string> = { 1: '東', 2: '南', 3: '西', 4: '北' };
  if (seatWind) {
    const key = `wind-${seatWind}`;
    const triplets = Math.floor((counts[key] || 0) / 3);
    for (let i = 0; i < triplets; i++) {
      details.push(`自風 ${windMap[seatWind]}`);
      if (roundWind === seatWind) {
        // ダブ風牌は2翻になるため、もう1回加算する
        details.push(`場風 ${windMap[seatWind]}`);
      }
    }
  }
  if (roundWind && roundWind !== seatWind) {
    const key = `wind-${roundWind}`;
    const triplets = Math.floor((counts[key] || 0) / 3);
    for (let i = 0; i < triplets; i++) {
      details.push(`場風 ${windMap[roundWind]}`);
    }
  }
  return details;
}

function _canFormSets(counts: Record<string, number>, memo = new Map<string, boolean>()): boolean {
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
    if (_canFormSets(counts, memo)) {
      counts[first] += 3;
      memo.set(serialized, true);
      return true;
    }
    counts[first] += 3;
  }

  // try sequence
  if ((suit === 'man' || suit === 'pin' || suit === 'sou') && counts[`${suit}-${rank+1}`] > 0 && counts[`${suit}-${rank+2}`] > 0) {
    counts[first]--; counts[`${suit}-${rank+1}`]--; counts[`${suit}-${rank+2}`]--;
    if (_canFormSets(counts, memo)) {
      counts[first]++; counts[`${suit}-${rank+1}`]++; counts[`${suit}-${rank+2}`]++;
      memo.set(serialized, true);
      return true;
    }
    counts[first]++; counts[`${suit}-${rank+1}`]++; counts[`${suit}-${rank+2}`]++;
  }

  memo.set(serialized, false);
  return false;
}

interface ParsedMeld {
  type: 'chi' | 'pon';
  tiles: Tile[];
}

function parseKey(key: string): Tile {
  const [suit, rankStr] = key.split('-');
  return { suit: suit as Tile['suit'], rank: Number(rankStr), id: '' };
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

  if ((suit === 'man' || suit === 'pin' || suit === 'sou') && counts[`${suit}-${rank+1}`] > 0 && counts[`${suit}-${rank+2}`] > 0) {
    counts[first]--;
    counts[`${suit}-${rank+1}`]--;
    counts[`${suit}-${rank+2}`]--;
    const rest = findMelds(counts);
    counts[first]++;
    counts[`${suit}-${rank+1}`]++;
    counts[`${suit}-${rank+2}`]++;
    if (rest) {
      return [{ type: 'chi', tiles: [parseKey(first), parseKey(`${suit}-${rank+1}`), parseKey(`${suit}-${rank+2}`)] }, ...rest];
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

function isPinfuHand(tiles: Tile[]): boolean {
  const parsed = decomposeHand(tiles);
  if (!parsed) return false;
  if (parsed.melds.some(m => m.type !== 'chi')) return false;
  const pairSuit = parsed.pair[0].suit;
  if (pairSuit === 'dragon' || pairSuit === 'wind') return false;
  return true;
}

function isIipeikoHand(tiles: Tile[]): boolean {
  const parsed = decomposeHand(tiles);
  if (!parsed) return false;
  const seqs = parsed.melds.filter(m => m.type === 'chi').map(m => m.tiles.map(tileKey).join(','));
  const counts: Record<string, number> = {};
  for (const s of seqs) {
    counts[s] = (counts[s] || 0) + 1;
    if (counts[s] === 2) return true;
  }
  return false;
}

function isTerminalOrHonor(tile: Tile): boolean {
  return (
    tile.suit === 'wind' ||
    tile.suit === 'dragon' ||
    tile.rank === 1 ||
    tile.rank === 9
  );
}

function isToitoi(tiles: Tile[]): boolean {
  const parsed = decomposeHand(tiles);
  return !!parsed && parsed.melds.every(m => m.type === 'pon');
}

function countConcealedTriplets(parsed: { melds: ParsedMeld[] }, melds: Meld[]): number {
  const totalTriplets = parsed.melds.filter(m => m.type === 'pon').length;
  const openTriplets = melds.filter(m => m.type === 'pon' || m.type === 'kan').length;
  return totalTriplets - openTriplets;
}

function isSuuAnkou(parsed: { melds: ParsedMeld[] }, melds: Meld[]): boolean {
  return countConcealedTriplets(parsed, melds) >= 4;
}

function isDaisangen(counts: Record<string, number>): boolean {
  for (let r = 1; r <= 3; r++) {
    if ((counts[`dragon-${r}`] || 0) < 3) return false;
  }
  return true;
}

function isShousangen(counts: Record<string, number>): boolean {
  let trip = 0;
  let pair = 0;
  for (let r = 1; r <= 3; r++) {
    const c = counts[`dragon-${r}`] || 0;
    if (c >= 3) trip++;
    else if (c === 2) pair++;
  }
  return trip === 2 && pair === 1;
}

function isDaisuushii(counts: Record<string, number>): boolean {
  for (let r = 1; r <= 4; r++) {
    if ((counts[`wind-${r}`] || 0) < 3) return false;
  }
  return true;
}

function isShousuushii(counts: Record<string, number>): boolean {
  let trip = 0;
  let pair = 0;
  for (let r = 1; r <= 4; r++) {
    const c = counts[`wind-${r}`] || 0;
    if (c >= 3) trip++;
    else if (c === 2) pair++;
  }
  return trip === 3 && pair === 1;
}

function isTsuuiisou(tiles: Tile[]): boolean {
  return tiles.every(t => t.suit === 'wind' || t.suit === 'dragon');
}

function isChinroutou(tiles: Tile[]): boolean {
  return tiles.every(t => (t.suit === 'man' || t.suit === 'pin' || t.suit === 'sou') && (t.rank === 1 || t.rank === 9));
}

function isRyuuiisou(tiles: Tile[]): boolean {
  const allowed = new Set(['sou-2','sou-3','sou-4','sou-6','sou-8','dragon-2']);
  return tiles.every(t => allowed.has(tileKey(t)));
}

function isChuurenPoutou(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  const suits = new Set(tiles.map(t => t.suit));
  if (suits.size !== 1) return false;
  const suit = tiles[0].suit;
  if (suit === 'wind' || suit === 'dragon') return false;
  const counts = countTiles(tiles);
  const need: Record<number, number> = {
    1: 3,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
    9: 3,
  };
  let extra = 0;
  for (let r = 1; r <= 9; r++) {
    const k = `${suit}-${r}`;
    const c = counts[k] || 0;
    const needCount = need[r as keyof typeof need] || 0;
    if (c < needCount) return false;
    extra += c - needCount;
  }
  return extra === 1;
}

function isSanankou(parsed: { melds: ParsedMeld[] }, melds: Meld[]): boolean {
  return countConcealedTriplets(parsed, melds) >= 3;
}

function isSanshokuDoujun(parsed: { melds: ParsedMeld[] }): boolean {
  const seqMap: Record<number, Set<string>> = {};
  for (const m of parsed.melds) {
    if (m.type !== 'chi') continue;
    const suit = m.tiles[0].suit;
    const ranks = m.tiles.map(t => t.rank).sort((a, b) => a - b);
    const start = ranks[0];
    if (suit === 'man' || suit === 'pin' || suit === 'sou') {
      seqMap[start] = seqMap[start] || new Set();
      seqMap[start].add(suit);
    }
  }
  return Object.values(seqMap).some(set => set.has('man') && set.has('pin') && set.has('sou'));
}

function isSanDoukou(parsed: { melds: ParsedMeld[] }): boolean {
  const tripMap: Record<number, Set<string>> = {};
  for (const m of parsed.melds) {
    if (m.type !== 'pon') continue;
    const suit = m.tiles[0].suit;
    const rank = m.tiles[0].rank;
    if (suit === 'man' || suit === 'pin' || suit === 'sou') {
      tripMap[rank] = tripMap[rank] || new Set();
      tripMap[rank].add(suit);
    }
  }
  return Object.values(tripMap).some(set => set.has('man') && set.has('pin') && set.has('sou'));
}

function isIttsu(parsed: { melds: ParsedMeld[] }): boolean {
  const seqMap: Record<string, Set<number>> = {};
  for (const m of parsed.melds) {
    if (m.type !== 'chi') continue;
    const suit = m.tiles[0].suit;
    const ranks = m.tiles.map(t => t.rank).sort((a, b) => a - b);
    const start = ranks[0];
    if (suit === 'man' || suit === 'pin' || suit === 'sou') {
      seqMap[suit] = seqMap[suit] || new Set();
      seqMap[suit].add(start);
    }
  }
  return Object.values(seqMap).some(set => set.has(1) && set.has(4) && set.has(7));
}

function isChanta(parsed: { pair: Tile[]; melds: ParsedMeld[] }): boolean {
  if (!parsed.pair.every(isTerminalOrHonor)) return false;
  return parsed.melds.every(m => m.tiles.some(isTerminalOrHonor));
}

function isJunchan(parsed: { pair: Tile[]; melds: ParsedMeld[] }): boolean {
  if (!isChanta(parsed)) return false;
  const tiles = [...parsed.pair, ...parsed.melds.flatMap(m => m.tiles)];
  return tiles.every(t => t.suit !== 'wind' && t.suit !== 'dragon');
}

function countKans(melds: Meld[]): number {
  return melds.filter(m => m.type === 'kan').length;
}

function isSanKantsu(melds: Meld[]): boolean {
  return countKans(melds) >= 3;
}

function isSuKantsu(melds: Meld[]): boolean {
  return countKans(melds) >= 4;
}

function isHonitsu(tiles: Tile[]): boolean {
  const suits = new Set(tiles.filter(t => t.suit === 'man' || t.suit === 'pin' || t.suit === 'sou').map(t => t.suit));
  const hasHonor = tiles.some(t => t.suit === 'wind' || t.suit === 'dragon');
  return suits.size === 1 && hasHonor;
}

function isChinitsu(tiles: Tile[]): boolean {
  const suits = new Set(tiles.filter(t => t.suit === 'man' || t.suit === 'pin' || t.suit === 'sou').map(t => t.suit));
  const hasHonor = tiles.some(t => t.suit === 'wind' || t.suit === 'dragon');
  return suits.size === 1 && !hasHonor;
}

function canFormLimitedSets(
  counts: Record<string, number>,
  need: number,
  memo = new Map<string, boolean>(),
): boolean {
  const serialized = JSON.stringify({ counts, need });
  if (memo.has(serialized)) return memo.get(serialized)!;
  if (need === 0) {
    const remaining = Object.values(counts).every(c => c === 0);
    memo.set(serialized, remaining);
    return remaining;
  }

  const keys = Object.keys(counts).filter(k => counts[k] > 0);
  if (keys.length === 0) {
    memo.set(serialized, false);
    return false;
  }

  const first = keys[0];
  const [suit, rankStr] = first.split('-');
  const rank = Number(rankStr);

  // try triplet
  if (counts[first] >= 3) {
    counts[first] -= 3;
    if (canFormLimitedSets(counts, need - 1, memo)) {
      counts[first] += 3;
      memo.set(serialized, true);
      return true;
    }
    counts[first] += 3;
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
    if (canFormLimitedSets(counts, need - 1, memo)) {
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

export function isWinningHand(concealed: Tile[], melds: Meld[] = []): boolean {
  const meldTiles = melds.flatMap(m =>
    m.type === 'kan' ? m.tiles.slice(0, 3) : m.tiles,
  );
  const allTiles = [...concealed, ...meldTiles];
  if (allTiles.length !== 14) return false;
  if (melds.length === 0 && (isChiitoitsu(allTiles) || isKokushi(allTiles)))
    return true;

  const counts = countTiles(concealed);
  const tileKeys = Object.keys(counts);
  const needSets = 4 - melds.length;
  for (const key of tileKeys) {
    if (counts[key] >= 2) {
      counts[key] -= 2;
      if (canFormLimitedSets(counts, needSets)) {
        counts[key] += 2;
        return true;
      }
      counts[key] += 2;
    }
  }
  return false;
}

export function detectYaku(
  concealed: Tile[],
  melds: Meld[] = [],
  opts?: {
    isTsumo?: boolean;
    isRiichi?: boolean;
    doubleRiichi?: boolean;
    seatWind?: number;
    roundWind?: number;
    ippatsu?: boolean;
    rinshan?: boolean;
    chankan?: boolean;
    haitei?: boolean;
    houtei?: boolean;
    tenhou?: boolean;
    chiihou?: boolean;
    renhou?: boolean;
    uraDoraIndicators?: Tile[];
  },
): ScoreYaku[] {
  const allTiles = [...concealed, ...melds.flatMap(m => m.tiles)];
  const result: ScoreYaku[] = [];
  const counts = countTiles(allTiles);
  const parsed = decomposeHand(allTiles);
  const isClosed = melds.length === 0;

  if (isChiitoitsu(allTiles)) {
    result.push({ name: 'Chiitoitsu', han: 2 });
  }
  if (isKokushi(allTiles)) {
    result.push({ name: 'Kokushi Musou', han: 13 });
  }
  if (isTanyao(allTiles)) {
    result.push({ name: 'Tanyao', han: 1 });
  }
  if (parsed && isToitoi(allTiles)) {
    result.push({ name: 'Toitoi', han: 2 });
  }
  if (parsed && isSanankou(parsed, melds)) {
    result.push({ name: 'Sanankou', han: 2 });
  }
  if (parsed && isSanshokuDoujun(parsed)) {
    result.push({ name: 'Sanshoku Doujun', han: isClosed ? 2 : 1 });
  }
  if (parsed && isSanDoukou(parsed)) {
    result.push({ name: 'San Doukou', han: 2 });
  }
  if (isDaisangen(counts)) {
    result.push({ name: 'Daisangen', han: 13 });
  } else if (isShousangen(counts)) {
    result.push({ name: 'Shousangen', han: 2 });
  }
  if (parsed && isSuuAnkou(parsed, melds)) {
    result.push({ name: 'Suu Ankou', han: 13 });
  }
  if (isDaisuushii(counts)) {
    result.push({ name: 'Daisuushii', han: 13 });
  } else if (isShousuushii(counts)) {
    result.push({ name: 'Shousuushii', han: 13 });
  }
  if (isTsuuiisou(allTiles)) {
    result.push({ name: 'Tsuuiisou', han: 13 });
  }
  if (isChinroutou(allTiles)) {
    result.push({ name: 'Chinroutou', han: 13 });
  }
  if (isRyuuiisou(allTiles)) {
    result.push({ name: 'Ryuuiisou', han: 13 });
  }
  if (isClosed && isChuurenPoutou(allTiles)) {
    result.push({ name: 'Chuuren Poutou', han: 13 });
  }
  if (parsed && isIttsu(parsed)) {
    result.push({ name: 'Ittsu', han: isClosed ? 2 : 1 });
  }
  if (parsed && isJunchan(parsed)) {
    result.push({ name: 'Junchan', han: isClosed ? 3 : 2 });
  } else if (parsed && isChanta(parsed)) {
    result.push({ name: 'Chanta', han: isClosed ? 2 : 1 });
  }
  if (isClosed && isPinfuHand(allTiles)) {
    result.push({ name: 'Pinfu', han: 1 });
  }
  if (isClosed && isIipeikoHand(allTiles)) {
    result.push({ name: 'Iipeiko', han: 1 });
  }
  if (opts?.isTsumo && isClosed) {
    result.push({ name: 'Menzen Tsumo', han: 1 });
  }
  if (opts?.isRiichi && isClosed) {
    result.push({ name: 'Riichi', han: 1 });
  }
  if (opts?.doubleRiichi && isClosed) {
    result.push({ name: 'Double Riichi', han: 2 });
  }
  if (opts?.ippatsu && opts?.isRiichi && isClosed) {
    result.push({ name: 'Ippatsu', han: 1 });
  }
  if (opts?.rinshan) {
    result.push({ name: 'Rinshan Kaihou', han: 1 });
  }
  if (opts?.chankan) {
    result.push({ name: 'Chankan', han: 1 });
  }
  if (opts?.haitei) {
    result.push({ name: 'Haitei', han: 1 });
  }
  if (opts?.houtei) {
    result.push({ name: 'Houtei', han: 1 });
  }
  if (opts?.tenhou) {
    result.push({ name: 'Tenhou', han: 13 });
  }
  if (opts?.chiihou) {
    result.push({ name: 'Chiihou', han: 13 });
  }
  if (opts?.renhou) {
    result.push({ name: 'Renhou', han: 5 });
  }
  if (isChinitsu(allTiles)) {
    result.push({ name: 'Chinitsu', han: isClosed ? 6 : 5 });
  } else if (isHonitsu(allTiles)) {
    result.push({ name: 'Honitsu', han: isClosed ? 3 : 2 });
  }
  if (isSuKantsu(melds)) {
    result.push({ name: 'Su Kantsu', han: 13 });
  } else if (isSanKantsu(melds)) {
    result.push({ name: 'San Kantsu', han: 2 });
  }
  const yakuhai = getYakuhaiDetails(
    counts,
    opts?.seatWind,
    opts?.roundWind,
  );
  for (const d of yakuhai) {
    result.push({ name: 'Yakuhai', han: 1, detail: d });
  }
  if (opts?.uraDoraIndicators && opts?.isRiichi) {
    const count = countDora(allTiles, opts.uraDoraIndicators);
    for (let i = 0; i < count; i++) {
      result.push({ name: 'Ura Dora', han: 1 });
    }
  }
  return result;
}
