import React from 'react';
import { PlayerState } from '../types/mahjong';

export interface WinResult {
  players: PlayerState[];
  winner: number;
  winType: 'ron' | 'tsumo';
  yaku: string[];
  han: number;
  fu: number;
  points: number;
}

interface Props extends WinResult {
  onNext: () => void;
  nextLabel?: string;
}

export const WinResultModal: React.FC<Props> = ({
  players,
  winner,
  winType,
  yaku,
  han,
  fu,
  points,
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
