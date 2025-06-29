// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { HandView, RESERVED_HAND_SLOTS } from './HandView';
import { Tile } from '../types/mahjong';

function t(suit: Tile['suit'], rank: number, id: string): Tile {
  return { suit, rank, id };
}

describe('HandView', () => {
  afterEach(() => cleanup());

  it('reserves a slot for the drawn tile even when none is present', () => {
    const tiles = Array.from({ length: 13 }, (_, i) => t('man', ((i % 9) + 1) as number, `m${i}`));
    render(<HandView tiles={tiles} drawnTile={null} onDiscard={() => {}} isMyTurn />);
    const container = screen.getByText('手牌').parentElement as HTMLElement;
    expect(container.children.length).toBe(RESERVED_HAND_SLOTS + 1);
    const drawSlot = container.querySelector('span.opacity-0.ml-4');
    expect(drawSlot).toBeTruthy();
    expect(drawSlot?.textContent).toBe('🀇');
  });

  it('shows border by default and can hide it', () => {
    const tiles = Array.from({ length: 13 }, (_, i) => t('man', i + 1, `a${i}`));
    render(
      <HandView
        tiles={tiles}
        drawnTile={null}
        onDiscard={() => {}}
        isMyTurn
        dataTestId="hv"
      />,
    );
    const container = screen.getByTestId('hv');
    expect(container.className).toContain('border');
    cleanup();
    render(
      <HandView
        tiles={tiles}
        drawnTile={null}
        onDiscard={() => {}}
        isMyTurn
        dataTestId="hv2"
        showBorder={false}
      />,
    );
    expect(screen.getByTestId('hv2').className).not.toContain('border');
  });
});
