import React from 'react';
import { PlayerState } from '../types/mahjong';

interface Props {
  players: PlayerState[];
  onReplay: () => void;
}

export const FinalResultModal: React.FC<Props> = ({ players, onReplay }) => {
  if (players.length === 0) return null;
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-2">最終結果</h2>
        <table className="border-collapse text-sm mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">プレイヤー</th>
              <th className="border px-2 py-1">点数</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.name}>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1 text-right">{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded" onClick={onReplay}>リプレイ</button>
      </div>
    </div>
  );
};
