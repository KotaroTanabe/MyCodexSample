import React from 'react';
import { Meld } from '../types/mahjong';
import { MeldView } from './MeldView';

export const RESERVED_MELD_SLOTS = 4;

interface MeldAreaProps {
  melds: Meld[];
  seat: number;
  showBorder?: boolean;
  dataTestId?: string;
}

export const MeldArea: React.FC<MeldAreaProps> = ({ melds, seat, showBorder = true, dataTestId }) => {
  const placeholders = Math.max(0, RESERVED_MELD_SLOTS - melds.length);
  return (
    <div
      className={`flex gap-1 mb-1 ${showBorder ? 'border rounded' : ''}`}
      style={{ minHeight: `calc(var(--tile-font-size) + 4px)` }}
      data-testid={dataTestId}
    >
      {melds.map((m, idx) => (
        <MeldView key={idx} meld={m} seat={seat} />
      ))}
      {Array.from({ length: placeholders }).map((_, idx) => (
        <span
          key={`ph-${idx}`}
          className="inline-block border rounded bg-surface-0 dark:bg-surface-700 px-2 py-1 tile-font-size opacity-0 font-emoji"
        >
          🀇🀇
        </span>
      ))}
    </div>
  );
};
