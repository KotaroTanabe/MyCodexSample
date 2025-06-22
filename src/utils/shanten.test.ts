import { describe, it, expect } from 'vitest';
import {
  calcStandardShanten,
  calcChiitoiShanten,
  calcKokushiShanten,
  calcShanten,
} from './shanten';
import { Tile } from '../types/mahjong';

describe('shanten calculations', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

  it('detects a complete standard hand', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 1, 'j'), t('pin', 1, 'k'), t('pin', 1, 'l'),
      t('sou', 2, 'm'), t('sou', 2, 'n'),
    ];
    expect(calcStandardShanten(hand)).toBe(-1);
    expect(calcChiitoiShanten(hand)).toBe(4);
    expect(calcKokushiShanten(hand)).toBe(9);
    expect(calcShanten(hand)).toEqual({ standard: -1, chiitoi: 4, kokushi: 9 });
  });

  it('calculates chiitoitsu tenpai correctly', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 1, 'b'),
      t('man', 2, 'c'), t('man', 2, 'd'),
      t('man', 3, 'e'), t('man', 3, 'f'),
      t('pin', 1, 'g'), t('pin', 1, 'h'),
      t('pin', 2, 'i'), t('pin', 2, 'j'),
      t('sou', 1, 'k'), t('sou', 1, 'l'),
      t('sou', 2, 'm'), t('sou', 3, 'n'),
    ];
    expect(calcChiitoiShanten(hand)).toBe(0);
    expect(calcStandardShanten(hand)).toBe(1);
    expect(calcKokushiShanten(hand)).toBe(9);
    expect(calcShanten(hand)).toEqual({ standard: 1, chiitoi: 0, kokushi: 9 });
  });

  it('calculates chiitoitsu 2-shanten', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 1, 'b'),
      t('man', 2, 'c'), t('man', 2, 'd'),
      t('pin', 3, 'e'), t('pin', 3, 'f'),
      t('pin', 4, 'g'), t('pin', 4, 'h'),
      t('sou', 5, 'i'), t('sou', 6, 'j'),
      t('wind', 1, 'k'), t('dragon', 1, 'l'),
      t('man', 3, 'm'), t('man', 4, 'n'),
    ];
    expect(calcChiitoiShanten(hand)).toBe(2);
  });

  it('handles a standard 1-shanten hand', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 1, 'j'), t('pin', 1, 'k'),
      t('sou', 2, 'l'), t('sou', 2, 'm'), t('sou', 3, 'n'),
    ];
    expect(calcStandardShanten(hand)).toBe(1);
    expect(calcChiitoiShanten(hand)).toBe(4);
    expect(calcKokushiShanten(hand)).toBe(9);
    expect(calcShanten(hand)).toEqual({ standard: 1, chiitoi: 4, kokushi: 9 });
  });

  it('calculates kokushi 2-shanten', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 9, 'b'),
      t('pin', 1, 'c'), t('pin', 9, 'd'),
      t('sou', 1, 'e'), t('sou', 9, 'f'),
      t('wind', 1, 'g'), t('wind', 2, 'h'), t('wind', 3, 'i'),
      t('dragon', 1, 'j'), t('dragon', 2, 'k'),
      t('man', 2, 'l'), t('pin', 3, 'm'),
    ];
    expect(calcKokushiShanten(hand)).toBe(2);
  });

  it('accounts for open melds in standard shanten', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 2, 'j'), t('pin', 2, 'k'),
    ];
    expect(calcStandardShanten(hand, 1)).toBe(-1);
    expect(calcShanten(hand, 1).standard).toBe(-1);
  });
});
