import React from 'react';
import { Meld } from '../types/mahjong';
import { TileView } from './TileView';

const seatRotation = (seat: number) => (seat % 4) * 90;

export const MeldView: React.FC<{ meld: Meld; seat?: number }> = ({ meld, seat = 0 }) => {
  return (
    <div className="flex gap-1 border rounded px-1 bg-gray-50">
      {meld.tiles.map(tile => (
        <TileView
          key={tile.id}
          tile={tile}
          rotate={seatRotation(seat) + (tile.id === meld.calledTileId ? 90 : 0)}
        />
      ))}
    </div>
  );
};
