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

  it('rotates called tile based on fromPlayer', () => {
    const base: Meld = {
      type: 'pon',
      tiles: [
        { suit: 'man', rank: 1, id: 'a' },
        { suit: 'man', rank: 1, id: 'b' },
        { suit: 'man', rank: 1, id: 'c' },
      ],
      fromPlayer: 1,
      calledTileId: 'a',
    };
    const htmlRight = renderToStaticMarkup(<MeldView meld={base} seat={0} />);
    const rotRight = /rotate\(([-0-9]+)deg\)/.exec(htmlRight)![1];

    const htmlLeft = renderToStaticMarkup(
      <MeldView meld={{ ...base, fromPlayer: 3 }} seat={0} />,
    );
    const rotLeft = /rotate\(([-0-9]+)deg\)/.exec(htmlLeft)![1];

    expect(rotRight).not.toBe(rotLeft);
  });

  // Style-specific rotations are tested elsewhere; focus on tile count here.
});
