// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FuQuiz } from './FuQuiz';

// 固定のサンプルハンドで符計算クイズをテストする
// SAMPLE_HANDS[0] は calculateFu(...) が 20 になる

afterEach(() => cleanup());
describe('FuQuiz', () => {
  it('shows "正解！" when the guess is correct', () => {
    render(<FuQuiz initialIndex={0} initialWinType="ron" />);
    const input = screen.getByPlaceholderText('符を入力');
    fireEvent.change(input, { target: { value: '20' } });
    const button = screen.getByText('答える');
    fireEvent.click(button);
    expect(screen.getByText('正解！')).toBeTruthy();
  });

  it('shows the correct answer when the guess is wrong', () => {
    render(<FuQuiz initialIndex={0} initialWinType="ron" />);
    const input = screen.getByPlaceholderText('符を入力');
    fireEvent.change(input, { target: { value: '30' } });
    const button = screen.getByText('答える');
    fireEvent.click(button);
    expect(screen.getByText('不正解。正解: 20符')).toBeTruthy();
  });

  it('displays seat and round wind and win type', () => {
    render(<FuQuiz initialIndex={0} initialWinType="ron" />);
    expect(screen.getByText('場風: 東 / 自風: 東 / ロン')).toBeTruthy();
  });

  it('opens help modal', () => {
    render(<FuQuiz initialIndex={0} initialWinType="ron" />);
    fireEvent.click(screen.getByLabelText('ヘルプ'));
    expect(screen.getByText('基本符20')).toBeTruthy();
  });
});
