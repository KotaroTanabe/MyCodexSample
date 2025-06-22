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

