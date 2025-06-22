// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';

describe('GameController auto play', () => {
  it('disables tile buttons when enabled', async () => {
    const { container } = render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('あなたの手牌');
    const checkbox = screen.getAllByLabelText('観戦モード')[0];
    fireEvent.click(checkbox);
    const buttons = container.querySelectorAll('button');
    expect(Array.from(buttons).some(b => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it('AI discards when toggled during player turn', async () => {
    render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('あなたの手牌');
    const checkbox = screen.getAllByLabelText('観戦モード')[0];
    fireEvent.click(checkbox);
    await new Promise(r => setTimeout(r, 600));
    const star = await screen.findByText('★');
    expect(star).toBeTruthy();
  });
});
