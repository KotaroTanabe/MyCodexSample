import { describe, it, expect } from 'vitest';
import { chooseAICallOption, chooseAIDiscardTile } from './ai';
import { calcShanten } from './shanten';
import { Tile, PlayerState } from '../types/mahjong';
import {
  createInitialPlayerState,
  isTenpaiAfterDiscard,
} from '../components/Player';

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

  it('calls pon when it improves shanten', () => {
    const discard: Tile = { suit: 'sou', rank: 5, id: 'z' };
    const hand: Tile[] = [
      { suit: 'sou', rank: 5, id: 'a' },
      { suit: 'sou', rank: 2, id: 'b' },
      { suit: 'sou', rank: 5, id: 'c' },
      { suit: 'man', rank: 7, id: 'd' },
      { suit: 'pin', rank: 8, id: 'e' },
      { suit: 'sou', rank: 4, id: 'f' },
      { suit: 'pin', rank: 5, id: 'g' },
      { suit: 'pin', rank: 3, id: 'h' },
      { suit: 'man', rank: 4, id: 'i' },
      { suit: 'pin', rank: 3, id: 'j' },
      { suit: 'man', rank: 2, id: 'k' },
      { suit: 'man', rank: 9, id: 'l' },
      { suit: 'man', rank: 1, id: 'm' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard)).toBe('pon');
  });

  it('calls chi when it improves shanten', () => {
    const discard: Tile = { suit: 'pin', rank: 2, id: 'x' };
    const hand: Tile[] = [
      { suit: 'man', rank: 5, id: 'a' },
      { suit: 'pin', rank: 4, id: 'b' },
      { suit: 'man', rank: 7, id: 'c' },
      { suit: 'sou', rank: 6, id: 'd' },
      { suit: 'man', rank: 6, id: 'e' },
      { suit: 'pin', rank: 1, id: 'f' },
      { suit: 'man', rank: 1, id: 'g' },
      { suit: 'sou', rank: 1, id: 'h' },
      { suit: 'pin', rank: 3, id: 'i' },
      { suit: 'pin', rank: 9, id: 'j' },
      { suit: 'man', rank: 3, id: 'k' },
      { suit: 'pin', rank: 9, id: 'l' },
      { suit: 'pin', rank: 9, id: 'm' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard)).toBe('chi');
  });

  it('passes when call does not improve shanten', () => {
    const discard: Tile = { suit: 'man', rank: 2, id: 'd' };
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'a' },
      { suit: 'man', rank: 2, id: 'b' },
      { suit: 'man', rank: 3, id: 'c' },
      { suit: 'man', rank: 4, id: 'e' },
      { suit: 'man', rank: 5, id: 'f' },
      { suit: 'man', rank: 7, id: 'g' },
      { suit: 'man', rank: 8, id: 'h' },
      { suit: 'man', rank: 9, id: 'i' },
      { suit: 'pin', rank: 1, id: 'j' },
      { suit: 'pin', rank: 2, id: 'k' },
      { suit: 'pin', rank: 3, id: 'l' },
      { suit: 'sou', rank: 5, id: 'm' },
      { suit: 'sou', rank: 7, id: 'n' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard)).toBe('pass');
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

  it('keeps tenpai when declaring riichi', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'),
      t('man', 1, 'a2'),
      t('man', 2, 'b1'),
      t('man', 2, 'b2'),
      t('pin', 3, 'c1'),
      t('pin', 3, 'c2'),
      t('pin', 4, 'd1'),
      t('pin', 4, 'd2'),
      t('sou', 5, 'e1'),
      t('sou', 5, 'e2'),
      t('sou', 6, 'f1'),
      t('sou', 6, 'f2'),
      t('man', 7, 'g1'),
      t('man', 8, 'h1'),
    ];
    const player: PlayerState = {
      ...createInitialPlayerState('ai', true),
      hand,
      isRiichi: true,
    };
    const chosen = chooseAIDiscardTile(player, true);
    expect(isTenpaiAfterDiscard(player, chosen.id)).toBe(true);
  });
});
