// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ShantenQuiz } from './ShantenQuiz';
import { Tile } from '../types/mahjong';

// The hand below is 1-shanten.
// Standard calculation finds 3 melds, 1 pair and no taatsu:
// 8 - 3*2 - 0 - 1 = 1. Chiitoi = 4, Kokushi = 9.
const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });
const hand: Tile[] = [
  t('man',1,'a'), t('man',2,'b'), t('man',3,'c'),
  t('man',4,'d'), t('man',5,'e'), t('man',6,'f'),
  t('man',7,'g'), t('man',8,'h'), t('man',9,'i'),
  t('pin',1,'j'), t('pin',1,'k'),
  t('sou',2,'l'), t('sou',2,'m'), t('sou',3,'n'),
];

afterEach(() => cleanup());

describe('ShantenQuiz', () => {
  it('shows "正解！" when the guess is correct', () => {
    render(<ShantenQuiz initialHand={hand} />);
    const input = screen.getByPlaceholderText('向聴数を入力');
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(screen.getByText('答える'));
    expect(screen.getByText('正解！')).toBeTruthy();
    expect(screen.getByText('向聴数: 1 - 標準形: 面子3組、対子2組、ターツ0組 -> 8 - 3*2 - 0 - 1 = 1')).toBeTruthy();
  });

  it('shows the correct answer when wrong', () => {
    render(<ShantenQuiz initialHand={hand} />);
    const input = screen.getByPlaceholderText('向聴数を入力');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByText('答える'));
    expect(screen.getByText('不正解。正解: 1')).toBeTruthy();
    expect(screen.getByText('向聴数: 1 - 標準形: 面子3組、対子2組、ターツ0組 -> 8 - 3*2 - 0 - 1 = 1')).toBeTruthy();
  });
});
