import React from 'react';
import { Tile } from '../types/mahjong';
import { TileView } from './TileView';

const seatRotation = (seat: number): number => {
  switch (seat % 4) {
    case 1:
      return 270;
    case 3:
      return 90;
    case 2:
      return 180;
    default:
      return 0;
  }
};

const seatRiverRotation = (seat: number): number => {
  switch (seat % 4) {
    case 1:
      return 90;
    case 2:
      return 180;
    case 3:
      return 270;
    default:
      return 0;
  }
};

const shouldReverseRiver = (seat: number): boolean => {
  const rot = seatRiverRotation(seat) % 360;
  return rot === 90 || rot === 180;
};

interface RiverViewProps {
  tiles: Tile[];
  seat: number;
  lastDiscard: { tile: Tile; player: number; isShonpai: boolean } | null;
  dataTestId?: string;
}

export const RiverView: React.FC<RiverViewProps> = ({
  tiles,
  seat,
  lastDiscard,
  dataTestId,
}) => {
  const ordered = shouldReverseRiver(seat) ? [...tiles].reverse() : tiles;
  return (
    <div
      className="grid grid-cols-6 gap-1"
      style={{ transform: `rotate(${seatRiverRotation(seat)}deg)` }}
      data-testid={dataTestId}
    >
      {ordered.map(tile => (
        <TileView
          key={tile.id}
          tile={tile}
          rotate={seatRotation(seat) - seatRiverRotation(seat)}
          isShonpai={lastDiscard?.tile.id === tile.id && lastDiscard.isShonpai}
        />
      ))}
    </div>
  );
};
