// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';

describe('GameController load board', () => {
  it('loads sample board data', async () => {
    const { container } = render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    fireEvent.click(screen.getByText('盤面読み込み'));
    const melds = container.querySelectorAll('div.bg-gray-50');
    expect(melds.length).toBeGreaterThan(0);
    expect(screen.getByText('盤面を読み込みました')).toBeTruthy();
  });
});
