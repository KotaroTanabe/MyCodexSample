// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { QuizHelpModal } from './QuizHelpModal';

describe('QuizHelpModal', () => {
  afterEach(() => cleanup());

  it('opens and closes via prop and button', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <QuizHelpModal isOpen={false} onClose={handleClose} />,
    );
    expect(screen.queryByText('クイズヘルプ')).toBeNull();
    rerender(<QuizHelpModal isOpen onClose={handleClose} />);
    expect(screen.getByText('クイズヘルプ')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('close'));
    expect(handleClose).toHaveBeenCalled();
  });
});
