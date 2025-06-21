import { Tile } from '../types/mahjong';

/**
 * Calculates a basic score for the given hand.
 * Currently returns 0 as a placeholder.
 */
export function calculateBasicScore(hand: Tile[]): number {
  // TODO: implement actual scoring logic
  // Temporary logic: base score equals tile count
  return hand.length;
}
