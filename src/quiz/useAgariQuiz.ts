import { useState } from 'react';
import { SAMPLE_HANDS } from './sampleHands';
import { generateRandomAgari } from './randomAgari';

interface Options {
  initialIndex?: number;
  initialWinType?: 'ron' | 'tsumo';
}

export function useAgariQuiz(options: Options = {}) {
  const { initialIndex, initialWinType } = options;
  const [idx, setIdx] = useState(initialIndex ?? 0);
  const [question, setQuestion] = useState(() =>
    initialIndex !== undefined ? SAMPLE_HANDS[initialIndex] : generateRandomAgari(),
  );
  const [winType, setWinType] = useState<'ron' | 'tsumo'>(
    initialWinType ?? (Math.random() < 0.5 ? 'ron' : 'tsumo'),
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
  };

  return { idx, question, winType, nextQuestion };
}
