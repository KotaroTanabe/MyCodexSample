// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameController } from './GameController';

describe('GameController auto play', () => {
  vi.useFakeTimers();
  afterEach(() => {
    vi.useRealTimers();
  });
  it('disables tile buttons when enabled', async () => {
    vi.useRealTimers();
    const { container } = render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    const checkbox = screen.getAllByLabelText('観戦モード')[0];
    fireEvent.click(checkbox);
    const buttons = container.querySelectorAll('button');
    expect(Array.from(buttons).some(b => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it('AI discards when toggled during player turn', async () => {
    vi.useRealTimers();
    render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    vi.useFakeTimers();
    const checkbox = screen.getAllByLabelText('観戦モード')[0];
    fireEvent.click(checkbox);
    vi.advanceTimersByTime(600);
    vi.useRealTimers();
    const star = await screen.findByText('★');
    expect(star).toBeTruthy();
  });

  it('exports log file with actions', async () => {
    vi.useRealTimers();
    const { container } = render(<GameController gameLength="tonnan" />);
    await screen.findAllByText('手牌');
    const first = container.querySelector('button[aria-label]') as HTMLButtonElement;
    fireEvent.click(first);
    const createObjectURL = vi.fn().mockReturnValue('blob:log');
    (globalThis as any).URL.createObjectURL = createObjectURL;
    (globalThis as any).URL.revokeObjectURL = vi.fn();
    class FakeBlob {
      constructor(private parts: any[]) {
        this.parts = parts;
      }
      text() { return Promise.resolve(this.parts.join('')); }
    }
    (globalThis as any).Blob = FakeBlob as any;
    const clickSpy = vi.fn();
    Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
      configurable: true,
      value: clickSpy,
    });
    fireEvent.click(screen.getAllByText('ログダウンロード')[0]);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const text = await blob.text();
    const obj = JSON.parse(text);
    expect(obj.name).toBe('.lq.GameDetailRecords');
    expect(obj.data.some((d: any) => Array.isArray(d.actions))).toBe(true);
  });
});
