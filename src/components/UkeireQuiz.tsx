import React, { useState } from 'react';
import { TileView } from './TileView';
import { useUkeireQuiz } from '../quiz/useUkeireQuiz';
import { countUkeireTiles } from '../utils/ukeire';
import { tileToKanji } from '../utils/tileString';

interface Props {
  initialHand?: import('../types/mahjong').Tile[];
}

export const UkeireQuiz: React.FC<Props> = ({ initialHand }) => {
  const { question, nextQuestion } = useUkeireQuiz({ initialHand });
  const [typeGuess, setTypeGuess] = useState('');
  const [countGuess, setCountGuess] = useState('');
  const [result, setResult] = useState<
    | { types: number; total: number; detail: string; correct: boolean }
    | null
  >(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { counts, types, total } = countUkeireTiles(question.hand);
    const detail = Object.entries(counts)
      .map(([k, c]) => `${tileToKanji({
        suit: k.split('-')[0] as any,
        rank: parseInt(k.split('-')[1], 10),
        id: 'x',
      })}(${c})`)
      .join(' ');
    const correct = Number(typeGuess) === types && Number(countGuess) === total;
    setResult({ types, total, detail, correct });
  };

  const handleNext = () => {
    nextQuestion();
    setTypeGuess('');
    setCountGuess('');
    setResult(null);
  };

  return (
    <div className="p-4 border rounded">
      <div className="flex gap-1 mb-2 flex-wrap">
        {question.hand.map(t => (
          <TileView key={t.id} tile={t} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 items-center mb-2">
        <input
          className="border px-2 py-1 w-20"
          value={typeGuess}
          onChange={e => setTypeGuess(e.target.value)}
          placeholder="牌種"
        />
        <input
          className="border px-2 py-1 w-20"
          value={countGuess}
          onChange={e => setCountGuess(e.target.value)}
          placeholder="枚数"
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
              : `不正解。正解: ${result.types}種 ${result.total}枚`}
          </div>
          <div className="text-sm mt-1">{result.detail}</div>
        </div>
      )}
      <button onClick={handleNext} className="mt-2 px-2 py-1 bg-green-200 rounded">
        次の問題
      </button>
    </div>
  );
};
