// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './store';

function parsePreset(input: string) {
  return JSON.parse(input);
}

describe('call handling', () => {
  it('removes called tile from discarder river', () => {
    const { result } = renderHook(() => useGame('tonpu'));
    const preset = parsePreset(result.current.boardInput);
    preset.turn = 3; // 上家から捨てさせる
    act(() => {
      result.current.setBoardInput(JSON.stringify(preset));
      result.current.handleLoadBoard();
    });
    const tile = result.current.players[3].hand.find(t => t.suit === 'man' && t.rank === 9)!;
    act(() => {
      result.current.handleDiscard(tile.id);
    });
    act(() => {
      result.current.handleCallAction('chi');
    });
    expect(result.current.players[3].discard).toHaveLength(0);
  });
});
