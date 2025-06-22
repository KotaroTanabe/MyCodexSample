// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';

describe('GameController auto play', () => {
  it('disables tile buttons when enabled', async () => {
    const { container } = render(<GameController />);
    await screen.findByText('あなたの手牌');
    const checkbox = screen.getByLabelText('観戦モード');
    fireEvent.click(checkbox);
    const buttons = container.querySelectorAll('button');
    expect(Array.from(buttons).some(b => (b as HTMLButtonElement).disabled)).toBe(true);
  });
});
