// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ScoreQuiz } from './ScoreQuiz';

// SAMPLE_HANDS[0] をロン和了すると 4翻30符で 1920 点になる

afterEach(() => cleanup());

describe('ScoreQuiz', () => {
  it('shows "正解！" when the guess is correct', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="ron" />);
    const input = screen.getByPlaceholderText('点数を入力');
    fireEvent.change(input, { target: { value: '1920' } });
    const button = screen.getByText('答える');
    fireEvent.click(button);
    expect(screen.getByText('正解！')).toBeTruthy();
    expect(screen.getByText('Tanyao (1翻)')).toBeTruthy();
    expect(screen.getByText('基本符20')).toBeTruthy();
  });

  it('shows the correct answer with details when wrong', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="ron" />);
    const input = screen.getByPlaceholderText('点数を入力');
    fireEvent.change(input, { target: { value: '1000' } });
    const button = screen.getByText('答える');
    fireEvent.click(button);
    expect(screen.getByText('不正解。正解: 1920点 (4翻 30符)')).toBeTruthy();
    expect(screen.getByText('Tanyao (1翻)')).toBeTruthy();
    expect(screen.getByText('基本符20')).toBeTruthy();
  });

  it('displays seat and round wind and win type', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="ron" />);
    expect(screen.getByText('場風: 東 / 自風: 東 / ロン')).toBeTruthy();
  });

  it('opens help modal with score info', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="ron" />);
    fireEvent.click(screen.getByLabelText('ヘルプ'));
    expect(screen.getByText('基本点 = 符 × 2^(翻 + 2)')).toBeTruthy();
  });
});
