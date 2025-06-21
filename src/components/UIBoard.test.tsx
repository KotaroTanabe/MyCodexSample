// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UIBoard } from './UIBoard';
import { createInitialPlayerState } from './Player';
import { Tile } from '../types/mahjong';

const basePlayer = createInitialPlayerState('you', false);

function renderBoard(shanten: { standard: number; chiitoi: number; kokushi: number }) {
  const props = {
    players: [basePlayer],
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
