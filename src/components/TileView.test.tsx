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

  it('includes extra transform', () => {
    const tile: Tile = { suit: 'man', rank: 3, id: 'm3' };
    const html = renderToStaticMarkup(
      <TileView tile={tile} extraTransform="translateX(5px)" />,
    );
    expect(html).toContain('translateX(5px)');
  });

  it('uses compact tile spacing', () => {
    const tile: Tile = { suit: 'man', rank: 4, id: 'm4' };
    const html = renderToStaticMarkup(<TileView tile={tile} />);
    expect(html).toContain('px-0.5');
    expect(html).toContain('py-px');
    expect(html).toContain('leading-none');
  });

  it('marks red tiles with text color', () => {
    const tile: Tile = { suit: 'pin', rank: 5, id: 'r', red: true };
    const html = renderToStaticMarkup(<TileView tile={tile} />);
    expect(html).toContain('text-red-600');
  });
});
