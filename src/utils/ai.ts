import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { getValidCallOptions, selectMeldTiles } from './meld';
import { calcShanten } from './shanten';
import { canDiscardTile } from '../components/Player';

/**
 * Choose an AI call action based on available options.
 * Kan is always taken. Pon/Chi are chosen only if they
 * improve the player's shanten number.
 */
export function chooseAICallOption(
  player: PlayerState,
  tile: Tile,
): MeldType | 'pass' {
  const options = getValidCallOptions(player, tile).filter(
    o => o !== 'pass',
  ) as MeldType[];
  if (options.includes('kan')) return 'kan';

  const base = calcShanten(player.hand, player.melds.length);
  const baseValue = Math.min(base.standard, base.chiitoi, base.kokushi);

  let best: MeldType | null = null;
  let bestValue = baseValue;

  for (const action of options) {
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
): Tile {
  let best: Tile | null = null;
  let bestShanten = Infinity;
  for (const tile of player.hand) {
    if (!declaringRiichi && !canDiscardTile(player, tile.id)) continue;
    const remaining = player.hand.filter(t => t.id !== tile.id);
    const s = calcShanten(remaining, player.melds.length);
    const value = Math.min(s.standard, s.chiitoi, s.kokushi);
    if (player.isRiichi && value > 0) continue;
    if (value < bestShanten) {
      bestShanten = value;
      best = tile;
    }
  }
  return best ?? player.hand[0];
}
