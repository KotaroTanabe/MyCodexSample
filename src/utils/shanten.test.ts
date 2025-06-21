import { describe, it, expect } from 'vitest';
import {
  calcStandardShanten,
  calcChiitoiShanten,
  calcKokushiShanten,
  calcShanten,
} from './shanten';
import { Tile, Meld } from '../types/mahjong';

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

  it('calculates shanten correctly when melds are present', () => {
    const meldTiles = [
      t('man', 1, 'ma'),
      t('man', 2, 'mb'),
      t('man', 3, 'mc'),
    ];
    const hand: Tile[] = [
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 1, 'j'), t('pin', 1, 'k'),
      t('sou', 2, 'l'), t('sou', 2, 'm'), t('sou', 3, 'n'),
    ];
    const melds: Meld[] = [{ type: 'chi', tiles: meldTiles }];
    expect(calcStandardShanten(hand, melds)).toBe(1);
    expect(calcChiitoiShanten(hand, melds)).toBe(4);
    expect(calcKokushiShanten(hand, melds)).toBe(10);
    expect(calcShanten(hand, melds)).toEqual({ standard: 1, chiitoi: 4, kokushi: 10 });
  });
});
