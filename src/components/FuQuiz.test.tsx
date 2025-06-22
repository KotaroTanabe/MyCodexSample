// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FuQuiz } from './FuQuiz';

describe('FuQuiz', () => {
  it('shows the correct fu after submitting', () => {
    render(<FuQuiz initialIndex={0} />);
    const input = screen.getByPlaceholderText('符を入力');
    fireEvent.change(input, { target: { value: '20' } });
    const button = screen.getByText('答える');
    fireEvent.click(button);
    expect(screen.getByText('正解: 20符')).toBeTruthy();
  });
});
