import { describe, it, expect } from 'vitest';
import { isChankan } from './isChankan';
import { LogEntry, Tile } from '../types/mahjong';

describe('isChankan', () => {
  const tile: Tile = { suit: 'man', rank: 1, id: 'a' };
  it('returns true for kakan ron', () => {
    const prev: LogEntry = {
      type: 'meld',
      player: 1,
      tiles: [tile],
      meldType: 'kan',
      from: 1,
      kanType: 'kakan',
    };
    expect(isChankan(prev, 1, tile)).toBe(true);
  });

  it('returns false for daiminkan', () => {
    const prev: LogEntry = {
      type: 'meld',
      player: 1,
      tiles: [tile],
      meldType: 'kan',
      from: 0,
      kanType: 'daiminkan',
    };
    expect(isChankan(prev, 1, tile)).toBe(false);
  });
});
