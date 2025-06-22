// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { RiverView } from './RiverView';
import { Tile } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

afterEach(() => cleanup());

describe('RiverView', () => {
  it('applies rotation for the seat', () => {
    render(<RiverView tiles={[]} seat={2} lastDiscard={null} dataTestId="rv" />);
    const div = screen.getByTestId('rv');
    expect(div.style.transform).toContain('rotate(180deg)');
  });

  it('reverses order when needed', () => {
    const tiles = [t('man', 1, 'a'), t('man', 2, 'b')];
    render(<RiverView tiles={tiles} seat={1} lastDiscard={null} dataTestId="rv" />);
    const div = screen.getByTestId('rv');
    expect((div.firstChild as HTMLElement | null)?.getAttribute('aria-label')).toBe('2萬');
    expect((div.lastChild as HTMLElement | null)?.getAttribute('aria-label')).toBe('1萬');
  });
});
