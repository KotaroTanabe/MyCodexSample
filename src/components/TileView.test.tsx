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
});
