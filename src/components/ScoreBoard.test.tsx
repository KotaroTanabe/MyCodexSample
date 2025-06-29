// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBoard } from './ScoreBoard';

describe('ScoreBoard', () => {
  it('displays kyoku, wall count, honba and kyotaku count', () => {
    render(<ScoreBoard kyoku={1} wallCount={69} kyotaku={2} honba={2} />);
    expect(screen.getByTestId('score-board')).toBeTruthy();
    expect(screen.getByText('東1局')).toBeTruthy();
    expect(screen.getByText('残り69')).toBeTruthy();
    expect(screen.getByText('2本場')).toBeTruthy();
    expect(screen.getByText('供託')).toBeTruthy();
    const kyotaku = screen.getByTestId('kyotaku');
    expect(kyotaku.textContent).toBe('2');
  });
});
