// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { RiverView, RESERVED_RIVER_SLOTS } from './RiverView';
import { Tile } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

afterEach(() => cleanup());

describe('RiverView', () => {

  it('keeps order for left seat', () => {
    const tiles = [t('man', 1, 'a'), t('man', 2, 'b')];
    render(<RiverView tiles={tiles} seat={3} lastDiscard={null} dataTestId="rv" />);
    const div = screen.getByTestId('rv');
    const tileEls = div.querySelectorAll('[aria-label]');
    expect(tileEls[0].getAttribute('aria-label')).toBe('1萬');
    expect(tileEls[tileEls.length - 1].getAttribute('aria-label')).toBe('2萬');
  });

  it('keeps order for opposite seat', () => {
    const tiles = [t('man', 1, 'a'), t('man', 2, 'b')];
    render(<RiverView tiles={tiles} seat={2} lastDiscard={null} dataTestId="rv-nr" />);
    const div = screen.getByTestId('rv-nr');
    const tileEls = div.querySelectorAll('[aria-label]');
    expect(tileEls[0].getAttribute('aria-label')).toBe('1萬');
    expect(tileEls[tileEls.length - 1].getAttribute('aria-label')).toBe('2萬');
  });

  it('reserves space for empty river', () => {
    render(<RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv" />);
    const div = screen.getByTestId('rv');
    expect(div.children.length).toBe(RESERVED_RIVER_SLOTS);
  });

  it('rotates riichi discards', () => {
    const tiles = [t('man', 1, 'a'), { ...t('man', 2, 'b'), riichiDiscard: true }];
    render(<RiverView tiles={tiles} seat={0} lastDiscard={null} dataTestId="rv" />);
    const tileEls = screen.getByTestId('rv').querySelectorAll('[style]');
    expect(tileEls[1].getAttribute('style')).toContain('rotate(90deg)');
  });

});
