import { Tile, Meld, Suit } from '../types/mahjong';
import { generateTileWall } from '../components/TileWall';
import { sortHand } from '../components/Player';

export interface AgariHand {
  hand: Tile[];
  melds: Meld[];
  winningTile: Tile;
}

function drawTiles(wall: Tile[], suit: Suit, rank: number, count: number): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i < wall.length && tiles.length < count; i++) {
    if (wall[i].suit === suit && wall[i].rank === rank) {
      tiles.push(...wall.splice(i, 1));
      i--;
    }
  }
  if (tiles.length < count) {
    throw new Error('Not enough tiles to draw');
  }
  return tiles;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomAgari(): AgariHand {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const wall = generateTileWall();
      const hand: Tile[] = [];
      const suits: Suit[] = ['man', 'pin', 'sou'];
      const allSuits: Suit[] = ['man', 'pin', 'sou', 'wind', 'dragon'];

      for (let i = 0; i < 4; i++) {
        if (Math.random() < 0.5) {
          const suit = randomFrom(suits);
          const base = 1 + Math.floor(Math.random() * 7);
          hand.push(...drawTiles(wall, suit, base, 1));
          hand.push(...drawTiles(wall, suit, base + 1, 1));
          hand.push(...drawTiles(wall, suit, base + 2, 1));
        } else {
          let added = false;
          while (!added) {
            const suit = randomFrom(allSuits);
            const maxRank = suit === 'wind' ? 4 : suit === 'dragon' ? 3 : 9;
            const rank = 1 + Math.floor(Math.random() * maxRank);
            const count = wall.filter(t => t.suit === suit && t.rank === rank).length;
            if (count >= 3) {
              hand.push(...drawTiles(wall, suit, rank, 3));
              added = true;
            }
          }
        }
      }

      let paired = false;
      while (!paired) {
        const suit = randomFrom(allSuits);
        const maxRank = suit === 'wind' ? 4 : suit === 'dragon' ? 3 : 9;
        const rank = 1 + Math.floor(Math.random() * maxRank);
        const count = wall.filter(t => t.suit === suit && t.rank === rank).length;
        if (count >= 2) {
          hand.push(...drawTiles(wall, suit, rank, 2));
          paired = true;
        }
      }

      const sorted = sortHand(hand);
      return { hand: sorted, melds: [], winningTile: sorted[sorted.length - 1] };
    } catch (e) {
      // Retry if a draw failed due to insufficient tiles
    }
  }
}
