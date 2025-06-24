// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App mode selector', () => {
  it('switches between game and fu quiz', () => {
    render(<App />);
    // default is game mode
    expect(screen.getByLabelText('観戦モード')).toBeTruthy();
    const select = screen.getByLabelText('モード');
    fireEvent.change(select, { target: { value: 'fu-quiz' } });
    expect(screen.getByPlaceholderText('符を入力')).toBeTruthy();
  });
});

describe('Dark mode toggle', () => {
  it('adds and removes dark class on body', () => {
    render(<App />);
    const [toggle] = screen.getAllByLabelText('Dark mode');
    expect(document.body.classList.contains('dark')).toBe(false);
    fireEvent.click(toggle);
    expect(document.body.classList.contains('dark')).toBe(true);
    fireEvent.click(toggle);
    expect(document.body.classList.contains('dark')).toBe(false);
  });
});
