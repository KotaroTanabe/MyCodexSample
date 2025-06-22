import React, { useState } from 'react';
import { TileView } from './TileView';
import { useShantenQuiz } from '../quiz/useShantenQuiz';
import { calcShanten } from '../utils/shanten';
import { QuizHelpModal } from './QuizHelpModal';

interface ShantenQuizProps {
  initialHand?: import('../types/mahjong').Tile[];
}

export const ShantenQuiz: React.FC<ShantenQuizProps> = ({ initialHand }) => {
  const { question, nextQuestion } = useShantenQuiz({ initialHand });
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<{ shanten: number; correct: boolean } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = calcShanten(question.hand);
    const shanten = Math.min(s.standard, s.chiitoi, s.kokushi);
    const correct = Number(guess) === shanten;
    setResult({ shanten, correct });
  };

  const handleNext = () => {
    nextQuestion();
    setGuess('');
    setResult(null);
  };

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-end mb-1 text-sm">
        <button
          onClick={() => setHelpOpen(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow text-xs font-bold hover:bg-gray-100"
          aria-label="ヘルプ"
        >
          ?
        </button>
      </div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {question.hand.map(t => (
          <TileView key={t.id} tile={t} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 items-center mb-2">
        <input
          className="border px-2 py-1 w-20"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="向聴数を入力"
        />
        <button type="submit" className="px-2 py-1 bg-blue-200 rounded">答える</button>
      </form>
      {result && (
        <div className="mt-2">
          {result.correct ? '正解！' : `不正解。正解: ${result.shanten}`}
        </div>
      )}
      <button onClick={handleNext} className="mt-2 px-2 py-1 bg-green-200 rounded">
        次の問題
      </button>
      <QuizHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};
