import React from 'react';
import { PlayerState, Tile, Meld } from '../types/mahjong';
import { TileView } from './TileView';
import { MeldView } from './MeldView';

export interface WinResult {
  players: PlayerState[];
  winner: number;
  winType: 'ron' | 'tsumo';
  /** tiles in the winning hand, excluding called melds */
  hand: Tile[];
  /** melds claimed before the win */
  melds: Meld[];
  /** tile used to complete the hand */
  winTile: Tile;
  yaku: string[];
  han: number;
  fu: number;
  points: number;
  /** ura-dora indicators revealed after a riichi win */
  uraDora?: Tile[];
}

interface Props extends WinResult {
  onNext: () => void;
  nextLabel?: string;
}

export const WinResultModal: React.FC<Props> = ({
  players,
  winner,
  winType,
  hand,
  melds,
  winTile,
  yaku,
  han,
  fu,
  points,
  uraDora,
  onNext,
  nextLabel = '次局へ',
}) => {
  if (players.length === 0) return null;
  const title = winType === 'ron' ? 'ロン和了' : 'ツモ和了';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <div className="mb-2 text-sm">
          {yaku.join('、')} {han}翻 {fu}符 {points}点
        </div>
        {uraDora && uraDora.length > 0 && (
          <div className="mb-2 text-sm flex items-center gap-1">
            <span>裏ドラ:</span>
            {uraDora.map(t => (
              <TileView key={t.id} tile={t} />
            ))}
          </div>
        )}
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {melds.map((m, i) => (
            <MeldView key={i} meld={m} seat={winner} />
          ))}
          {hand.map(t => (
            <TileView
              key={t.id}
              tile={t}
              className={t.id === winTile.id ? 'border-2 border-red-500' : ''}
            />
          ))}
        </div>
        <table className="border-collapse text-sm mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">プレイヤー</th>
              <th className="border px-2 py-1">点数</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, idx) => (
              <tr key={p.name} className={idx === winner ? 'font-bold' : ''}>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1 text-right">{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
};
