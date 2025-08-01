// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ScoreQuiz } from './ScoreQuiz';

// SAMPLE_HANDS[0] を親でロン和了すると 3翻30符で
// 基本点960 ×6 = 5760 -> 5800点になる

afterEach(() => cleanup());

describe('ScoreQuiz', () => {
  it('shows "正解！" when the guess is correct', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="ron" initialSeatWind={1} />);
    const input = screen.getByPlaceholderText('点数を入力');
    fireEvent.change(input, { target: { value: '5800' } });
    const button = screen.getByText('答える');
    fireEvent.click(button);
    expect(screen.getByText('正解！')).toBeTruthy();
    expect(screen.getByText('Tanyao (1翻)')).toBeTruthy();
    expect(screen.getByText('基本符20')).toBeTruthy();
  });

  it('shows the correct answer with details when wrong', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="ron" initialSeatWind={1} />);
    const input = screen.getByPlaceholderText('点数を入力');
    fireEvent.change(input, { target: { value: '1000' } });
    const button = screen.getByText('答える');
    fireEvent.click(button);
    expect(screen.getByText('不正解。正解: 5800 (3翻 30符)')).toBeTruthy();
    expect(screen.getByText('Tanyao (1翻)')).toBeTruthy();
    expect(screen.getByText('基本符20')).toBeTruthy();
  });

  it('displays seat and round wind and win type', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="ron" initialSeatWind={1} />);
    expect(screen.getByText('場風: 東 / 自風: 東 (親) / ロン: 5筒')).toBeTruthy();
  });

  it('handles tsumo answers with split payments', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="tsumo" initialSeatWind={2} />);
    const childInput = screen.getByPlaceholderText('子の支払い');
    const parentInput = screen.getByPlaceholderText('親の支払い');
    fireEvent.change(childInput, { target: { value: '2000' } });
    fireEvent.change(parentInput, { target: { value: '3900' } });
    fireEvent.click(screen.getByText('答える'));
    expect(screen.getByText('正解！')).toBeTruthy();
  });

  it('shows two inputs for child tsumo', () => {
    render(<ScoreQuiz initialIndex={0} initialWinType="tsumo" initialSeatWind={2} />);
    expect(screen.getByPlaceholderText('子の支払い')).toBeTruthy();
    expect(screen.getByPlaceholderText('親の支払い')).toBeTruthy();
  });

});
