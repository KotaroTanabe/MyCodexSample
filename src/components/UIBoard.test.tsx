// @vitest-environment jsdom
import React from 'react'; // needed for JSX linting
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { UIBoard } from './UIBoard';
import { createInitialPlayerState, canDeclareRiichi } from './Player';
import { Tile } from '../types/mahjong';
import type { PlayerState } from "../types/mahjong";

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

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
    kyoku: 1,
    wallCount: 70,
    kyotaku: 0,
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
    expect(screen.getByText('聴牌 (国士無双0向聴)')).toBeTruthy();
  });

  it('shows tenpai when shanten is zero', () => {
    renderBoard({ standard: 0, chiitoi: 2, kokushi: 13 });
    expect(screen.getByText('聴牌')).toBeTruthy();
  });

  it('shows kokushi label for 2-shanten', () => {
    renderBoard({ standard: 3, chiitoi: 3, kokushi: 2 });
    expect(screen.getByText('向聴数: 2 (国士無双2向聴)')).toBeTruthy();
  });
});

describe('UIBoard riichi button', () => {

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
        kyoku={1}
        wallCount={70}
        kyotaku={0}
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
        kyoku={1}
        wallCount={70}
        kyotaku={0}
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

describe('UIBoard chi options', () => {
  it('renders buttons for each chi combination', () => {
    render(
      <UIBoard
        players={[
          createInitialPlayerState('me', false, 0),
          createInitialPlayerState('ai1', true, 1),
          createInitialPlayerState('ai2', true, 2),
          createInitialPlayerState('ai3', true, 3),
        ]}
        dora={[]}
        kyoku={1}
        wallCount={70}
        kyotaku={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
        chiOptions={[
          [t('man', 1, 'a'), t('man', 2, 'b')],
          [t('man', 2, 'c'), t('man', 4, 'd')],
        ]}
        onChi={() => {}}
      />,
    );
    const buttons = screen.getAllByText('チー');
    expect(buttons.length).toBe(2);
  });
});

describe('UIBoard aria labels', () => {
  it('adds aria-labels to discard buttons', () => {
    const me = { ...createInitialPlayerState('me', false) } as PlayerState;
    me.hand = [t('man', 1, 'a1')];
    me.drawnTile = t('pin', 3, 'b1');
    render(
      <UIBoard
        players={[
          me,
          createInitialPlayerState('ai1', true, 1),
          createInitialPlayerState('ai2', true, 2),
          createInitialPlayerState('ai3', true, 3),
        ]}
        dora={[]}
        kyoku={1}
        wallCount={70}
        kyotaku={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 13 }}
        lastDiscard={null}
      />,
    );
    expect(screen.getByRole('button', { name: '1萬' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '3筒' })).toBeTruthy();
  });
});

describe('UIBoard discard orientation', () => {


  it('keeps discard order after rotation', () => {
    const right = createInitialPlayerState('right', true, 1);
    right.discard = [t('man', 1, 'a'), t('man', 2, 'b')];
    const top = createInitialPlayerState('top', true, 2);
    top.discard = [t('pin', 3, 'c'), t('pin', 4, 'd')];
    const left = createInitialPlayerState('left', true, 3);
    left.discard = [t('sou', 5, 'e'), t('sou', 6, 'f')];

    render(
      <UIBoard
        players={[
          createInitialPlayerState('me', false, 0),
          right,
          top,
          left,
        ]}
        dora={[]}
        kyoku={1}
        wallCount={70}
        kyotaku={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
      />,
    );

    const rightDiv = screen.getByTestId('discard-seat-1');
    const topDiv = screen.getByTestId('discard-seat-2');
    const leftDiv = screen.getByTestId('discard-seat-3');

    const rightTiles = rightDiv.querySelectorAll('[aria-label]');
    const topTiles = topDiv.querySelectorAll('[aria-label]');
    const leftTiles = leftDiv.querySelectorAll('[aria-label]');

    expect(rightTiles[0].getAttribute('aria-label')).toBe('1萬');
    expect(rightTiles[rightTiles.length - 1].getAttribute('aria-label')).toBe('2萬');
    expect(topTiles[0].getAttribute('aria-label')).toBe('3筒');
    expect(topTiles[topTiles.length - 1].getAttribute('aria-label')).toBe('4筒');
    expect(leftTiles[0].getAttribute('aria-label')).toBe('5索');
    expect(leftTiles[leftTiles.length - 1].getAttribute('aria-label')).toBe('6索');
  });
});
