import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MeldView } from './MeldView';
import { Meld, Tile } from '../types/mahjong';

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
    const htmlLeft = renderToStaticMarkup(
      <MeldView meld={{ ...base, fromPlayer: 3 }} seat={0} />,
    );

    expect(htmlRight).toContain('rotate(90deg)');
    expect(htmlLeft).toContain('rotate(-90deg)');
  });

  it('rotates called tile horizontally when from opposite seat', () => {
    const base: Meld = {
      type: 'pon',
      tiles: [
        { suit: 'man', rank: 1, id: 'x' },
        { suit: 'man', rank: 1, id: 'y' },
        { suit: 'man', rank: 1, id: 'z' },
      ],
      fromPlayer: 2,
      calledTileId: 'y',
    };
    const html = renderToStaticMarkup(<MeldView meld={base} seat={0} />);
    expect(html).toContain('rotate(90deg)');
    expect(html).not.toContain('rotate(180deg)');
  });

  it('rotates the whole meld for side seats', () => {
    const meld: Meld = {
      type: 'pon',
      tiles: [
        { suit: 'man', rank: 1, id: 'a' },
        { suit: 'man', rank: 1, id: 'b' },
        { suit: 'man', rank: 1, id: 'c' },
      ],
      fromPlayer: 0,
      calledTileId: 'a',
    };
    const html = renderToStaticMarkup(<MeldView meld={meld} seat={1} />);
    expect(html).toContain('rotate(270deg)');
  });

  it('shows face-down tiles for ankan', () => {
    const tiles: Tile[] = [
      { suit: 'man', rank: 9, id: 'a' },
      { suit: 'man', rank: 9, id: 'b' },
      { suit: 'man', rank: 9, id: 'c' },
      { suit: 'man', rank: 9, id: 'd' },
    ];
    const meld: Meld = {
      type: 'kan',
      tiles,
      fromPlayer: 0,
      calledTileId: 'a',
      kanType: 'ankan',
    };
    const html = renderToStaticMarkup(<MeldView meld={meld} />);
    const count = (html.match(/🂠/g) || []).length;
    expect(count).toBe(2);
  });

  it('renders kakan tile vertically', () => {
    const tiles: Tile[] = [
      { suit: 'sou', rank: 3, id: 'a' },
      { suit: 'sou', rank: 3, id: 'b' },
      { suit: 'sou', rank: 3, id: 'c' },
      { suit: 'sou', rank: 3, id: 'd' },
    ];
    const meld: Meld = {
      type: 'kan',
      tiles,
      fromPlayer: 0,
      calledTileId: 'd',
      kanType: 'kakan',
    };
    const html = renderToStaticMarkup(<MeldView meld={meld} />);
    const count = (html.match(/rotate\(90deg\)/g) || []).length;
    expect(count).toBe(1);
  });

  // Style-specific rotations are tested elsewhere; focus on tile count here.
});
