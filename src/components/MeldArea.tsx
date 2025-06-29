import React from 'react';
import { Meld } from '../types/mahjong';
import { MeldView } from './MeldView';
import { rotationForSeat } from '../utils/rotation';

export const RESERVED_MELD_SLOTS = 4;

interface MeldAreaProps {
  melds: Meld[];
  seat: number;
  showBorder?: boolean;
  dataTestId?: string;
}

export const MeldArea: React.FC<MeldAreaProps> = ({ melds, seat, showBorder = true, dataTestId }) => {
  if (melds.length === 0 && !showBorder) {
    return null;
  }
  const placeholders = Math.max(0, RESERVED_MELD_SLOTS - melds.length);
  const containerMinHeight = `calc((var(--tile-font-size) + 4px) * ${RESERVED_MELD_SLOTS})`;
  return (
    <div
      className={`relative flex flex-col gap-1 mb-1 ${showBorder ? 'border rounded' : ''}`}
      style={{
        minHeight: containerMinHeight,
        transform: `rotate(${rotationForSeat(seat)}deg)`,
      }}
      data-testid={dataTestId}
    >
      {showBorder && (
        <span
          className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs opacity-25 pointer-events-none select-none"
          aria-hidden="true"
        >
          鳴き牌
        </span>
      )}
      {melds.map((m, idx) => (
        <MeldView key={idx} meld={m} seat={seat} />
      ))}
      {showBorder &&
        Array.from({ length: placeholders }).map((_, idx) => (
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
