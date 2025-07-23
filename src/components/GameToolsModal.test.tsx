// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameToolsModal } from './GameToolsModal';

describe('GameToolsModal', () => {
  it('invokes advanced AI toggle', () => {
    const toggle = vi.fn();
    render(
      <GameToolsModal
        isOpen
        onClose={() => {}}
        onDownloadLog={() => {}}
        onDownloadMjaiLog={() => {}}
        preset="basic"
        setPreset={() => {}}
        boardInput=""
        setBoardInput={() => {}}
        onLoadBoard={() => {}}
        advancedAI={false}
        onToggleAdvancedAI={toggle}
      />,
    );
    fireEvent.click(screen.getByLabelText('高度なAI'));
    expect(toggle).toHaveBeenCalled();
  });
});
