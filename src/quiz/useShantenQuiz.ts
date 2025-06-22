import { useState } from 'react';
import { Tile } from '../types/mahjong';
import { generateRandomHand } from './randomHand';

interface Options {
  initialHand?: Tile[];
}

export interface ShantenQuestion {
  hand: Tile[];
}

export function useShantenQuiz(options: Options = {}) {
  const { initialHand } = options;
  const [question, setQuestion] = useState<ShantenQuestion>(() => ({
    hand: initialHand ?? generateRandomHand(),
  }));

  const nextQuestion = () => {
    setQuestion({ hand: generateRandomHand() });
  };

  return { question, nextQuestion };
}
