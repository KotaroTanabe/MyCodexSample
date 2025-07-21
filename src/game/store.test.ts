// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './store';
import type { Tile, MeldType } from '../types/mahjong';
import { isWinningHand } from '../score/yaku';

describe('game store', () => {
  it('advances kyoku with nextKyoku', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    act(() => {
      result.current.nextKyoku(false);
    });
    expect(result.current.kyoku).toBe(2);
  });

  it('rotates seat numbers when dealer changes', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    expect(result.current.players.map(p => p.seat)).toEqual([0, 1, 2, 3]);
    act(() => {
      result.current.nextKyoku(false);
    });
    expect(result.current.players.map(p => p.seat)).toEqual([3, 0, 1, 2]);
    expect(result.current.players[0].name).toBe('あなた');
  });

  it('ends game after final round draw', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    act(() => {
      result.current.nextKyoku(false); // 1 -> 2
    });
    act(() => {
      result.current.nextKyoku(false); // 2 -> 3
    });
    act(() => {
      result.current.nextKyoku(false); // 3 -> 4 (final)
    });
    expect(result.current.kyoku).toBe(4);

    act(() => {
      // Dealer continues on draw in final round should trigger end phase
      result.current.nextKyoku(true);
    });

    expect(result.current.phase).toBe('end');
  });

  it('declares riichi for the player', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    act(() => {
      result.current.handleRiichi();
    });
    expect(result.current.players[0].isRiichi).toBe(true);
    expect(result.current.pendingRiichi).toBe(0);
  });

  it('keeps seats when dealer continues', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    const before = result.current.players.map(p => p.name);
    act(() => {
      result.current.nextKyoku(true);
    });
    expect(result.current.players.map(p => p.name)).toEqual(before);
  });

  it('isWinningHand succeeds when kan melds are counted as three tiles', () => {
    const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });
    const kan = {
      type: 'kan' as MeldType,
      tiles: [t('man', 1, 'k1'), t('man', 1, 'k2'), t('man', 1, 'k3'), t('man', 1, 'k4')],
      fromPlayer: 0,
      calledTileId: 'k1',
      kanType: 'ankan',
    };
    const hand = [
      t('man', 2, 'm2a'), t('man', 2, 'm2b'), t('man', 2, 'm2c'),
      t('man', 3, 'm3a'), t('man', 3, 'm3b'), t('man', 3, 'm3c'),
      t('man', 4, 'm4a'), t('man', 4, 'm4b'), t('man', 4, 'm4c'),
      t('man', 5, 'm5a'), t('man', 5, 'm5b'),
    ];
    const fullHand = [
      ...hand,
      ...kan.tiles.slice(0, 3),
    ];
    expect(fullHand).toHaveLength(14);
    expect(isWinningHand(fullHand)).toBe(true);
  });
});
