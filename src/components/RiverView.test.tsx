// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { RiverView, RESERVED_RIVER_SLOTS } from './RiverView';
import { Tile } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

afterEach(() => cleanup());

describe('RiverView', () => {
  it('applies rotation for the seat', () => {
    render(<RiverView tiles={[]} seat={2} lastDiscard={null} dataTestId="rv-2" />);
    let div = screen.getByTestId('rv-2');
    expect(div.style.transform).toContain('rotate(180deg)');
    render(<RiverView tiles={[]} seat={1} lastDiscard={null} dataTestId="rv-1" />);
    div = screen.getByTestId('rv-1');
    expect(div.style.transform).toContain('rotate(270deg)');
    render(<RiverView tiles={[]} seat={3} lastDiscard={null} dataTestId="rv-3" />);
    div = screen.getByTestId('rv-3');
    expect(div.style.transform).toContain('rotate(90deg)');
  });

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
});
