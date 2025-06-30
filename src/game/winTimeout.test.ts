// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './store';

// Ensure that pending timeouts do not advance turns after a win

describe('useGame win timeout clearing', () => {
  it('stops scheduled actions on tsumo', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGame('tonpu'));
    // schedule nextTurn to create a pending timeout
    act(() => {
      result.current.nextTurn();
    });
    // Perform tsumo before the timeout triggers
    act(() => {
      result.current.handleTsumo();
    });
    const currentTurnAfterWin = result.current.turn;
    // advance timers to check if nextTurn was cancelled
    vi.advanceTimersByTime(600);
    expect(result.current.turn).toBe(currentTurnAfterWin);
    expect(result.current.winResult?.winType).toBe('tsumo');
    vi.useRealTimers();
  });
});
