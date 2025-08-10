// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './store';
import { createInitialPlayerState } from '../components/Player';
import type { Tile } from '../types/mahjong';

// Ensure that a tsumo win halts further draws

describe('tsumo end-of-round handling', () => {
  it('does not allow further draws after a tsumo', async () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useGame('tonpu'));
    let id = 1;
    const t = (suit: Tile['suit'], rank: number): Tile => ({ suit, rank, id: `t${id++}` });
    const chi = [t('sou', 2), t('sou', 3), t('sou', 4)];
    const player = createInitialPlayerState('自分', false, 0);
    player.hand = [
      t('man', 2),
      t('man', 4),
      t('man', 5),
      t('man', 5),
      t('man', 5),
      t('pin', 4),
      t('pin', 4),
    ];
    player.melds = [{ type: 'chi', tiles: chi, fromPlayer: 1, calledTileId: chi[0].id }];

    const drawTile = t('man', 3);
    const extraDraw = t('pin', 1); // would be drawn by next player if round continued
    const board = {
      players: [
        player,
        createInitialPlayerState('ai1', true, 1),
        createInitialPlayerState('ai2', true, 2),
        createInitialPlayerState('ai3', true, 3),
      ],
      wall: [drawTile, extraDraw],
      deadWall: [],
      dora: [],
      turn: 3,
      kyoku: 1,
      riichiPool: 0,
      honba: 0,
    };

    act(() => {
      result.current.setBoardInput(JSON.stringify(board));
    });
    act(() => {
      result.current.handleLoadBoard();
    });
    act(() => {
      result.current.nextTurn();
    });
    try {
      await act(async () => {
        vi.advanceTimersByTime(600); // draw winning tile
      });
      act(() => {
        result.current.handleTsumo();
      });
      await act(async () => {
        vi.advanceTimersByTime(1000); // allow any scheduled actions
      });
      vi.runAllTimers();
      const lastEntry = result.current.log[result.current.log.length - 1];
      expect(lastEntry.type).toBe('tsumo');
    } finally {
      unmount();
      vi.useRealTimers();
    }
  });
});
