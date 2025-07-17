import { Tile } from '../types/mahjong';

const suitMap: Record<string, string> = { man: '萬', pin: '筒', sou: '索', wind: '', dragon: '' };
const honorMap: Record<string, Record<number, string>> = {
  wind: { 1: '東', 2: '南', 3: '西', 4: '北' },
  dragon: { 1: '白', 2: '發', 3: '中' },
};

export function tileToKanji(tile: Tile): string {
  if (tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou') {
    return `${tile.rank}${suitMap[tile.suit]}`;
  }
  return honorMap[tile.suit]?.[tile.rank] ?? '';
}

let idCounter = 0;

/** Parse compact tile notation like `123m456p` into Tile objects. */
export function tilesFromString(notation: string): Tile[] {
  const tiles: Tile[] = [];
  const regex = /(\d+)([mpsz])/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(notation)) !== null) {
    const digits = match[1];
    const suitCode = match[2];
    const suit = suitCode === 'm' ? 'man' : suitCode === 'p' ? 'pin' : suitCode === 's' ? 'sou' : 'wind';
    for (const d of digits) {
      tiles.push({ suit, rank: parseInt(d, 10), id: `t${idCounter++}` });
    }
  }
  return tiles;
}

