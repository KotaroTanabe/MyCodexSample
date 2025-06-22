// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';

describe('GameController auto play', () => {
  vi.useFakeTimers();
  afterEach(() => {
    vi.useRealTimers();
  });
  it('disables tile buttons when enabled', async () => {
    vi.useRealTimers();
    const { container } = render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('あなたの手牌');
    const checkbox = screen.getAllByLabelText('観戦モード')[0];
    fireEvent.click(checkbox);
    const buttons = container.querySelectorAll('button');
    expect(Array.from(buttons).some(b => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it('AI discards when toggled during player turn', async () => {
    vi.useRealTimers();
    render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('あなたの手牌');
    vi.useFakeTimers();
    const checkbox = screen.getAllByLabelText('観戦モード')[0];
    fireEvent.click(checkbox);
    vi.advanceTimersByTime(600);
    vi.useRealTimers();
    const star = await screen.findByText('★');
    expect(star).toBeTruthy();
  });
});
