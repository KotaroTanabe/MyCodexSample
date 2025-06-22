// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
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
});
