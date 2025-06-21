import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { getValidCallOptions } from './meld';

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
