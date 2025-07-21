import { describe, expect, it } from 'vitest';
import { generateTileWall, drawDoraIndicator } from './TileWall';

// Simple unit test to ensure tile wall has correct number of tiles

describe('generateTileWall', () => {
  it('creates 136 tiles with unique ids', () => {
    const wall = generateTileWall();
    expect(wall).toHaveLength(136);
    const ids = new Set(wall.map(t => t.id));
    expect(ids.size).toBe(wall.length);
  });

  it('adds red tiles when specified', () => {
    const wall = generateTileWall(1);
    const reds = wall.filter(t => t.red);
    expect(reds).toHaveLength(3);
  });
});

describe('drawDoraIndicator', () => {
  it('removes indicator tiles from the wall', () => {
    const wall = generateTileWall();
    const original = [...wall];
    const { dora, wall: remaining } = drawDoraIndicator(wall, 1);
    expect(dora).toEqual(original.slice(0, 1));
    expect(remaining).toEqual(original.slice(1));
  });
});
