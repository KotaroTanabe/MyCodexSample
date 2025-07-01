import React from 'react';
import { rotationForSeat } from '../utils/rotation';

interface RiichiStickProps {
  seat: number;
  className?: string;
}

export const RiichiStick: React.FC<RiichiStickProps> = ({ seat, className }) => (
  <span
    className={`riichi-stick ${className ?? ''}`}
    style={{ transform: `rotate(${rotationForSeat(seat) + 90}deg)` }}
    aria-label="riichi stick"
  />
);
