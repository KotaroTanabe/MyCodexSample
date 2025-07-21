// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('red five count setting', () => {
  it('defaults to 1 and reloads when changed', async () => {
    render(<App />);
    await screen.findAllByText('手牌');
    const select = screen.getByLabelText('赤5枚数') as HTMLSelectElement;
    expect(select.value).toBe('1');
    const watch = screen.getByLabelText('観戦モード') as HTMLInputElement;
    fireEvent.click(watch);
    expect(watch.checked).toBe(true);
    fireEvent.change(select, { target: { value: '2' } });
    const newWatch = screen.getByLabelText('観戦モード') as HTMLInputElement;
    expect(newWatch.checked).toBe(false);
  });
});
