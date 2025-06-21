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

  it('adds rotate class to called tile', () => {
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
    const html = renderToStaticMarkup(<MeldView meld={meld} />);
    // ensure rotate class applied to the called tile span
    const rotateCount = (html.match(/rotate-90/g) || []).length;
    expect(rotateCount).toBe(1);
  });
});
