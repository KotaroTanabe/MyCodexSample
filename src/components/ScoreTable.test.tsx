// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import { ScoreTable } from './ScoreTable';

describe('ScoreTable', () => {
  afterEach(() => cleanup());
  it('shows 30fu 2han child ron as 2000', () => {
    render(<ScoreTable isDealer={false} winType="ron" />);
    const rows = screen.getAllByRole('row');
    const row30 = rows[3];
    const cells = within(row30).getAllByRole('cell');
    // Debug row content to ensure correct index
    // console.log(row30.textContent, cells.map(c => c.textContent));
    expect(cells[2].textContent).toBe('2000');
  });

  it('shows 30fu 2han child tsumo split payments', () => {
    render(<ScoreTable isDealer={false} winType="tsumo" />);
    const rows = screen.getAllByRole('row');
    const row30 = rows[3];
    const cells = within(row30).getAllByRole('cell');
    // console.log(row30.textContent, cells.map(c => c.textContent));
    expect(cells[2].textContent).toBe('500-1000');
  });
});
