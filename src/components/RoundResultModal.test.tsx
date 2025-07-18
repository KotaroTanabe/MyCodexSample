// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoundResultModal } from './RoundResultModal';

const results = [
  { name: 'A', score: 25000, change: 0, isTenpai: true },
];

describe('RoundResultModal', () => {
  it('uses custom next label', () => {
    render(<RoundResultModal results={results} onNext={() => {}} nextLabel="結果発表へ" />);
    expect(screen.getByText('結果発表へ')).toBeTruthy();
  });

  it('calls copy callback', () => {
    const fn = vi.fn();
    render(
      <RoundResultModal results={results} onNext={() => {}} onCopyTenhou={fn} />,
    );
    screen.getByText('Tenhouログ コピー').click();
    expect(fn).toHaveBeenCalled();
    const link = screen.getByRole('link', { name: '牌譜解析（外部サイト）' });
    expect(link.getAttribute('href')).toBe('https://mjai.ekyu.moe/ja.html');
  });
});
