// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './store';

describe('startRound with AI dealer', () => {
  it('triggers AI discard on new round', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGame('tonpu'));
    act(() => {
      result.current.nextKyoku(false);
    });
    expect(result.current.players[1].discard).toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.players[1].discard.length).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});
