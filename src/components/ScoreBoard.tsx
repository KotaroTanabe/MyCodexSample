import React from 'react';
import { RiichiStick } from './RiichiStick';
interface ScoreBoardProps {
  kyoku: number;
  wallCount: number;
  kyotaku: number;
  honba: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  kyoku,
  wallCount,
  kyotaku,
  honba,
}) => {
  const kyokuStr = ['東1局', '東2局', '東3局', '東4局', '南1局', '南2局', '南3局', '南4局'][kyoku - 1] || '';
  return (
    <div
      className="flex items-baseline gap-2 p-2 bg-gray-200 rounded-lg shadow"
      data-testid="score-board"
    >
      <span className="font-bold">{kyokuStr}</span>
      <span className="text-sm">残り{wallCount}</span>
      <span className="text-sm">{honba}本場</span>
      <span className="text-sm flex items-center">
        供託
        <span data-testid="kyotaku" className="flex gap-0.5 ml-1">
          {Array.from({ length: kyotaku }).map((_, i) => (
            <RiichiStick key={i} />
          ))}
        </span>
      </span>
    </div>
  );
};
