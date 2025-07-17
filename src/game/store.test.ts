// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './store';

describe('game store', () => {
  it('advances kyoku with nextKyoku', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    act(() => {
      result.current.nextKyoku(false);
    });
    expect(result.current.kyoku).toBe(2);
  });

  it('rotates seats when dealer changes', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    expect(result.current.players.map(p => p.name)).toEqual([
      'あなた',
      'AI下家',
      'AI対面',
      'AI上家',
    ]);
    act(() => {
      result.current.nextKyoku(false);
    });
    expect(result.current.players.map(p => p.name)).toEqual([
      'AI下家',
      'AI対面',
      'AI上家',
      'あなた',
    ]);
    expect(result.current.players[0].seat).toBe(0);
    expect(result.current.players[3].seat).toBe(3);
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
});
