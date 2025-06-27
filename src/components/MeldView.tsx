import React from 'react';
import { Meld } from '../types/mahjong';
import { TileView } from './TileView';
import { rotationForSeat } from '../utils/rotation';
import { calledRotation } from '../utils/calledRotation';


export const MeldView: React.FC<{ meld: Meld; seat?: number }> = ({ meld, seat = 0 }) => {
  const isKakan = meld.type === 'kan' && meld.kanType === 'kakan';
  return (
    <div
      className="relative flex gap-1 border rounded px-1 bg-gray-50"
      style={{ transform: `rotate(${rotationForSeat(seat)}deg)` }}
    >
      {meld.tiles.map(tile => {
        const isCalled = tile.id === meld.calledTileId;
        const rotate = isCalled
          ? isKakan
            ? 90
            : calledRotation(seat, meld.fromPlayer)
          : 0;
        const faceDown =
          meld.type === 'kan' && meld.kanType === 'ankan' &&
          (tile === meld.tiles[0] || tile === meld.tiles[3]);
        const tileView = (
          <TileView
            key={tile.id}
            tile={tile}
            faceDown={faceDown}
            rotate={rotate}
            extraTransform={isKakan && isCalled ? 'translateX(-50%)' : ''}
          />
        );
        return isKakan && isCalled ? (
          <span key={`wrapper-${tile.id}`} className="kakan-called-tile">
            {tileView}
          </span>
        ) : (
          tileView
        );
      })}
    </div>
  );
};
