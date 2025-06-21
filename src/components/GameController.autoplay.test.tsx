// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';

describe('GameController auto play', () => {
  it('disables tile buttons when enabled', async () => {
    render(<GameController />);
    await screen.findByText('あなたの手牌');
    const checkbox = screen.getByLabelText('観戦モード');
    fireEvent.click(checkbox);
    const buttons = screen.getAllByRole('button');
    expect(buttons.some(b => b.disabled)).toBe(true);
  });
});
