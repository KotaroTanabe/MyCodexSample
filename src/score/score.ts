import { Tile } from '../types/mahjong';
import { Yaku } from './yaku';

export function calculateFu(_hand: Tile[]): number {
  // simplified fu calculation
  return 30;
}

export function calculateScore(hand: Tile[], yaku: Yaku[]): { han: number; fu: number; points: number } {
  const han = yaku.reduce((sum, y) => sum + y.han, 0);
  const fu = calculateFu(hand);
  const base = fu * Math.pow(2, han + 2);
  const points = base;
  return { han, fu, points };
}
