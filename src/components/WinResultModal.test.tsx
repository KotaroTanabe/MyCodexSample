// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WinResultModal } from './WinResultModal';
import { PlayerState, Tile } from '../types/mahjong';

function t(suit: Tile['suit'], rank: number, id: string): Tile {
  return { suit, rank, id };
}

const players: PlayerState[] = [
  { hand: [], discard: [], melds: [], score: 32000, isRiichi: false, ippatsu: false, doubleRiichi: false, name: 'A', isAI: false, drawnTile: null, seat: 0 },
  { hand: [], discard: [], melds: [], score: 28000, isRiichi: false, ippatsu: false, doubleRiichi: false, name: 'B', isAI: true, drawnTile: null, seat: 1 },
];

const hand = [t('man', 1, 'm1'), t('man', 2, 'm2')];
const winTile = t('man', 2, 'm2');

describe('WinResultModal', () => {
  it('shows custom next label', () => {
    render(
      <WinResultModal
        players={players}
        winner={0}
        winType="tsumo"
        hand={hand}
        melds={[]}
        winTile={winTile}
        yaku={['立直']}
        han={1}
        fu={30}
        points={1000}
        onNext={() => {}}
        nextLabel="次へ"
      />,
    );
    expect(screen.getByText('次へ')).toBeTruthy();
  });

  it('displays ura-dora tiles when provided', () => {
    render(
      <WinResultModal
        players={players}
        winner={0}
        winType="tsumo"
        hand={hand}
        melds={[]}
        winTile={winTile}
        yaku={['立直']}
        han={1}
        fu={30}
        points={1000}
        uraDora={[{ suit: 'man', rank: 1, id: 'u1' }]}
        onNext={() => {}}
      />,
    );
    expect(screen.getAllByLabelText('1萬').length).toBeGreaterThan(0);
  });

  it('shows winning hand and tile', () => {
    render(
      <WinResultModal
        players={players}
        winner={0}
        winType="ron"
        hand={hand}
        melds={[]}
        winTile={winTile}
        yaku={['立直']}
        han={1}
        fu={30}
        points={1000}
        onNext={() => {}}
      />,
    );
    expect(screen.getAllByLabelText('1萬').length).toBeGreaterThan(0);
  });
});
