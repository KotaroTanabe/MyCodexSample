import React, { useState } from 'react';
import { calculateFu } from '../score/score';
import { calculateFuDetail } from '../score/calculateFuDetail';
import { TileView } from './TileView';
import { sortHand } from './Player';
import { useAgariQuiz } from '../quiz/useAgariQuiz';
import { QuizHelpModal } from './QuizHelpModal';

interface FuQuizProps {
  initialIndex?: number;
  initialWinType?: 'ron' | 'tsumo';
}

export const FuQuiz: React.FC<FuQuizProps> = ({ initialIndex, initialWinType }) => {
  const { question, winType, nextQuestion } = useAgariQuiz({
    initialIndex,
    initialWinType,
  });
  const seatWind = 1;
  const roundWind = 1;
  const windNames: Record<number, string> = { 1: '東', 2: '南', 3: '西', 4: '北' };
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<{ fu: number; steps: string[]; correct: boolean } | null>(
    null,
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const fullHand = sortHand([...question.hand, ...question.melds.flatMap(m => m.tiles)]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fu = calculateFu(question.hand, question.melds, { seatWind, roundWind });
    const detail = calculateFuDetail(question.hand, question.melds, seatWind, roundWind);
    const correct = Number(guess) === fu;
    setResult({ fu, steps: detail.steps, correct });
  };

  const handleNext = () => {
    nextQuestion();
    setGuess('');
    setResult(null);
  };

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-center text-sm mb-1">
        <div>
          場風: {windNames[roundWind]} / 自風: {windNames[seatWind]} /
          {winType === 'tsumo' ? ' ツモ' : ' ロン'}
        </div>
        <button
          onClick={() => setHelpOpen(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow text-xs font-bold hover:bg-gray-100"
          aria-label="ヘルプ"
        >
          ?
        </button>
      </div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {fullHand.map(t => (
          <TileView key={t.id} tile={t} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 items-center mb-2">
        <input
          className="border px-2 py-1 w-20"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="符を入力"
        />
        <button type="submit" className="px-2 py-1 bg-blue-200 rounded">答える</button>
      </form>
      {result && (
        <div className="mt-2">
          <div>{result.correct ? '正解！' : `不正解。正解: ${result.fu}符`}</div>
          <ul className="list-disc list-inside text-sm">
            {result.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleNext} className="mt-2 px-2 py-1 bg-green-200 rounded">
        次の問題
      </button>
      <QuizHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};
