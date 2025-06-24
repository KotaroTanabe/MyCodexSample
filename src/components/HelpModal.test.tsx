// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HelpModal } from './HelpModal';

describe('HelpModal', () => {
  afterEach(() => cleanup());

  it('opens and closes via prop and button', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <HelpModal isOpen={false} onClose={handleClose} />,
    );
    expect(screen.queryByRole('heading', { name: '役一覧' })).toBeNull();
    rerender(<HelpModal isOpen onClose={handleClose} />);
    expect(screen.getByRole('heading', { name: '役一覧' })).toBeTruthy();
    fireEvent.click(screen.getByLabelText('close'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('switches between tabs and shows ScoreTable', () => {
    render(<HelpModal isOpen onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: '役一覧' })).toBeTruthy();
    fireEvent.click(screen.getByText('点数表'));
    expect(screen.getByRole('heading', { name: '点数表' })).toBeTruthy();
    expect(screen.getByText('符\\翻')).toBeTruthy();
    fireEvent.click(screen.getByText('役一覧'));
    expect(screen.getByRole('heading', { name: '役一覧' })).toBeTruthy();
    expect(screen.queryByText('符\\翻')).toBeNull();
  });

  it('displays rule status list with README link', () => {
    render(<HelpModal isOpen onClose={() => {}} />);
    fireEvent.click(screen.getByText('ルール対応状況'));
    expect(screen.getByRole('heading', { name: 'ルール対応状況' })).toBeTruthy();
    expect(screen.getByText('リーチ')).toBeTruthy();
    expect(screen.getByText('ドラ')).toBeTruthy();
    const link = screen.getByRole('link', { name: 'README' });
    expect(link.getAttribute('href')).toContain('#rules-supported');
  });

  it('renders modal window with white background', () => {
    const { container } = render(<HelpModal isOpen onClose={() => {}} />);
    const modal = container.querySelector('div.bg-white');
    expect(modal).not.toBeNull();
  });
});
