// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import {
  RiverView,
  RESERVED_RIVER_SLOTS,
  RESERVED_RIVER_SLOTS_MOBILE,
  RIVER_GAP_PX,
  CALLED_OFFSET_PX,
  GRID_CLASS,
} from './RiverView';
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

  it('uses fewer slots on small screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    render(<RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv-m" />);
    const div = screen.getByTestId('rv-m');
    expect(div.children.length).toBe(RESERVED_RIVER_SLOTS_MOBILE);
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
  });

  it('rotates riichi discards', () => {
    const tiles = [t('man', 1, 'a'), { ...t('man', 2, 'b'), riichiDiscard: true }];
    render(<RiverView tiles={tiles} seat={0} lastDiscard={null} dataTestId="rv" />);
    const tileEls = screen.getByTestId('rv').querySelectorAll('[style]');
    expect(tileEls[1].getAttribute('style')).toContain('rotate(90deg)');
  });

  it('offsets called tiles using the constant', () => {
    const tiles = [{ ...t('pin', 5, 'c'), called: true }];
    render(
      <RiverView tiles={tiles} seat={2} lastDiscard={null} dataTestId="rv-called" />,
    );
    const tile = screen.getByTestId('rv-called').querySelector('[style]');
    expect(tile?.getAttribute('style')).toContain(
      `translateX(-${CALLED_OFFSET_PX}px)`,
    );
  });

  it('uses consistent gap for all seats', () => {
    [0, 1, 2, 3].forEach(seat => {
      render(
        <RiverView tiles={[]} seat={seat} lastDiscard={null} dataTestId={`gap-${seat}`} />,
      );
      const div = screen.getByTestId(`gap-${seat}`);
      expect(div.style.gap).toBe(`${RIVER_GAP_PX}px`);
      cleanup();
    });
  });

  it('applies the same grid size for all seats', () => {
    [0, 1, 2, 3].forEach(seat => {
      render(
        <RiverView tiles={[]} seat={seat} lastDiscard={null} dataTestId={`grid-${seat}`} />,
      );
      const div = screen.getByTestId(`grid-${seat}`);
      const className = div.getAttribute('class') || '';
      expect(className).toBe(GRID_CLASS);
      cleanup();
    });
  });

});
