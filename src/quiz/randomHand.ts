import { Tile } from '../types/mahjong';
import { generateTileWall } from '../components/TileWall';
import { sortHand } from '../components/Player';

export function generateRandomHand(count = 14): Tile[] {
  const wall = generateTileWall();
  return sortHand(wall.slice(0, count));
}
