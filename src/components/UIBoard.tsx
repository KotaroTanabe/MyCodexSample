import React from 'react';
import { PlayerState, Tile } from '../types/mahjong';

interface UIBoardProps {
  players: PlayerState[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onDiscard: (tileId: string) => void;
  isMyTurn: boolean;
}

// 簡易UI：自分の手牌＋捨て牌、AIの捨て牌のみ表示
export const UIBoard: React.FC<UIBoardProps> = ({ players, onDiscard, isMyTurn }) => {
  if (players.length === 0) {
    return null;
  }
  return (
    <div className="w-full grid grid-cols-4 gap-2">
      {/* 上部：AIの捨て牌 */}
      {players.slice(1).map(ai => (
        <div key={ai.name} className="flex flex-col items-center">
          <div className="text-sm mb-1">{ai.name}</div>
          <div className="flex gap-1">
            {ai.discard.map(tile => (
              <TileView key={tile.id} tile={tile} />
            ))}
          </div>
        </div>
      ))}
      {/* 自分の手牌 */}
      <div className="col-span-4 flex flex-col items-center mt-4">
        <div className="text-lg mb-1">あなたの手牌</div>
        <div className="grid grid-cols-12 gap-2">
          {players[0].hand.map(tile => (
            <button
              key={tile.id}
              className={`border rounded bg-white px-2 py-1 hover:bg-blue-100 ${isMyTurn ? '' : 'opacity-50 pointer-events-none'}`}
              onClick={() => onDiscard(tile.id)}
              disabled={!isMyTurn}
            >
              <TileView tile={tile} />
            </button>
          ))}
        </div>
        <div className="flex gap-1 mt-2">
          {players[0].discard.map(tile => (
            <TileView key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
};

// 牌表示（簡易）
export const TileView: React.FC<{ tile: Tile }> = ({ tile }) => {
  const suitMap: Record<string, string> = { man: '萬', pin: '筒', sou: '索', wind: '', dragon: '' };
  const honorMap: Record<string, Record<number, string>> = {
    wind: { 1: '東', 2: '南', 3: '西', 4: '北' },
    dragon: { 1: '白', 2: '發', 3: '中' },
  };
  return (
    <span className="inline-block border px-1 py-0.5 text-base bg-white">
      {tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou'
        ? `${tile.rank}${suitMap[tile.suit]}`
        : honorMap[tile.suit]?.[tile.rank] ?? ''}
    </span>
  );
};