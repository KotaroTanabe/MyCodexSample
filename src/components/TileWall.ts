import { Tile, Suit } from '../types/mahjong';
import { random } from '../utils/random';

const suits: Suit[] = ['man', 'pin', 'sou'];
const honors: { suit: Suit; rank: number }[] = [
  { suit: 'wind', rank: 1 }, // 東
  { suit: 'wind', rank: 2 }, // 南
  { suit: 'wind', rank: 3 }, // 西
  { suit: 'wind', rank: 4 }, // 北
  { suit: 'dragon', rank: 1 }, // 白
  { suit: 'dragon', rank: 2 }, // 発
  { suit: 'dragon', rank: 3 }, // 中
];

// 牌山生成
export function generateTileWall(redCount = 0): Tile[] {
  let tiles: Tile[] = [];
  let id = 1;
  // 数牌
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank++) {
      for (let i = 0; i < 4; i++) {
        const red = rank === 5 && i < redCount ? true : undefined;
        tiles.push({
          suit,
          rank,
          id: `${suit}-${rank}-${i}-${id++}`,
          ...(red ? { red } : {}),
        });
      }
    }
  }
  // 字牌
  for (const honor of honors) {
    for (let i = 0; i < 4; i++) {
      tiles.push({
        suit: honor.suit,
        rank: honor.rank,
        id: `${honor.suit}-${honor.rank}-${i}-${id++}`,
      });
    }
  }
  return shuffle(tiles);
}

// ドラ表示牌を取り出す
export function drawDoraIndicator(
  wall: Tile[],
  count = 1,
): { dora: Tile[]; wall: Tile[] } {
  const indicators = wall.slice(0, count);
  return { dora: indicators, wall: wall.slice(count) };
}

// シャッフル
function shuffle<T>(array: T[]): T[] {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
