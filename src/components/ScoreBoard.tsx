import React from 'react';
interface ScoreBoardProps {
  kyoku: number;
  wallCount: number;
  kyotaku: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  kyoku,
  wallCount,
  kyotaku,
}) => {
  const kyokuStr = ['東1局', '東2局', '東3局', '東4局', '南1局', '南2局', '南3局', '南4局'][kyoku - 1] || '';
  return (
    <div className="flex items-baseline gap-2 p-2 bg-gray-200 rounded-lg shadow">
      <span className="font-bold">{kyokuStr}</span>
      <span className="text-sm">残り{wallCount}</span>
      <span className="text-sm">供託{kyotaku}</span>
    </div>
  );
};
