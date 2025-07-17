import { describe, it, expect } from 'vitest';
import { countUkeireTiles } from './ukeire';
import { Tile } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
  suit,
  rank,
  id,
});

// Hand roughly 2-shanten; many tiles reduce shanten
const hand: Tile[] = [
  t('man', 1, 'a1'), t('man', 1, 'a2'),
  t('man', 2, 'b1'), t('man', 2, 'b2'),
  t('man', 3, 'c1'),
  t('man', 4, 'd1'), t('man', 5, 'e1'), t('man', 6, 'f1'),
  t('pin', 1, 'g1'), t('pin', 1, 'g2'),
  t('sou', 2, 'h1'), t('sou', 2, 'h2'), t('sou', 3, 'h3'),
];

// Visible tiles remove two 3m and one 6m
const dora: Tile[] = [t('man', 3, 'x1')];
const river: Tile[] = [t('man', 3, 'x2')];
const meld: Tile[] = [t('man', 6, 'x3')];

describe('countUkeireTiles', () => {
  it('counts tiles that improve shanten', () => {
    const { counts, types, total } = countUkeireTiles(hand, 0, dora, river, meld);
    const expectedTotal = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(expectedTotal);
    expect(types).toBe(Object.keys(counts).length);
    expect(Object.keys(counts).length).toBeGreaterThan(0);
  });
});
