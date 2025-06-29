import { describe, it, expect } from 'vitest';
import { chooseAICallOption, chooseAIDiscardTile } from './ai';
import { calcShanten } from './shanten';
import { Tile, PlayerState } from '../types/mahjong';
import { createInitialPlayerState } from '../components/Player';

function makePlayer(hand: Tile[]): PlayerState {
  return { ...createInitialPlayerState('ai', true), hand };
}

describe('chooseAICallOption', () => {
  it('chooses kan when possible', () => {
    const discard: Tile = { suit: 'man', rank: 3, id: 'd' };
    const hand: Tile[] = [
      { suit: 'man', rank: 3, id: 'a' },
      { suit: 'man', rank: 3, id: 'b' },
      { suit: 'man', rank: 3, id: 'c' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard)).toBe('kan');
  });

  it('chooses pon over chi', () => {
    const discard: Tile = { suit: 'pin', rank: 5, id: 'd' };
    const hand: Tile[] = [
      { suit: 'pin', rank: 5, id: 'a' },
      { suit: 'pin', rank: 5, id: 'b' },
      { suit: 'pin', rank: 6, id: 'c' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard)).toBe('pon');
  });

  it('chooses chi when sequence exists', () => {
    const discard: Tile = { suit: 'sou', rank: 4, id: 'd' };
    const hand: Tile[] = [
      { suit: 'sou', rank: 3, id: 'a' },
      { suit: 'sou', rank: 5, id: 'b' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard)).toBe('chi');
  });

  it('passes when no meld available', () => {
    const discard: Tile = { suit: 'wind', rank: 1, id: 'd' };
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'a' },
      { suit: 'pin', rank: 2, id: 'b' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard)).toBe('pass');
  });
});

describe('chooseAIDiscardTile', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
    suit,
    rank,
    id,
  });

  it('selects a discard that keeps shanten minimal', () => {
    const hand: Tile[] = [
      t('man', 1, 'a1'), t('man', 1, 'a2'),
      t('man', 2, 'b1'), t('man', 2, 'b2'),
      t('pin', 3, 'c1'), t('pin', 3, 'c2'),
      t('pin', 4, 'd1'), t('pin', 4, 'd2'),
      t('sou', 5, 'e1'), t('sou', 5, 'e2'),
      t('sou', 6, 'f1'), t('sou', 6, 'f2'),
      t('man', 7, 'g1'), t('man', 8, 'h1'),
    ];
    const player = makePlayer(hand);
    const chosen = chooseAIDiscardTile(player);
    const evaluate = (tile: Tile) => {
      const remaining = hand.filter(t => t.id !== tile.id);
      const s = calcShanten(remaining, player.melds.length);
      return Math.min(s.standard, s.chiitoi, s.kokushi);
    };
    const min = Math.min(...hand.map(evaluate));
    expect(evaluate(chosen)).toBe(min);
  });
});
