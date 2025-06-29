// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MeldArea, RESERVED_MELD_SLOTS } from './MeldArea';
import { Meld } from '../types/mahjong';

const sampleMeld: Meld = {
  type: 'chi',
  tiles: [
    { suit: 'man', rank: 1, id: 'a' },
    { suit: 'man', rank: 2, id: 'b' },
    { suit: 'man', rank: 3, id: 'c' },
  ],
  fromPlayer: 1,
  calledTileId: 'b',
};

describe('MeldArea', () => {
  afterEach(() => cleanup());

  it('reserves slots for melds', () => {
    render(<MeldArea melds={[]} seat={0} showBorder dataTestId="ma" />);
    const div = screen.getByTestId('ma');
    expect(div.children.length).toBe(RESERVED_MELD_SLOTS + 1);
  });

  it('shows border by default and can hide it', () => {
    render(<MeldArea melds={[]} seat={0} dataTestId="ma1" />);
    expect(screen.getByTestId('ma1').className).toContain('border');
    cleanup();
    render(<MeldArea melds={[]} seat={0} showBorder={false} dataTestId="ma2" />);
    expect(screen.getByTestId('ma2').className).not.toContain('border');
  });

  it('renders meld views for provided melds', () => {
    render(<MeldArea melds={[sampleMeld]} seat={0} dataTestId="ma3" />);
    const div = screen.getByTestId('ma3');
    // Should have RESERVED_MELD_SLOTS children including placeholders
    expect(div.children.length).toBe(RESERVED_MELD_SLOTS + 1);
  });

  it('displays a background label when border is shown', () => {
    render(<MeldArea melds={[]} seat={0} dataTestId="ma-label" />);
    const div = screen.getByTestId('ma-label');
    const label = div.querySelector('span[aria-hidden="true"]');
    expect(label?.textContent).toBe('鳴き牌');
  });

  it('hides the background label when border is off', () => {
    render(
      <MeldArea melds={[]} seat={0} dataTestId="ma-label-off" showBorder={false} />,
    );
    const div = screen.getByTestId('ma-label-off');
    const label = div.querySelector('span[aria-hidden="true"]');
    expect(label).toBeNull();
  });
});
