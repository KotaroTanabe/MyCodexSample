import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { getValidCallOptions, selectMeldTiles } from './meld';
import { isLeftOf } from './table';
import { calcShanten } from './shanten';
import { canDiscardTile } from '../components/Player';
import { countUkeireTiles } from './ukeire';

/**
 * Choose an AI call action based on available options.
 * Kan is always taken. Pon/Chi are chosen only if they
 * improve the player's shanten number.
 */
export function chooseAICallOption(
  player: PlayerState,
  tile: Tile,
  discarderSeat: number,
): MeldType | 'pass' {
  const options = getValidCallOptions(player, tile).filter(
    o => o !== 'pass',
  ) as MeldType[];
  const filtered = isLeftOf(player.seat, discarderSeat)
    ? options
    : options.filter(o => o !== 'chi');
  if (filtered.includes('kan')) return 'kan';

  const base = calcShanten(player.hand, player.melds.length);
  const baseValue = Math.min(base.standard, base.chiitoi, base.kokushi);

  let best: MeldType | null = null;
  let bestValue = baseValue;

  for (const action of filtered) {
    if (action === 'kan') continue;
    const tiles = selectMeldTiles(player, tile, action);
    if (!tiles) continue;
    const remaining = player.hand.filter(t => !tiles.some(m => m.id === t.id));
    let min = Infinity;
    for (const d of remaining) {
      const after = remaining.filter(t => t.id !== d.id);
      const s = calcShanten(after, player.melds.length + 1);
      const value = Math.min(s.standard, s.chiitoi, s.kokushi);
      if (value < min) min = value;
    }
    if (min < bestValue) {
      bestValue = min;
      best = action;
    }
  }

  return best ?? 'pass';
}

/**
 * Choose a tile to discard without increasing shanten.
 * Evaluates every discardable tile and selects one that
 * results in the lowest shanten value.
 */
export function chooseAIDiscardTile(
  player: PlayerState,
  declaringRiichi = false,
  options?: { advanced?: boolean },
): Tile {
  let best: Tile | null = null;
  let bestShanten = Infinity;
  let bestSynergy = Infinity;
  let bestUkeire = -1;
  const useUkeire = options?.advanced;

  function calcSynergy(tile: Tile): number {
    let score = 0;
    for (const other of player.hand) {
      if (other.id === tile.id) continue;
      if (other.suit !== tile.suit) continue;
      const diff = Math.abs(other.rank - tile.rank);
      if (diff === 0) score += 2;
      else if (diff === 1) score += 1;
      else if (diff === 2) score += 0.5;
    }
    return score;
  }
  for (const tile of player.hand) {
    if (!declaringRiichi && !canDiscardTile(player, tile.id)) continue;
    const remaining = player.hand.filter(t => t.id !== tile.id);
    const s = calcShanten(remaining, player.melds.length);
    const value = Math.min(s.standard, s.chiitoi, s.kokushi);
    if (player.isRiichi && value > 0) continue;
    const ukeire = useUkeire
      ? countUkeireTiles(remaining, player.melds.length).total
      : -1;
    const synergy = calcSynergy(tile);
    const better =
      value < bestShanten ||
      (value === bestShanten &&
        (useUkeire
          ? ukeire > bestUkeire ||
            (ukeire === bestUkeire && synergy < bestSynergy)
          : synergy < bestSynergy));
    if (better) {
      bestShanten = value;
      bestUkeire = ukeire;
      bestSynergy = synergy;
      best = tile;
    }
  }
  return best ?? player.hand[0];
}
