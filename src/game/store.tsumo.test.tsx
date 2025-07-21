// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { useGame } from './store';
import { createInitialPlayerState } from '../components/Player';
import type { Tile } from '../types/mahjong';
import { UIBoard } from '../components/UIBoard';
import { isWinningHand, detectYaku } from '../score/yaku';

describe('store winning draw', () => {
  it('sets tsumo option on winning self-draw', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGame('tonpu'));
    let id = 1;
    const t = (suit: Tile['suit'], rank: number): Tile => ({ suit, rank, id: `x${id++}` });
    const chi1 = [t('sou', 2), t('sou', 3), t('sou', 4)];
    const chi2 = [t('sou', 5), t('sou', 6), t('sou', 7)];
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
    player.melds = [
      { type: 'chi', tiles: chi1, fromPlayer: 1, calledTileId: chi1[0].id },
      { type: 'chi', tiles: chi2, fromPlayer: 2, calledTileId: chi2[0].id },
    ];

    const drawTile = t('man', 3);
    const board = {
      players: [
        player,
        createInitialPlayerState('ai1', true, 1),
        createInitialPlayerState('ai2', true, 2),
        createInitialPlayerState('ai3', true, 3),
      ],
      wall: [drawTile],
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
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    const fullHand = [
      ...result.current.players[0].hand,
      ...result.current.players[0].melds.flatMap(m => m.tiles),
    ];
    expect(isWinningHand(fullHand)).toBe(true);
    const yaku = detectYaku(result.current.players[0].hand, result.current.players[0].melds, {
      isTsumo: true,
      seatWind: 1,
      roundWind: 1,
    });
    expect(yaku.map(y => y.name)).toContain('Tanyao');
    expect(result.current.tsumoOption).toBe(true);

    render(
      <UIBoard
        players={result.current.players}
        dora={[]}
        kyoku={1}
        wallCount={0}
        kyotaku={0}
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
        tsumoOption={result.current.tsumoOption}
      />,
    );
    expect(screen.getByText('ツモ')).toBeTruthy();
    vi.useRealTimers();
  });
});
