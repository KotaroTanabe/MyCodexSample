export function isLeftOf(a: number, b: number): boolean {
  return a === ((b + 1) % 4);
}

import { MeldType } from '../types/mahjong';

export function filterChiOptions(
  options: (MeldType | 'pass')[],
  callerSeat: number,
  discarderSeat: number,
): (MeldType | 'pass')[] {
  if (!isLeftOf(callerSeat, discarderSeat)) {
    return options.filter(o => o !== 'chi');
  }
  return options;
}
