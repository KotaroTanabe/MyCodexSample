import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { getValidCallOptions } from './meld';
import { calcShanten } from './shanten';
import { canDiscardTile } from '../components/Player';

/**
 * Choose an AI call action based on available options.
 * Prioritizes kan, then pon, then chi, otherwise pass.
 */
export function chooseAICallOption(
  player: PlayerState,
  tile: Tile,
): MeldType | 'pass' {
  const options = getValidCallOptions(player, tile).filter(
    o => o !== 'pass',
  ) as MeldType[];
  if (options.includes('kan')) return 'kan';
  if (options.includes('pon')) return 'pon';
  if (options.includes('chi')) return 'chi';
  return 'pass';
}

/**
 * Choose a tile to discard without increasing shanten.
 * Evaluates every discardable tile and selects one that
 * results in the lowest shanten value.
 */
export function chooseAIDiscardTile(player: PlayerState): Tile {
  let best: Tile | null = null;
  let bestShanten = Infinity;
  for (const tile of player.hand) {
    if (!canDiscardTile(player, tile.id)) continue;
    const remaining = player.hand.filter(t => t.id !== tile.id);
    const s = calcShanten(remaining, player.melds.length);
    const value = Math.min(s.standard, s.chiitoi, s.kokushi);
    if (value < bestShanten) {
      bestShanten = value;
      best = tile;
    }
  }
  return best ?? player.hand[0];
}
