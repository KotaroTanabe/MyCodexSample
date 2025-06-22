import React from 'react';
import { Tile, Suit } from '../types/mahjong';

export const TileView: React.FC<{
  tile: Tile;
  isShonpai?: boolean;
  className?: string;
  rotate?: number;
  extraTransform?: string;
}> = ({ tile, isShonpai, className, rotate = 0, extraTransform = '' }) => {
  const suitMap: Record<string, string> = { man: '萬', pin: '筒', sou: '索', wind: '', dragon: '' };
  const honorMap: Record<string, Record<number, string>> = {
    wind: { 1: '東', 2: '南', 3: '西', 4: '北' },
    dragon: { 1: '白', 2: '發', 3: '中' },
  };
  const emojiMap: Record<Suit, Record<number, string>> = {
    man: {
      1: '🀇',
      2: '🀈',
      3: '🀉',
      4: '🀊',
      5: '🀋',
      6: '🀌',
      7: '🀍',
      8: '🀎',
      9: '🀏',
    },
    pin: {
      1: '🀙',
      2: '🀚',
      3: '🀛',
      4: '🀜',
      5: '🀝',
      6: '🀞',
      7: '🀟',
      8: '🀠',
      9: '🀡',
    },
    sou: {
      1: '🀐',
      2: '🀑',
      3: '🀒',
      4: '🀓',
      5: '🀔',
      6: '🀕',
      7: '🀖',
      8: '🀗',
      9: '🀘',
    },
    wind: {
      1: '🀀',
      2: '🀁',
      3: '🀂',
      4: '🀃',
    },
    dragon: {
      1: '🀆',
      2: '🀅',
      3: '🀄',
    },
  };
  const kanji =
    tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou'
      ? `${tile.rank}${suitMap[tile.suit]}`
      : honorMap[tile.suit]?.[tile.rank] ?? '';
  return (
    <span
      className={`relative inline-block border px-1 py-0.5 bg-white tile-font-size ${className ?? ''}`}
      aria-label={kanji}
      style={{ transform: `rotate(${rotate}deg) ${extraTransform}` }}
    >
      <span className="font-emoji">{emojiMap[tile.suit]?.[tile.rank] ?? kanji}</span>
      {isShonpai && (
        <span className="absolute -top-1 -right-1 text-xs text-yellow-500">
          ★
        </span>
      )}
    </span>
  );
};
