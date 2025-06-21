import React from 'react';
import { Meld } from '../types/mahjong';
import { TileView } from './TileView';

export const MeldView: React.FC<{ meld: Meld }> = ({ meld }) => {
  return (
    <div className="flex gap-1 border rounded px-1 bg-gray-50">
      {meld.tiles.map(tile => (
        <TileView
          key={tile.id}
          tile={tile}
          className={tile.id === meld.calledTileId ? 'rotate-90' : undefined}
        />
      ))}
    </div>
  );
};
