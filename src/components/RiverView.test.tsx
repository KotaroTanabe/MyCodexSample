// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import {
  RiverView,
  RIVER_COLS,
  RESERVED_RIVER_SLOTS,
  RESERVED_RIVER_SLOTS_MOBILE,
  RIVER_GAP_PX,
  CALLED_OFFSET,
  GRID_CLASS,
} from './RiverView';
import { Tile } from '../types/mahjong';
import { rotationForSeat } from '../utils/rotation';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

let originalWidth: number;

beforeEach(() => {
  originalWidth = window.innerWidth;
});

afterEach(() => {
  Object.defineProperty(window, 'innerWidth', { value: originalWidth, writable: true });
  cleanup();
});

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
    expect(div.children.length).toBe(RESERVED_RIVER_SLOTS + 1);
  });

  it('uses fewer slots on small screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    render(<RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv-m" />);
    const div = screen.getByTestId('rv-m');
    expect(div.children.length).toBe(RESERVED_RIVER_SLOTS_MOBILE + 1);
  });

  it('rotates riichi discards', () => {
    const tiles = [t('man', 1, 'a'), { ...t('man', 2, 'b'), riichiDiscard: true }];
    render(<RiverView tiles={tiles} seat={0} lastDiscard={null} dataTestId="rv" />);
    const tileEls = screen.getByTestId('rv').querySelectorAll('[style]');
    expect(tileEls[1].getAttribute('style')).toContain('rotate(90deg)');
  });

  it('offsets called tiles using the constant and rotates based on caller', () => {
    const tiles = [{ ...t('pin', 5, 'c'), called: true, calledFrom: 1 }];
    render(
      <RiverView tiles={tiles} seat={2} lastDiscard={null} dataTestId="rv-called" />,
    );
    const tile = screen.getByTestId('rv-called').querySelector('[style]');
    const style = tile?.getAttribute('style') || '';
    expect(style).toContain(`translateX(-${CALLED_OFFSET})`);
    expect(style).toContain('rotate(90deg)');
  });

  it('rotates called tile horizontally when from opposite seat', () => {
    const tiles = [{ ...t('pin', 5, 'd'), called: true, calledFrom: 2 }];
    render(
      <RiverView tiles={tiles} seat={0} lastDiscard={null} dataTestId="rv-opp" />,
    );
    const tile = screen.getByTestId('rv-opp').querySelector('[style]');
    const style = tile?.getAttribute('style') || '';
    expect(style).toContain('rotate(90deg)');
    expect(style).not.toContain('rotate(180deg)');
  });

  it('rotates called tile based on caller to the right', () => {
    const tiles = [{ ...t('pin', 5, 'e'), called: true, calledFrom: 0 }];
    render(
      <RiverView tiles={tiles} seat={3} lastDiscard={null} dataTestId="rv-right" />,
    );
    const tile = screen.getByTestId('rv-right').querySelector('[style]');
    const style = tile?.getAttribute('style') || '';
    expect(style).toContain('rotate(-90deg)');
  });

  it('moves called tiles to the end of the river', () => {
    const tiles = [
      t('man', 1, 'a'),
      { ...t('pin', 5, 'b'), called: true, calledFrom: 1 },
      t('sou', 2, 'c'),
    ];
    render(
      <RiverView tiles={tiles} seat={0} lastDiscard={null} dataTestId="rv-order" />,
    );
    const tileEls = screen.getByTestId('rv-order').querySelectorAll('[aria-label]');
    const labels = Array.from(tileEls).map(el => el.getAttribute('aria-label'));
    expect(labels).toEqual(['1萬', '2索', '5筒']);
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

  it('uses content-width columns for the river grid', () => {
    render(<RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="grid" />);
    const div = screen.getByTestId('grid');
    const className = div.getAttribute('class') || '';
    expect(className).toContain('grid-cols-[repeat(6,_max-content)]');
  });

  it('applies the same grid size for all seats', () => {
    [0, 1, 2, 3].forEach(seat => {
      render(
        <RiverView tiles={[]} seat={seat} lastDiscard={null} dataTestId={`grid-${seat}`} />,
      );
      const div = screen.getByTestId(`grid-${seat}`);
      const className = div.getAttribute('class') || '';
      expect(className.includes(GRID_CLASS)).toBe(true);
      cleanup();
    });
  });

  it('rotates the container for each seat', () => {
    [0, 1, 2, 3].forEach(seat => {
      render(
        <RiverView tiles={[]} seat={seat} lastDiscard={null} dataTestId={`rot-${seat}`} />,
      );
      const div = screen.getByTestId(`rot-${seat}`);
      expect(div.style.transform).toBe(`rotate(${rotationForSeat(seat)}deg)`);
      cleanup();
    });
  });

  it('scrolls when discards exceed reserved slots', () => {
    const tiles = Array.from({ length: RESERVED_RIVER_SLOTS + 2 }, (_, i) =>
      t('man', ((i % 9) + 1) as number, `t${i}`),
    );
    render(
      <RiverView tiles={tiles} seat={0} lastDiscard={null} dataTestId="rv-long" />,
    );
    const div = screen.getByTestId('rv-long');
    const rowCount = RESERVED_RIVER_SLOTS / RIVER_COLS;
    const gapPx = RIVER_GAP_PX * (rowCount - 1);
    const expected = `calc((var(--tile-font-size) + 4px) * ${rowCount} + ${gapPx}px)`;
    expect(div.style.overflowY).toBe('auto');
    expect(div.style.maxHeight).toBe(expected);
    expect(div.style.height).toBe(expected);
  });

  it('uses the same container height with and without tiles', () => {
    render(<RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv-empty" />);
    const emptyDiv = screen.getByTestId('rv-empty');
    const rowCount = RESERVED_RIVER_SLOTS / RIVER_COLS;
    const gapPx = RIVER_GAP_PX * (rowCount - 1);
    const expected = `calc((var(--tile-font-size) + 4px) * ${rowCount} + ${gapPx}px)`;
    expect(emptyDiv.style.height).toBe(expected);
    cleanup();

    const tiles = Array.from({ length: 5 }, (_, i) => t('man', i + 1 as number, `m${i}`));
    render(<RiverView tiles={tiles} seat={0} lastDiscard={null} dataTestId="rv-filled" />);
    const filledDiv = screen.getByTestId('rv-filled');
    expect(filledDiv.style.height).toBe(expected);
  });

  it('renders tile-sized placeholders for empty slots', () => {
    render(<RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv-pl" />);
    const div = screen.getByTestId('rv-pl');
    const placeholder = div.querySelector('span.opacity-0');
    const className = placeholder?.getAttribute('class') || '';
    expect(className).toContain('px-0.5');
    expect(className).toContain('py-px');
    expect(className).not.toContain('border');
    expect(placeholder?.textContent).toBe('🀇');
  });

  it('applies border by default and can be removed', () => {
    render(<RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv-bd" />);
    const div = screen.getByTestId('rv-bd');
    expect(div.className).toContain('border');
    cleanup();
    render(
      <RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv-nb" showBorder={false} />,
    );
    const nb = screen.getByTestId('rv-nb');
    expect(nb.className).not.toContain('border');
  });

  it('displays a background label when border is shown', () => {
    render(
      <RiverView tiles={[]} seat={0} lastDiscard={null} dataTestId="rv-label" />,
    );
    const div = screen.getByTestId('rv-label');
    const label = div.querySelector('span[aria-hidden="true"]');
    expect(label?.textContent).toBe('河');
  });

  it('hides the background label when border is off', () => {
    render(
      <RiverView
        tiles={[]}
        seat={0}
        lastDiscard={null}
        dataTestId="rv-label-off"
        showBorder={false}
      />,
    );
    const div = screen.getByTestId('rv-label-off');
    const label = div.querySelector('span[aria-hidden="true"]');
    expect(label).toBeNull();
  });

});
