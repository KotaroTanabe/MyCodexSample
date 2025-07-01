// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './store';

// Ensure AI does not continue acting after a tsumo win

describe('handleAITurn after tsumo', () => {
  it('stops without scheduling further actions', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGame('tonpu'));
    act(() => {
      result.current.togglePlayerAI();
      result.current.handleTsumo();
    });
    const wallBefore = result.current.wall.length;
    act(() => {
      // attempt to run AI turn even though win already occurred
      result.current.handleAITurn(0);
    });
    vi.advanceTimersByTime(600);
    expect(result.current.wall.length).toBe(wallBefore);
    expect(result.current.winResult?.winType).toBe('tsumo');
    vi.useRealTimers();
  });
});
