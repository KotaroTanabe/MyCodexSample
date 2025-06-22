import { useState } from 'react';
import { SAMPLE_HANDS } from './sampleHands';
import { generateRandomAgari, AgariHand } from './randomAgari';

interface Options {
  initialIndex?: number;
  initialWinType?: 'ron' | 'tsumo';
  initialSeatWind?: number;
}

export interface AgariQuestion extends AgariHand {}

export function useAgariQuiz(options: Options = {}) {
  const { initialIndex, initialWinType, initialSeatWind } = options;
  const [idx, setIdx] = useState(initialIndex ?? 0);
  const [question, setQuestion] = useState<AgariQuestion>(() =>
    initialIndex !== undefined ? SAMPLE_HANDS[initialIndex] : generateRandomAgari(),
  );
  const [winType, setWinType] = useState<'ron' | 'tsumo'>(
    initialWinType ?? (Math.random() < 0.5 ? 'ron' : 'tsumo'),
  );
  const randomSeat = () => Math.ceil(Math.random() * 4);
  const [seatWind, setSeatWind] = useState<number>(
    initialSeatWind ?? randomSeat(),
  );

  const nextQuestion = () => {
    if (initialIndex !== undefined) {
      const next = (idx + 1) % SAMPLE_HANDS.length;
      setIdx(next);
      setQuestion(SAMPLE_HANDS[next]);
    } else {
      setQuestion(generateRandomAgari());
    }
    setWinType(Math.random() < 0.5 ? 'ron' : 'tsumo');
    setSeatWind(randomSeat());
  };

  return { idx, question, winType, seatWind, nextQuestion };
}
