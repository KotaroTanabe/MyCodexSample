import React, { useState } from 'react';
import { sortHand } from './Player';
import { TileView } from './TileView';
import { detectYaku } from '../score/yaku';
import { calculateScore, calcBase } from '../score/score';
import { calculateFuDetail } from '../score/calculateFuDetail';
import { useAgariQuiz } from '../quiz/useAgariQuiz';
import { tileToKanji } from '../utils/tileString';

interface ScoreQuizProps {
  initialIndex?: number;
  initialWinType?: 'ron' | 'tsumo';
  initialSeatWind?: number;
}

export const ScoreQuiz: React.FC<ScoreQuizProps> = ({ initialIndex, initialWinType, initialSeatWind }) => {
  const { question, winType, seatWind, nextQuestion } = useAgariQuiz({ initialIndex, initialWinType, initialSeatWind });
  const roundWind = 1;
  const windNames: Record<number, string> = { 1: '東', 2: '南', 3: '西', 4: '北' };
  const [guess, setGuess] = useState('');
  const [childGuess, setChildGuess] = useState('');
  const [parentGuess, setParentGuess] = useState('');
  const [result, setResult] = useState<
    | {
        answer: string;
        han: number;
        fu: number;
        yaku: string[];
        fuSteps: string[];
        explanation: string;
        correct: boolean;
      }
    | null
  >(null);

  const fullHand = sortHand([...question.hand, ...question.melds.flatMap(m => m.tiles)]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const yaku = detectYaku(question.hand, question.melds, {
      isTsumo: winType === 'tsumo',
      seatWind,
      roundWind,
    });
    const { han, fu } = calculateScore(
      question.hand,
      question.melds,
      yaku,
      [],
      {
        seatWind,
        roundWind,
        winType,
      },
    );
    const base = calcBase(han, fu);
    let answer = '';
    let explanation = '';
    if (winType === 'ron') {
      const mult = seatWind === 1 ? 6 : 4;
      const total = Math.ceil((base * mult) / 100) * 100;
      answer = total.toString();
      explanation = `基本点${base}に${seatWind === 1 ? '親' : '子'}のロンなので${mult}倍して、100の位で切り上げて${total}点`;
    } else if (seatWind === 1) {
      const each = Math.ceil((base * 2) / 100) * 100;
      answer = `${each}オール`;
      explanation = `基本点${base}で親のツモなので2倍の${base * 2}を100の位で切り上げて${each}点オール`;
    } else {
      const nonDealer = Math.ceil(base / 100) * 100;
      const dealerPay = Math.ceil((base * 2) / 100) * 100;
      answer = `${nonDealer}-${dealerPay}`;
      explanation = `基本点${base}で子のツモなので他家から${nonDealer}点、親からは2倍の${base * 2}を100の位で切り上げて${dealerPay}点`;
    }
    const detail = calculateFuDetail(
      question.hand,
      question.melds,
      seatWind,
      roundWind,
      winType,
    );
    let guessStr = guess.trim();
    if (winType === 'tsumo' && seatWind !== 1) {
      guessStr = `${childGuess.trim()}-${parentGuess.trim()}`;
    }
    const correct = guessStr === answer;
    setResult({
      answer,
      han,
      fu,
      yaku: yaku.map(y => `${y.name} (${y.han}翻)`),
      fuSteps: detail.steps,
      explanation,
      correct,
    });
  };

  const handleNext = () => {
    nextQuestion();
    setGuess('');
    setChildGuess('');
    setParentGuess('');
    setResult(null);
  };

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-center text-sm mb-1">
        <div>
          場風: {windNames[roundWind]} / 自風: {windNames[seatWind]} ({seatWind === 1 ? '親' : '子'}) /
          {winType === 'tsumo'
            ? ' ツモ'
            : ` ロン: ${tileToKanji(question.winningTile)}`}
        </div>
      </div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {fullHand.map(t => (
          <TileView key={t.id} tile={t} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 items-center mb-2">
        {winType === 'tsumo' && seatWind !== 1 ? (
          <>
            <input
              className="border px-2 py-1 w-20"
              value={childGuess}
              onChange={e => setChildGuess(e.target.value)}
              placeholder="子の支払い"
            />
            <span>-</span>
            <input
              className="border px-2 py-1 w-20"
              value={parentGuess}
              onChange={e => setParentGuess(e.target.value)}
              placeholder="親の支払い"
            />
          </>
        ) : (
          <input
            className="border px-2 py-1 w-24"
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="点数を入力"
          />
        )}
        <button type="submit" className="px-2 py-1 bg-blue-200 rounded">
          答える
        </button>
      </form>
      {result && (
        <div className="mt-2">
          <div>
            {result.correct
              ? '正解！'
              : `不正解。正解: ${result.answer} (${result.han}翻 ${result.fu}符)`}
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
          <div className="text-sm mt-1">{result.explanation}</div>
        </div>
      )}
      <button onClick={handleNext} className="mt-2 px-2 py-1 bg-green-200 rounded">
        次の問題
      </button>
    </div>
  );
};
