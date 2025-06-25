import React from 'react';
import { Meld } from '../types/mahjong';
import { TileView } from './TileView';
import { rotationForSeat } from '../utils/rotation';
import { calledRotation } from '../utils/calledRotation';

const seatRotation = rotationForSeat;
const seatMeldRotation = rotationForSeat;


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
          faceDown={
            meld.type === 'kan' && meld.kanType === 'ankan' &&
            (tile === meld.tiles[0] || tile === meld.tiles[3])
          }
          rotate={
            seatRotation(seat) -
            seatMeldRotation(seat) +
            (tile.id === meld.calledTileId
              ? meld.kanType === 'kakan'
                ? 90
                : calledRotation(seat, meld.fromPlayer)
              : 0)
          }
          extraTransform={
            meld.type === 'kan' && meld.kanType === 'kakan' &&
            tile.id === meld.calledTileId
              ? 'translateY(-4px)'
              : ''
          }
        />
      ))}
    </div>
  );
};
