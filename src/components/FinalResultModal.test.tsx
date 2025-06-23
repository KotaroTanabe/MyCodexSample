// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinalResultModal } from './FinalResultModal';
import { PlayerState } from '../types/mahjong';

const players: PlayerState[] = [
  { hand: [], discard: [], melds: [], score: 30000, isRiichi: false, ippatsu: false, name: 'A', isAI: false, drawnTile: null, seat: 0 },
  { hand: [], discard: [], melds: [], score: 20000, isRiichi: false, ippatsu: false, name: 'B', isAI: true, drawnTile: null, seat: 1 },
];

describe('FinalResultModal', () => {
  it('renders players sorted by score', () => {
    render(<FinalResultModal players={players} onReplay={() => {}} />);
    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('A');
  });
});
