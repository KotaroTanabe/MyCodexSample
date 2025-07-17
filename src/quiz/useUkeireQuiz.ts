import { useState } from 'react';
import { Tile } from '../types/mahjong';
import { generateRandomHand } from './randomHand';

interface Options {
  initialHand?: Tile[];
}

export interface UkeireQuestion {
  hand: Tile[];
}

export function useUkeireQuiz(options: Options = {}) {
  const { initialHand } = options;
  const [question, setQuestion] = useState<UkeireQuestion>(() => ({
    hand: initialHand ?? generateRandomHand(13),
  }));

  const nextQuestion = () => {
    setQuestion({ hand: generateRandomHand(13) });
  };

  return { question, nextQuestion };
}
