// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { WinResultModal } from './WinResultModal';
import { PlayerState, Tile } from '../types/mahjong';

afterEach(() => cleanup());

function t(suit: Tile['suit'], rank: number, id: string): Tile {
  return { suit, rank, id };
}

const players: PlayerState[] = [
  { hand: [], discard: [], melds: [], score: 32000, isRiichi: false, ippatsu: false, doubleRiichi: false, name: 'A', isAI: false, drawnTile: null, seat: 0, chair: 0 },
  { hand: [], discard: [], melds: [], score: 28000, isRiichi: false, ippatsu: false, doubleRiichi: false, name: 'B', isAI: true, drawnTile: null, seat: 1, chair: 1 },
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
        dora={[]}
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
        dora={[]}
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
        dora={[]}
        onNext={() => {}}
      />,
    );
    expect(screen.getAllByText('あがり牌:')).toHaveLength(1);
    expect(screen.getAllByLabelText('2萬')).toHaveLength(2);
  });
  it('shows dora count in yaku text', () => {
    render(
      <WinResultModal
        players={players}
        winner={0}
        winType="tsumo"
        hand={hand}
        melds={[]}
        winTile={winTile}
        yaku={['立直']}
        han={2}
        fu={30}
        points={2000}
        dora={[t('man', 1, 'd1')]}
        onNext={() => {}}
      />,
    );
    expect(screen.getByText(/ドラ1/)).toBeTruthy();
  });


  it('calls copy callback', () => {
    const fn = vi.fn();
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
      dora={[]}
      onNext={() => {}}
        onCopyTenhou={fn}
        tenhouUrl="https://tenhou.net/6/#json=test"
      />,
    );
    screen.getByText('Tenhouログ コピー').click();
    expect(fn).toHaveBeenCalled();
    const link = screen.getByRole('link', { name: '天鳳牌譜エディタ' });
    expect(link.getAttribute('href')).toBe('https://tenhou.net/6/#json=test');
  });

  it('shows tsumo points text with split payments', () => {
    render(
      <WinResultModal
        players={players}
        winner={0}
        winType="tsumo"
        hand={hand}
        melds={[]}
        winTile={winTile}
        yaku={['立直']}
        han={2}
        fu={30}
        points={1000}
        dora={[]}
        onNext={() => {}}
      />,
    );
    expect(screen.getByText('1000点オール')).toBeTruthy();
    expect(screen.getByText('立直 2翻 30符')).toBeTruthy();
  });
});
