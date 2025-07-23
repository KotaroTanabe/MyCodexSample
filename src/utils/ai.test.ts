import { describe, it, expect } from 'vitest';
import { chooseAICallOption, chooseAIDiscardTile } from './ai';
import { calcShanten } from './shanten';
import { countUkeireTiles } from './ukeire';
import { Tile, PlayerState } from '../types/mahjong';
import {
  createInitialPlayerState,
  isTenpaiAfterDiscard,
} from '../components/Player';

function makePlayer(hand: Tile[], seat = 0): PlayerState {
  return { ...createInitialPlayerState('ai', true, seat), hand };
}

describe('chooseAICallOption', () => {
  it('chooses kan when possible', () => {
    const discard: Tile = { suit: 'man', rank: 3, id: 'd' };
    const hand: Tile[] = [
      { suit: 'man', rank: 3, id: 'a' },
      { suit: 'man', rank: 3, id: 'b' },
      { suit: 'man', rank: 3, id: 'c' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard, 3)).toBe('kan');
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
    expect(chooseAICallOption(makePlayer(hand), discard, 3)).toBe('pon');
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
    expect(chooseAICallOption(makePlayer(hand), discard, 3)).toBe('chi');
  });

  it('does not chi when caller is not left of discarder', () => {
    const discard: Tile = { suit: 'pin', rank: 2, id: 'x' };
    const hand: Tile[] = [
      { suit: 'pin', rank: 1, id: 'f' },
      { suit: 'pin', rank: 3, id: 'i' },
    ];
    expect(chooseAICallOption(makePlayer(hand, 1), discard, 3)).toBe('pass');
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
    expect(chooseAICallOption(makePlayer(hand), discard, 3)).toBe('pass');
  });

  it('passes when no meld available', () => {
    const discard: Tile = { suit: 'wind', rank: 1, id: 'd' };
    const hand: Tile[] = [
      { suit: 'man', rank: 1, id: 'a' },
      { suit: 'pin', rank: 2, id: 'b' },
    ];
    expect(chooseAICallOption(makePlayer(hand), discard, 3)).toBe('pass');
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

  it('prefers isolated tiles when shanten is unchanged', () => {
    const hand: Tile[] = [
      t('man', 1, 'p1'),
      t('man', 1, 'p2'),
      t('man', 2, 's1'),
      t('man', 3, 's2'),
      t('pin', 5, 'i1'),
      t('sou', 7, 'i2'),
      t('pin', 9, 'i3'),
      t('sou', 9, 'i4'),
      t('wind', 1, 'i5'),
      t('dragon', 1, 'i6'),
      t('pin', 1, 'i7'),
      t('sou', 3, 'i8'),
      t('man', 7, 'i9'),
      t('pin', 7, 'i10'),
    ];
    const player = makePlayer(hand);
    const chosen = chooseAIDiscardTile(player);
    expect(['p1', 'p2', 's1', 's2']).not.toContain(chosen.id);
  });

  it('prefers higher ukeire when shanten ties', () => {
    const hand: Tile[] = [
      t('man', 1, 'a1'),
      t('man', 2, 'a2'),
      t('man', 3, 'a3'),
      t('man', 4, 'a4'),
      t('man', 7, 'b1'),
      t('man', 9, 'b2'),
      t('pin', 3, 'c1'),
      t('pin', 4, 'c2'),
      t('pin', 6, 'c3'),
      t('sou', 2, 'd1'),
      t('sou', 3, 'd2'),
      t('sou', 5, 'd3'),
      t('wind', 1, 'e1'),
      t('dragon', 1, 'f1'),
    ];
    const player = makePlayer(hand);
    const chosen = chooseAIDiscardTile(player);
    const evaluate = (tile: Tile) => {
      const remaining = hand.filter(t => t.id !== tile.id);
      const s = calcShanten(remaining, player.melds.length);
      const value = Math.min(s.standard, s.chiitoi, s.kokushi);
      const ukeire = countUkeireTiles(remaining, player.melds.length).total;
      return { value, ukeire };
    };
    const data = hand.map(tile => ({ tile, ...evaluate(tile) }));
    const min = Math.min(...data.map(d => d.value));
    const bestUkeire = Math.max(
      ...data.filter(d => d.value === min).map(d => d.ukeire),
    );
    expect(evaluate(chosen).ukeire).toBe(bestUkeire);
  });
});
