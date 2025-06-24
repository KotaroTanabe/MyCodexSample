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
});
