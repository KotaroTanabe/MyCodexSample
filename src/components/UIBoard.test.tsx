// @vitest-environment jsdom
import React from 'react'; // needed for JSX linting
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { UIBoard } from './UIBoard';
import { createInitialPlayerState, canDeclareRiichi } from './Player';
import { RESERVED_HAND_SLOTS } from './HandView';
import { Tile } from '../types/mahjong';
import { rotationForSeat } from '../utils/rotation';
import { tilesFromString, tileToKanji } from '../utils/tileString';
import { countUkeireTiles } from '../utils/ukeire';
import type { PlayerState, Meld } from "../types/mahjong";

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

  it('displays winning tiles tooltip when in tenpai', () => {
    const hand = tilesFromString('2345677p8p22345s1m');
    const { counts } = countUkeireTiles(hand, 0);
    const expected = Object.keys(counts)
      .map(k => {
        const [suit, r] = k.split('-');
        return tileToKanji({ suit: suit as Tile['suit'], rank: parseInt(r, 10), id: '' });
      })
      .join(' ');
    const player = { ...createInitialPlayerState('you', false) } as PlayerState;
    player.hand = hand;
    player.drawnTile = hand[hand.length - 1];
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
        shanten={{ standard: 0, chiitoi: 8, kokushi: 13 }}
        lastDiscard={null}
      />,
    );
    const elem = screen.getByTestId('winning-tiles');
    expect(elem).toBeTruthy();
    expect(elem.getAttribute('title')).toBe(expected);
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

  it('recognizes Yakuhai with seat wind pon when shanten is negative', () => {
    const player = {
      ...createInitialPlayerState('you', false, 0),
    } as PlayerState;
    player.melds = [
      {
        type: 'pon',
        tiles: [t('wind', 1, 'e1'), t('wind', 1, 'e2'), t('wind', 1, 'e3')],
        fromPlayer: 1,
        calledTileId: 'e1',
      },
    ];
    player.hand = [
      t('man', 2, 'm2a'),
      t('man', 3, 'm3a'),
      t('man', 4, 'm4a'),
      t('pin', 2, 'p2a'),
      t('pin', 3, 'p3a'),
      t('pin', 4, 'p4a'),
      t('sou', 2, 's2a'),
      t('sou', 3, 's3a'),
      t('sou', 4, 's4a'),
      t('man', 5, 'm5a'),
      t('man', 5, 'm5b'),
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

  it('shows no-yaku notice when shanten is negative but hand has no yaku', () => {
    const player = { ...createInitialPlayerState('you', false) } as PlayerState;
    player.melds = [
      {
        type: 'chi',
        tiles: [t('man', 1, 'c1'), t('man', 2, 'c2'), t('man', 3, 'c3')],
        fromPlayer: 1,
        calledTileId: 'c2',
      },
    ];
    player.hand = [
      t('man', 4, 'm4'),
      t('man', 5, 'm5'),
      t('man', 6, 'm6'),
      t('pin', 1, 'p1'),
      t('pin', 2, 'p2'),
      t('pin', 3, 'p3'),
      t('pin', 4, 'p4'),
      t('pin', 5, 'p5'),
      t('pin', 6, 'p6'),
      t('sou', 9, 's9a'),
      t('sou', 9, 's9b'),
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
    expect(screen.getByText('役なし')).toBeTruthy();
    expect(screen.queryByText('向聴数: -1')).toBeNull();
  });
});

describe('UIBoard layout stability', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({
    suit,
    rank,
    id,
  });
  it('keeps seat areas fixed as tiles change', () => {
    const { rerender } = render(
      <UIBoard
        players={[
          createInitialPlayerState('you', false, 0),
          createInitialPlayerState('AI下家', true, 1),
          createInitialPlayerState('AI対面', true, 2),
          createInitialPlayerState('AI上家', true, 3),
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
    const board = screen.getByTestId('ui-board');
    const initialGrid = board.style.gridTemplateAreas;
    const aiShimo = screen
      .getByText(content => content.startsWith('AI下家'))
      .parentElement?.parentElement as HTMLElement;
    const initialArea = aiShimo.style.gridArea;

    const players = [
      createInitialPlayerState('you', false, 0),
      createInitialPlayerState('AI下家', true, 1),
      createInitialPlayerState('AI対面', true, 2),
      createInitialPlayerState('AI上家', true, 3),
    ];
    players[1].discard = [
      t('man', 1, 'd1'),
      t('man', 2, 'd2'),
      t('man', 3, 'd3'),
    ];
    players[0].melds = [
      {
        tiles: [t('man', 4, 'm1'), t('man', 5, 'm2'), t('man', 6, 'm3')],
        type: 'chi',
        fromPlayer: 1,
        calledTileId: 'm1',
      },
    ];
    rerender(
      <UIBoard
        players={players}
        dora={[]}
        kyoku={1}
        wallCount={67}
        kyotaku={0}
        honba={0}
        onDiscard={() => {}}
        isMyTurn={true}
        shanten={{ standard: 0, chiitoi: 0, kokushi: 13 }}
        lastDiscard={null}
      />,
    );
    const updatedBoard = screen.getByTestId('ui-board');
    const updatedAiShimo = screen
      .getByText(content => content.startsWith('AI下家'))
      .parentElement?.parentElement as HTMLElement;
    expect(updatedBoard.style.gridTemplateAreas).toBe(initialGrid);
    expect(updatedAiShimo.style.gridArea).toBe(initialArea);
    expect(updatedAiShimo).toBe(aiShimo);
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
    const handLabel = screen.getAllByText('手牌')[0];
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
    const handLabel = screen.getAllByText('手牌')[0];
    const container = handLabel.parentElement as HTMLElement;
    expect(container.children.length).toBe(RESERVED_HAND_SLOTS + 2);
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
    const handLabel = screen.getAllByText('手牌')[0];
    const container = handLabel.parentElement as HTMLElement;
    expect(container.children.length).toBe(RESERVED_HAND_SLOTS + 2);
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
    expect(board.style.gridTemplateAreas).toContain('center');
    expect(board.className).toContain('gap-0');
    const info = screen.getByTestId('info-area');
    expect(info.style.gridArea).toBe('center');
  });

  it('stacks scoreboard and dora display vertically', () => {
    renderBoard({ standard: 1, chiitoi: 1, kokushi: 13 });
    const info = screen.getByTestId('info-area');
    expect(info.className).toContain('flex-col');
  });
});

describe('UIBoard borders option', () => {
  it('hides borders when disabled', () => {
    render(
      <UIBoard
        players={[
          createInitialPlayerState('me', false),
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
        showBorders={false}
      />,
    );
    const river = screen.getByTestId('discard-seat-0');
    expect(river.className).not.toContain('border');
    const handContainer = screen.getAllByText('手牌')[0].parentElement as HTMLElement;
    expect(handContainer.className).not.toContain('border');
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

  it('rotates riichi stick toward center for each seat', () => {
    [0, 1, 2, 3].forEach(seat => {
      const players = [
        createInitialPlayerState('p0', false, 0),
        createInitialPlayerState('p1', true, 1),
        createInitialPlayerState('p2', true, 2),
        createInitialPlayerState('p3', true, 3),
      ];
      players[seat].isRiichi = true;
      render(
        <UIBoard
          players={players}
          dora={[]}
          kyoku={1}
          wallCount={70}
          kyotaku={0}
          honba={0}
          onDiscard={() => {}}
          isMyTurn={seat === 0}
          shanten={{ standard: 0, chiitoi: 0, kokushi: 0 }}
          lastDiscard={null}
        />,
      );
      const stick = screen
        .getByTestId('riichi-indicator')
        .firstElementChild as HTMLElement;
      expect(stick.style.transform).toBe(
        `rotate(${rotationForSeat(seat) + 90}deg)`,
      );
      cleanup();
    });
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

describe('UIBoard hand count', () => {
  it('displays other players\' hand counts', () => {
    const makeTiles = (n: number) =>
      Array.from({ length: n }, (_, i) => t('man', 1, `t${i}`));
    const players: PlayerState[] = [
      createInitialPlayerState('me', false, 0),
      { ...createInitialPlayerState('ai1', true, 1), hand: makeTiles(13) },
      { ...createInitialPlayerState('ai2', true, 2), hand: makeTiles(7) },
      {
        ...createInitialPlayerState('ai3', true, 3),
        hand: [...makeTiles(13), t('man', 2, 'draw')],
        drawnTile: t('man', 2, 'draw'),
      },
    ];
    render(
      <UIBoard
        players={players}
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
    const hc1 = screen.getByTestId('hand-count-1');
    const hc2 = screen.getByTestId('hand-count-2');
    const hc3 = screen.getByTestId('hand-count-3');
    expect(hc1.textContent).toBe('🀫 x 13');
    expect(hc2.textContent).toBe('🀫 x 07');
    expect(hc3.textContent).toBe('🀫 x 14');
    [hc1, hc2, hc3].forEach(el => {
      expect(el.querySelector('.tile-font-size')).not.toBeNull();
    });
    const riverRight = screen.getByTestId('discard-seat-1');
    const riverTop = screen.getByTestId('discard-seat-2');
    const riverLeft = screen.getByTestId('discard-seat-3');
    expect(riverRight.parentElement?.lastElementChild).toBe(hc1);
    expect(riverTop.parentElement).toBe(hc2.parentElement);
    expect(riverLeft.parentElement?.firstElementChild).toBe(hc3);
  });
});

describe('UIBoard meld area placement', () => {
  it('places the player\'s melds next to their river', () => {
    const sampleMeld: Meld = {
      type: 'chi',
      tiles: [
        { suit: 'man', rank: 1, id: 'a' },
        { suit: 'man', rank: 2, id: 'b' },
        { suit: 'man', rank: 3, id: 'c' },
      ],
      fromPlayer: 1,
      calledTileId: 'b',
    };
    const players: PlayerState[] = [
      { ...createInitialPlayerState('me', false, 0), melds: [sampleMeld] },
      createInitialPlayerState('ai1', true, 1),
      createInitialPlayerState('ai2', true, 2),
      createInitialPlayerState('ai3', true, 3),
    ];
    render(
      <UIBoard
        players={players}
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
    const river = screen.getByTestId('discard-seat-0');
    const container = river.parentElement as HTMLElement;
    expect(container.children.length).toBe(2);
    const label = container.children[1].querySelector('span[aria-hidden="true"]');
    expect(label?.textContent).toBe('鳴き牌');
  });

  it('offsets kamicha meld area from the bottom edge', () => {
    const sampleMeld: Meld = {
      type: 'chi',
      tiles: [
        { suit: 'man', rank: 1, id: 'a' },
        { suit: 'man', rank: 2, id: 'b' },
        { suit: 'man', rank: 3, id: 'c' },
      ],
      fromPlayer: 0,
      calledTileId: 'b',
    };
    const players: PlayerState[] = [
      createInitialPlayerState('me', false, 0),
      createInitialPlayerState('ai1', true, 1),
      createInitialPlayerState('ai2', true, 2),
      { ...createInitialPlayerState('ai3', true, 3), melds: [sampleMeld] },
    ];
    render(
      <UIBoard
        players={players}
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
    const meld = screen.getByTestId('meld-seat-3');
    const wrapper = meld.parentElement as HTMLElement;
    expect(wrapper.className).toContain('bottom-[calc(var(--tile-font-size)*4)]');
  });
});
