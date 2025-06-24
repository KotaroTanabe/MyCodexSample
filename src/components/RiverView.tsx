import React from 'react';
import { Tile } from '../types/mahjong';
import { TileView } from './TileView';
import { rotationForSeat } from '../utils/rotation';

const seatRotation = rotationForSeat;
const seatRiverRotation = rotationForSeat;


const calledOffset = (seat: number): string => {
  switch (seat % 4) {
    case 1:
      return 'translateY(-6px)';
    case 2:
      return 'translateX(-6px)';
    case 3:
      return 'translateY(6px)';
    default:
      return 'translateX(6px)';
  }
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
  const ordered = tiles;
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
          rotate={
            seatRotation(seat) -
            seatRiverRotation(seat) +
            (tile.called || tile.riichiDiscard ? 90 : 0)
          }
          extraTransform={tile.called ? calledOffset(seat) : ''}
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
