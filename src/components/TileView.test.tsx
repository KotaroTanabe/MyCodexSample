import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TileView } from './TileView';
import { Tile } from '../types/mahjong';

describe('TileView', () => {
  it('shows a star overlay when shonpai', () => {
    const tile: Tile = { suit: 'man', rank: 1, id: 'm1' };
    const html = renderToStaticMarkup(<TileView tile={tile} isShonpai />);
    expect(html).toContain('★');
    expect(html).toContain('absolute');
  });

  it('applies rotation style', () => {
    const tile: Tile = { suit: 'man', rank: 2, id: 'm2' };
    const html = renderToStaticMarkup(<TileView tile={tile} rotate={90} />);
    expect(html).toContain('rotate(90deg)');
  });
});
