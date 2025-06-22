import React, { useState } from 'react';
import { sortHand } from './Player';
import { TileView } from './TileView';
import { detectYaku } from '../score/yaku';
import { calculateScore } from '../score/score';
import { calculateFuDetail } from '../score/calculateFuDetail';
import { useAgariQuiz } from '../quiz/useAgariQuiz';

interface ScoreQuizProps {
  initialIndex?: number;
  initialWinType?: 'ron' | 'tsumo';
}

export const ScoreQuiz: React.FC<ScoreQuizProps> = ({ initialIndex, initialWinType }) => {
  const { question, winType, nextQuestion } = useAgariQuiz({ initialIndex, initialWinType });
  const seatWind = 1;
  const roundWind = 1;
  const windNames: Record<number, string> = { 1: '東', 2: '南', 3: '西', 4: '北' };
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<
    | {
        points: number;
        han: number;
        fu: number;
        yaku: string[];
        fuSteps: string[];
        correct: boolean;
      }
    | null
  >(null);

  const fullHand = sortHand([...question.hand, ...question.melds.flatMap(m => m.tiles)]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTiles = [...question.hand, ...question.melds.flatMap(m => m.tiles)];
    const yaku = detectYaku(allTiles, question.melds, {
      isTsumo: winType === 'tsumo',
      seatWind,
      roundWind,
    });
    const { han, fu, points } = calculateScore(question.hand, question.melds, yaku, [], {
      seatWind,
      roundWind,
    });
    const detail = calculateFuDetail(question.hand, question.melds, seatWind, roundWind);
    const correct = Number(guess) === points;
    setResult({
      points,
      han,
      fu,
      yaku: yaku.map(y => `${y.name} (${y.han}翻)`),
      fuSteps: detail.steps,
      correct,
    });
  };

  const handleNext = () => {
    nextQuestion();
    setGuess('');
    setResult(null);
  };

  return (
    <div className="p-4 border rounded">
      <div className="text-sm mb-1">
        場風: {windNames[roundWind]} / 自風: {windNames[seatWind]} /
        {winType === 'tsumo' ? ' ツモ' : ' ロン'}
      </div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {fullHand.map(t => (
          <TileView key={t.id} tile={t} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 items-center mb-2">
        <input
          className="border px-2 py-1 w-24"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="点数を入力"
        />
        <button type="submit" className="px-2 py-1 bg-blue-200 rounded">
          答える
        </button>
      </form>
      {result && (
        <div className="mt-2">
          <div>
            {result.correct
              ? '正解！'
              : `不正解。正解: ${result.points}点 (${result.han}翻 ${result.fu}符)`}
          </div>
          <ul className="list-disc list-inside text-sm">
            {result.yaku.map((y, i) => (
              <li key={`y${i}`}>{y}</li>
            ))}
          </ul>
          <ul className="list-disc list-inside text-sm">
            {result.fuSteps.map((s, i) => (
              <li key={`f${i}`}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleNext} className="mt-2 px-2 py-1 bg-green-200 rounded">
        次の問題
      </button>
    </div>
  );
};
