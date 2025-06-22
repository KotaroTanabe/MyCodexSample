// @vitest-environment jsdom
import React from 'react'; // needed for JSX linting
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { UIBoard } from './UIBoard';
import { createInitialPlayerState, canDeclareRiichi } from './Player';
import { Tile } from '../types/mahjong';
import type { PlayerState } from "../types/mahjong";

const basePlayer = createInitialPlayerState('you', false);

afterEach(() => cleanup());
function renderBoard(shanten: { standard: number; chiitoi: number; kokushi: number }) {
  const props = {
    players: [
      basePlayer,
      createInitialPlayerState('ai1', true, 1),
      createInitialPlayerState('ai2', true, 2),
      createInitialPlayerState('ai3', true, 3),
    ],
    dora: [] as Tile[],
    onDiscard: () => {},
    isMyTurn: true,
    shanten,
    lastDiscard: null,
  };
  render(<UIBoard {...props} />);
}

describe('UIBoard shanten display', () => {
  it('shows standard shanten count', () => {
    renderBoard({ standard: 2, chiitoi: 4, kokushi: 13 });
    expect(screen.getByText('向聴数: 2')).toBeTruthy();
  });

  it('shows chiitoi label when lower', () => {
    renderBoard({ standard: 3, chiitoi: 1, kokushi: 13 });
    expect(screen.getByText('向聴数: 1 (七対子1向聴)')).toBeTruthy();
  });

  it('shows chiitoi label for 2-shanten', () => {
    renderBoard({ standard: 4, chiitoi: 2, kokushi: 13 });
    expect(screen.getByText('向聴数: 2 (七対子2向聴)')).toBeTruthy();
  });

  it('shows kokushi label when lower', () => {
    renderBoard({ standard: 4, chiitoi: 4, kokushi: 0 });
    expect(screen.getByText('向聴数: 0 (国士無双0向聴)')).toBeTruthy();
  });

  it('shows kokushi label for 2-shanten', () => {
    renderBoard({ standard: 3, chiitoi: 3, kokushi: 2 });
    expect(screen.getByText('向聴数: 2 (国士無双2向聴)')).toBeTruthy();
  });
});

describe('UIBoard riichi button', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

  function makePlayer(hand: Tile[]): PlayerState {
    const p = { ...createInitialPlayerState('you', false), hand, drawnTile: hand[hand.length - 1] } as PlayerState;
    return p;
  }

  it('shows the riichi button when riichi is possible', () => {
    const hand: Tile[] = [
      t('man',1,'a1'), t('man',1,'a2'),
      t('man',2,'b1'), t('man',2,'b2'),
      t('pin',3,'c1'), t('pin',3,'c2'),
      t('pin',4,'d1'), t('pin',4,'d2'),
      t('sou',5,'e1'), t('sou',5,'e2'),
      t('sou',6,'f1'), t('sou',6,'f2'),
      t('man',7,'g1'), t('man',8,'h1'),
    ];
    const player = makePlayer(hand);
    expect(canDeclareRiichi(player)).toBe(true);
    render(
      <UIBoard
        players={[
          player,
          createInitialPlayerState('ai1', true, 1),
          createInitialPlayerState('ai2', true, 2),
          createInitialPlayerState('ai3', true, 3),
        ]}
        dora={[]}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 13 }}
        lastDiscard={null}
        onRiichi={() => {}}
      />,
    );
    expect(screen.getByText('リーチ')).toBeTruthy();
  });

  it('does not show the riichi button when riichi is not possible', () => {
    const hand: Tile[] = [
      t('man',1,'a'), t('man',2,'b'), t('man',3,'c'),
      t('man',4,'d'), t('man',5,'e'), t('man',6,'f'),
      t('man',7,'g'), t('man',8,'h'), t('man',9,'i'),
      t('pin',1,'j'), t('pin',1,'k'),
      t('sou',2,'l'), t('sou',2,'m'), t('sou',3,'n'),
    ];
    const player = { ...makePlayer(hand), drawnTile: null } as PlayerState;
    expect(canDeclareRiichi(player)).toBe(false);
    render(
      <UIBoard
        players={[
          player,
          createInitialPlayerState('ai1', true, 1),
          createInitialPlayerState('ai2', true, 2),
          createInitialPlayerState('ai3', true, 3),
        ]}
        dora={[]}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 1, chiitoi: 4, kokushi: 9 }}
        lastDiscard={null}
        onRiichi={() => {}}
      />,
    );
    expect(screen.queryByText('リーチ')).toBeNull();
  });
});
