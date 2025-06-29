import React from 'react';
import { Tile } from '../types/mahjong';
import { TileView } from './TileView';

export const RESERVED_HAND_SLOTS = 14;

const suitMap: Record<string, string> = { man: '萬', pin: '筒', sou: '索', wind: '', dragon: '' };
const honorMap: Record<string, Record<number, string>> = {
  wind: { 1: '東', 2: '南', 3: '西', 4: '北' },
  dragon: { 1: '白', 2: '發', 3: '中' },
};

interface HandViewProps {
  tiles: Tile[];
  drawnTile?: Tile | null;
  onDiscard: (tileId: string) => void;
  isMyTurn: boolean;
  showBorder?: boolean;
  dataTestId?: string;
}

export const HandView: React.FC<HandViewProps> = ({ tiles, drawnTile, onDiscard, isMyTurn, showBorder = true, dataTestId }) => {
  const handTiles = drawnTile ? tiles.filter(t => t.id !== drawnTile.id) : tiles;
  const placeholders = Math.max(0, RESERVED_HAND_SLOTS - handTiles.length - 1);
  const renderButton = (tile: Tile, extraClass: string) => {
    const kanji =
      tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou'
        ? `${tile.rank}${suitMap[tile.suit]}`
        : honorMap[tile.suit]?.[tile.rank] ?? '';
    return (
      <button
        key={tile.id}
        className={`border rounded bg-surface-0 dark:bg-surface-700 px-2 py-1 hover:bg-primary-100 dark:hover:bg-primary-700 ${extraClass} ${
          isMyTurn ? '' : 'opacity-50 pointer-events-none'
        }`}
        onClick={() => onDiscard(tile.id)}
        disabled={!isMyTurn}
        aria-label={kanji}
      >
        <TileView tile={tile} />
      </button>
    );
  };
  return (
    <div
      className={`flex gap-2 items-center overflow-x-auto ${showBorder ? 'border' : ''}`}
      data-testid={dataTestId}
    >
      <span className="text-xs text-gray-600">手牌</span>
      {handTiles.map(t => renderButton(t, ''))}
      {drawnTile ? (
        renderButton(drawnTile, 'ml-4')
      ) : (
        <span
          key="draw-slot"
          className="inline-block border rounded bg-surface-0 dark:bg-surface-700 px-2 py-1 tile-font-size opacity-0 ml-4 font-emoji"
        >
          🀇
        </span>
      )}
      {Array.from({ length: placeholders }).map((_, idx) => (
        <span
          key={`ph-${idx}`}
          className="inline-block border rounded bg-surface-0 dark:bg-surface-700 px-2 py-1 tile-font-size opacity-0 font-emoji"
        >
          🀇
        </span>
      ))}
    </div>
  );
};
