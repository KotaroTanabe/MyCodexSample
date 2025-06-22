// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App mode switching', () => {
  it('renders FuQuiz when mode is changed', async () => {
    render(<App />);
    // Wait for GameController (scoreboard) to appear
    expect(await screen.findByText('東1局')).toBeTruthy();
    const select = screen.getByLabelText('モード');
    fireEvent.change(select, { target: { value: 'fu-quiz' } });
    expect(
      await screen.findByRole('heading', { name: '符計算クイズ' })
    ).toBeTruthy();
  });
});
