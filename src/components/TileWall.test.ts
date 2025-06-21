import { describe, expect, it } from 'vitest';
import { generateTileWall } from './TileWall';

// Simple unit test to ensure tile wall has correct number of tiles

describe('generateTileWall', () => {
  it('creates 136 tiles with unique ids', () => {
    const wall = generateTileWall();
    expect(wall).toHaveLength(136);
    const ids = new Set(wall.map(t => t.id));
    expect(ids.size).toBe(wall.length);
  });
});
