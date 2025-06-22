import { describe, it, expect } from 'vitest';
import { generateTileWall, drawDoraIndicator } from './TileWall';
import { createInitialPlayerState, drawTiles } from './Player';
import { payoutNoten } from '../utils/payout';

describe('round initialization wall size', () => {
  it('reserves 14 tiles for the dead wall resulting in 69 tiles remaining', () => {
    let wall = generateTileWall();
    let deadWall = wall.slice(0, 14);
    wall = wall.slice(14);
    const doraResult = drawDoraIndicator(deadWall, 1);
    deadWall = doraResult.wall;
    const players = [
      createInitialPlayerState('A', true, 0),
      createInitialPlayerState('B', true, 1),
      createInitialPlayerState('C', true, 2),
      createInitialPlayerState('D', true, 3),
    ];
    for (let i = 0; i < 4; i++) {
      const res = drawTiles(players[i], wall, 13);
      players[i] = res.player;
      wall = res.wall;
    }
    const extra = drawTiles(players[0], wall, 1);
    players[0] = extra.player;
    wall = extra.wall;
    // 136 total - 14 dead wall - 53 initial hands = 69 live wall tiles
    expect(wall.length).toBe(69);
  });
});

describe('exhausted wall ends the round in a draw', () => {
  it('applies noten payout when no tiles remain', () => {
    let wall = generateTileWall();
    let deadWall = wall.slice(0, 14);
    wall = wall.slice(14);
    const doraResult = drawDoraIndicator(deadWall, 1);
    deadWall = doraResult.wall;
    const players = [
      createInitialPlayerState('A', true, 0),
      createInitialPlayerState('B', true, 1),
      createInitialPlayerState('C', true, 2),
      createInitialPlayerState('D', true, 3),
    ];
    for (let i = 0; i < 4; i++) {
      const res = drawTiles(players[i], wall, 13);
      players[i] = res.player;
      wall = res.wall;
    }
    const extra = drawTiles(players[0], wall, 1);
    players[0] = extra.player;
    wall = extra.wall;

    // all remaining tiles are drawn
    wall = [];

    const tenpai = [true, false, false, true];
    // 2 players tenpai -> each noten player pays 1000 and each tenpai player gains 1000
    const { players: updated } = payoutNoten(players, tenpai);
    expect(updated.map(p => p.score)).toEqual([26000, 24000, 24000, 26000]);
  });
});
