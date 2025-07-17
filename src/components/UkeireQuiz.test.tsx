// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UkeireQuiz } from './UkeireQuiz';
import { Tile } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });
const hand: Tile[] = [
  t('man', 1, 'a1'), t('man', 1, 'a2'),
  t('man', 2, 'b1'), t('man', 2, 'b2'),
  t('man', 3, 'c1'),
  t('man', 4, 'd1'), t('man', 5, 'e1'), t('man', 6, 'f1'),
  t('pin', 1, 'g1'), t('pin', 1, 'g2'),
  t('sou', 2, 'h1'), t('sou', 2, 'h2'), t('sou', 3, 'h3'),
];

afterEach(() => cleanup());

describe('UkeireQuiz', () => {
  it('renders and accepts answers', () => {
    render(<UkeireQuiz initialHand={hand} />);
    fireEvent.change(screen.getByPlaceholderText('牌種'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('枚数'), { target: { value: '13' } });
    fireEvent.click(screen.getByText('答える'));
    expect(screen.getByText(/正解！|不正解/)).toBeTruthy();
  });
});
