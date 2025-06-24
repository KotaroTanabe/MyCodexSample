import React from 'react';
import { Meld } from '../types/mahjong';
import { TileView } from './TileView';

const seatRotation = (seat: number) => {
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

const seatMeldRotation = (seat: number): number => {
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

const calledRotation = (seat: number, from: number) => {
  if (from === seat) return 0;
  const diff = (from - seat + 4) % 4;
  switch (diff) {
    case 1:
      return 90; // from right
    case 2:
      return 180; // from opposite
    case 3:
      return -90; // from left
    default:
      return 0;
  }
};

export const MeldView: React.FC<{ meld: Meld; seat?: number }> = ({ meld, seat = 0 }) => {
  return (
    <div
      className="flex gap-1 border rounded px-1 bg-gray-50"
      style={{ transform: `rotate(${seatMeldRotation(seat)}deg)` }}
    >
      {meld.tiles.map(tile => (
        <TileView
          key={tile.id}
          tile={tile}
          rotate={
            seatRotation(seat) -
            seatMeldRotation(seat) +
            (tile.id === meld.calledTileId ? calledRotation(seat, meld.fromPlayer) : 0)
          }
        />
      ))}
    </div>
  );
};
