import { describe, it, expect } from 'vitest';
import { countDora, doraFromIndicator } from './dora';
import { Tile } from '../types/mahjong';

const t = (s: Tile['suit'], r: number): Tile => ({ suit: s, rank: r, id: `${s}${r}` });

describe('dora utils', () => {
  it('counts tiles matching indicators', () => {
    const hand = [t('man', 5), t('pin', 1)];
    const dora = [t('man', 4)];
    expect(countDora(hand, dora)).toBe(1); // 5m is dora for 4m
  });

  it('converts indicator to next tile', () => {
    expect(doraFromIndicator(t('dragon', 3))).toEqual({ suit: 'dragon', rank: 1, id: '' });
  });
});
