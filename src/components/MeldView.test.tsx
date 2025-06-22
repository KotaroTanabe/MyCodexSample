import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MeldView } from './MeldView';
import { Meld } from '../types/mahjong';

describe('MeldView', () => {
  it('renders all tiles in the meld', () => {
    const meld: Meld = {
      type: 'chi',
      tiles: [
        { suit: 'man', rank: 1, id: 'm1' },
        { suit: 'man', rank: 2, id: 'm2' },
        { suit: 'man', rank: 3, id: 'm3' },
      ],
      fromPlayer: 1,
      calledTileId: 'm2',
    };

    const html = renderToStaticMarkup(<MeldView meld={meld} />);
    const count = (html.match(/tile-font-size/g) || []).length;
    expect(count).toBe(3);
  });

  it('rotates the called tile 90 degrees', () => {
    const meld: Meld = {
      type: 'pon',
      tiles: [
        { suit: 'pin', rank: 5, id: 'p1' },
        { suit: 'pin', rank: 5, id: 'p2' },
        { suit: 'pin', rank: 5, id: 'p3' },
      ],
      fromPlayer: 2,
      calledTileId: 'p2',
    };
    const html = renderToStaticMarkup(<MeldView meld={meld} seat={1} />);
    const rotateCount = (html.match(/rotate\(180deg\)/g) || []).length;
    // seat rotation 90 + called tile rotation 90 -> 180deg
    expect(rotateCount).toBe(1);
  });

  it('applies seat rotation', () => {
    const meld: Meld = {
      type: 'chi',
      tiles: [
        { suit: 'man', rank: 4, id: 'm4' },
        { suit: 'man', rank: 5, id: 'm5' },
        { suit: 'man', rank: 6, id: 'm6' },
      ],
      fromPlayer: 3,
      calledTileId: 'm5',
    };
    const html = renderToStaticMarkup(<MeldView meld={meld} seat={2} />);
    // seat rotation of 180deg applied to two tiles, called tile rotates further
    const count = (html.match(/rotate\(180deg\)/g) || []).length;
    expect(count).toBe(2);
  });
});
