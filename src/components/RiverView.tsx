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
      return 270;
    case 2:
      return 180;
    case 3:
      return 90;
    default:
      return 0;
  }
};

const shouldReverseRiver = (seat: number): boolean => {
  const rot = seatRiverRotation(seat) % 360;
  return rot === 90;
};

/** minimum cells to reserve for a player's discard area */
export const RESERVED_RIVER_SLOTS = 20;

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
  const placeholdersCount = Math.max(0, RESERVED_RIVER_SLOTS - ordered.length);
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
      {Array.from({ length: placeholdersCount }).map((_, idx) => (
        <span
          key={`placeholder-${idx}`}
          className="inline-block border px-1 py-0.5 bg-white tile-font-size opacity-0"
          style={{ transform: `rotate(${seatRotation(seat) - seatRiverRotation(seat)}deg)` }}
        />
      ))}
    </div>
  );
};
