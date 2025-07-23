// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';
import type { Tile, Suit } from '../types/mahjong';

function createOrderedWall(): Tile[] {
  const suits: Suit[] = ['man', 'pin', 'sou'];
  const honors: { suit: Suit; rank: number }[] = [
    { suit: 'wind', rank: 1 },
    { suit: 'wind', rank: 2 },
    { suit: 'wind', rank: 3 },
    { suit: 'wind', rank: 4 },
    { suit: 'dragon', rank: 1 },
    { suit: 'dragon', rank: 2 },
    { suit: 'dragon', rank: 3 },
  ];
  const tiles: Tile[] = [];
  let id = 1;
  for (const s of suits) {
    for (let r = 1; r <= 9; r++) {
      for (let i = 0; i < 4; i++) {
        tiles.push({ suit: s, rank: r, id: `t${id++}` });
      }
    }
  }
  for (const h of honors) {
    for (let i = 0; i < 4; i++) {
      tiles.push({ suit: h.suit, rank: h.rank, id: `t${id++}` });
    }
  }
  return tiles;
}

const presetHand: Tile[] = [
  { suit: 'man', rank: 1, id: 'a1' },
  { suit: 'man', rank: 1, id: 'a2' },
  { suit: 'man', rank: 2, id: 'b1' },
  { suit: 'man', rank: 2, id: 'b2' },
  { suit: 'man', rank: 3, id: 'c1' },
  { suit: 'man', rank: 3, id: 'c2' },
  { suit: 'man', rank: 4, id: 'd1' },
  { suit: 'man', rank: 4, id: 'd2' },
  { suit: 'man', rank: 5, id: 'e1' },
  { suit: 'man', rank: 5, id: 'e2' },
  { suit: 'man', rank: 6, id: 'f1' },
  { suit: 'man', rank: 6, id: 'f2' },
  { suit: 'man', rank: 7, id: 'g1' },
];
const drawTile: Tile = { suit: 'man', rank: 8, id: 'h1' };

vi.mock('./TileWall', async () => {
  const actual = await vi.importActual<typeof import('./TileWall')>('./TileWall');
  return {
    ...actual,
    generateTileWall: () => {
      const wall = createOrderedWall();
      for (let i = 0; i < presetHand.length; i++) wall[i] = presetHand[i];
      wall[52] = drawTile;
      return wall;
    },
  };
});

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('GameController riichi discard', () => {
  it.skip('allows discarding a non-drawn tile after declaring riichi', async () => {
    render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    fireEvent.click(screen.getByText('リーチ'));
    const tileBtn = screen.getAllByRole('button', { name: '7萬' })[0];
    fireEvent.click(tileBtn);
    expect(screen.queryByText('リーチ後はツモ牌しか切れません')).toBeNull();
  });
});
