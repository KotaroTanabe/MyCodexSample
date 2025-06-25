// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreQuiz } from '../components/ScoreQuiz';
import { randomModule, setRandomSource } from '../utils/random';

const restore = randomModule.random;

describe('ScoreQuiz random control', () => {
  afterEach(() => {
    setRandomSource(restore);
  });

  it('uses stubbed random for initial question', () => {
    setRandomSource(
      vi
        .fn()
        .mockReturnValueOnce(0.1) // winType -> ron
        .mockReturnValueOnce(0.6) // seatWind -> 西
    );
    render(<ScoreQuiz initialIndex={0} />);
    expect(screen.getByText(/自風: 西/)).toBeTruthy();
    expect(screen.getByText(/ロン:/)).toBeTruthy();
  });

  it('uses stubbed random for nextQuestion', () => {
    setRandomSource(
      vi
        .fn()
        .mockReturnValueOnce(0.9) // winType -> tsumo
        .mockReturnValueOnce(0.2) // seatWind -> 東
        .mockReturnValueOnce(0.3) // next winType -> ron
        .mockReturnValueOnce(0.7) // next seatWind -> 西
    );
    render(<ScoreQuiz initialIndex={0} />);
    expect(screen.getByText(/自風: 東/)).toBeTruthy();
    expect(screen.getByText(/ツモ/)).toBeTruthy();
    fireEvent.click(screen.getAllByText('次の問題')[0]);
    expect(screen.getByText(/自風: 西/)).toBeTruthy();
    expect(screen.getByText(/ロン:/)).toBeTruthy();
  });
});
