import { describe, it, expect } from 'vitest';
import { chooseAICallOption } from './ai';
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
