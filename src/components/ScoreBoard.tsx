import React from 'react';
import { PlayerState } from '../types/mahjong';

interface ScoreBoardProps {
  players: PlayerState[];
  kyoku: number;
  wallCount: number;
  kyotaku: number;
  onHelp: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, kyoku, wallCount, kyotaku, onHelp }) => {
  const kyokuStr = ['東1局', '東2局', '東3局', '東4局', '南1局', '南2局', '南3局', '南4局'][kyoku - 1] || '';
  return (
    <div className="flex justify-between items-center p-2 bg-gray-200 rounded-lg shadow">
      <div className="flex items-baseline gap-2">
        <span className="font-bold">{kyokuStr}</span>
        <span className="text-sm">残り{wallCount}</span>
        <span className="text-sm">供託{kyotaku}</span>
      </div>
      <div className="flex gap-2 items-center">
        {players.map(p => (
          <span key={p.name} className="bg-white rounded px-2 py-1 shadow">
            {p.name}: <span className="font-mono">{p.score}</span>
          </span>
        ))}
        <button
          onClick={onHelp}
          className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white shadow text-sm font-bold hover:bg-gray-100"
          aria-label="ヘルプ"
        >
          ?
        </button>
      </div>
    </div>
  );
};
