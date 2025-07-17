import { describe, it, expect } from 'vitest';
import { countUnseenTiles } from './unseen';
import { Tile } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
  suit,
  rank,
  id,
});

describe('countUnseenTiles', () => {
  it('returns full counts for empty inputs', () => {
    const counts = countUnseenTiles();
    expect(counts['man-1']).toBe(4);
    expect(counts['wind-1']).toBe(4);
    expect(Object.keys(counts).length).toBe(34);
  });

  it('subtracts visible tiles', () => {
    const hand = [t('man', 1, 'a'), t('man', 1, 'b')];
    const dora = [t('sou', 9, 'c')];
    const river = [t('pin', 5, 'd')];
    const meld = [t('wind', 3, 'e')];
    const counts = countUnseenTiles(hand, dora, river, meld);
    expect(counts['man-1']).toBe(2);
    expect(counts['sou-9']).toBe(3);
    expect(counts['pin-5']).toBe(3);
    expect(counts['wind-3']).toBe(3);
  });
});
