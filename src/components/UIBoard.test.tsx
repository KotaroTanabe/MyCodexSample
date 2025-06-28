// @vitest-environment jsdom
import React from 'react'; // needed for JSX linting
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { UIBoard } from './UIBoard';
import { createInitialPlayerState, canDeclareRiichi } from './Player';
import { RESERVED_HAND_SLOTS } from './HandView';
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
    honba: 0,
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

  it('shows agari state when shanten is negative and yaku exist', () => {
    const player = { ...createInitialPlayerState('you', false) } as PlayerState;
    player.hand = [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ];
    player.drawnTile = player.hand[player.hand.length - 1];
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
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: -1, chiitoi: 13, kokushi: 13 }}
        lastDiscard={null}
        tsumoOption={true}
      />,
    );
    expect(screen.getByText('和了可能')).toBeTruthy();
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
        honba={0}
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
        honba={0}
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
        honba={0}
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
        honba={0}
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

describe('UIBoard responsiveness', () => {
  it('hand container can scroll horizontally', () => {
    renderBoard({ standard: 1, chiitoi: 1, kokushi: 13 });
    const handLabel = screen.getByText('手牌');
    const container = handLabel.parentElement as HTMLElement;
    expect(container.className).toContain('overflow-x-auto');
  });
});

describe('UIBoard hand placeholders', () => {
  it('uses fixed slot count with few tiles', () => {
    const me = { ...createInitialPlayerState('me', false) } as PlayerState;
    me.hand = [t('man', 1, 'a1')];
    me.drawnTile = null;
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
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
      />,
    );
    const handLabel = screen.getByText('手牌');
    const container = handLabel.parentElement as HTMLElement;
    expect(container.children.length).toBe(RESERVED_HAND_SLOTS + 1);
    const placeholders = container.querySelectorAll('span.opacity-0');
    expect(placeholders.length).toBeGreaterThan(0);
    placeholders.forEach(el => {
      const className = el.getAttribute('class') || '';
      expect(className).toContain('border');
      expect(className).toContain('px-2');
    });
  });

  it('uses fixed slot count with many tiles', () => {
    const me = { ...createInitialPlayerState('me', false) } as PlayerState;
    me.hand = Array.from({ length: 10 }, (_, i) => t('man', i + 1 as number, `m${i}`));
    me.drawnTile = null;
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
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
      />,
    );
    const handLabel = screen.getByText('手牌');
    const container = handLabel.parentElement as HTMLElement;
    expect(container.children.length).toBe(RESERVED_HAND_SLOTS + 1);
    const placeholders = container.querySelectorAll('span.opacity-0');
    expect(placeholders.length).toBeGreaterThan(0);
    placeholders.forEach(el => {
      const className = el.getAttribute('class') || '';
      expect(className).toContain('border');
      expect(className).toContain('px-2');
    });
  });
});

describe('UIBoard layout', () => {
  it('uses grid areas for seats and info panel', () => {
    renderBoard({ standard: 1, chiitoi: 1, kokushi: 13 });
    const board = screen.getByTestId('ui-board');
    expect(board.style.gridTemplateAreas).toContain('top');
    expect(board.style.gridTemplateAreas).toContain('info');
    const info = screen.getByTestId('info-area');
    expect(info.style.gridArea).toBe('info');
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
        honba={0}
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

describe('UIBoard riichi indicators', () => {
  it('shows riichi stick in front of rivers', () => {
    const me = { ...createInitialPlayerState('me', false, 0), isRiichi: true };
    me.discard = [t('man', 1, 'a')];
    const ai = { ...createInitialPlayerState('ai', true, 1), isRiichi: true };
    ai.discard = [t('pin', 2, 'b')];
    render(
      <UIBoard
        players={[me, ai, createInitialPlayerState('ai2', true, 2), createInitialPlayerState('ai3', true, 3)]}
        dora={[]}
        kyoku={1}
        wallCount={70}
        kyotaku={0}
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
      />,
    );
    expect(screen.getAllByTestId('riichi-indicator').length).toBe(2);
  });
});

describe('UIBoard win options', () => {
  it('shows tsumo and pass buttons when tsumoOption true', () => {
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
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
        tsumoOption={true}
      />,
    );
    expect(screen.getByText('ツモ')).toBeTruthy();
    expect(screen.getByText('スルー')).toBeTruthy();
  });

  it('shows ron and pass buttons when ronOption true', () => {
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
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
        lastDiscard={null}
        ronOption={true}
      />,
    );
    expect(screen.getByText('ロン')).toBeTruthy();
    expect(screen.getAllByText('スルー').length).toBe(1);
  });
});
