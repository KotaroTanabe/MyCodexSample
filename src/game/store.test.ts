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
});
