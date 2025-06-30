// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';

describe('GameController load board', () => {
  it('loads sample board data', async () => {
    const { container } = render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    fireEvent.click(screen.getAllByText('盤面読み込み')[0]);
    const melds = container.querySelectorAll('div.bg-gray-50');
    expect(melds.length).toBeGreaterThan(0);
    expect(screen.getByText('盤面を読み込みました')).toBeTruthy();
  });

  it('loads kan variant preset', async () => {
    render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    const select = screen.getAllByLabelText('プリセット')[0];
    fireEvent.change(select, { target: { value: 'kanVariants' } });
    fireEvent.click(screen.getAllByText('盤面読み込み')[0]);
    const text = screen.getAllByLabelText('盤面入力')[0] as HTMLTextAreaElement;
    const board = JSON.parse(text.value);
    const kanCount = board.players.reduce(
      (c: number, p: any) => c + p.melds.filter((m: any) => m.type === 'kan').length,
      0,
    );
    expect(kanCount).toBeGreaterThanOrEqual(3);
  });

  it('loads allFuro preset', async () => {
    render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    const select = screen.getAllByLabelText('プリセット')[0];
    fireEvent.change(select, { target: { value: 'allFuro' } });
    fireEvent.click(screen.getAllByText('盤面読み込み')[0]);
    const text = screen.getAllByLabelText('盤面入力')[0] as HTMLTextAreaElement;
    const board = JSON.parse(text.value);
    expect(board.players.every((p: any) => p.melds.length > 0)).toBe(true);
    expect(board.wall.length).toBeGreaterThan(0);
    expect(board.dora.length).toBeGreaterThan(0);
  });
});
