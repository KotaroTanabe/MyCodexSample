import React from 'react';
import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { TileView } from './TileView';
import { MeldView } from './MeldView';

interface UIBoardProps {
  players: PlayerState[];
  dora: Tile[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onDiscard: (tileId: string) => void;
  isMyTurn: boolean;
  shanten: { standard: number; chiitoi: number; kokushi: number };
  lastDiscard: { tile: Tile; player: number; isShonpai: boolean } | null;
  callOptions?: (MeldType | 'pass')[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onCallAction?: (action: MeldType | 'pass') => void;
}

// 簡易UI：自分の手牌＋捨て牌、AIの捨て牌のみ表示
export const UIBoard: React.FC<UIBoardProps> = ({
  players,
  dora,
  onDiscard,
  isMyTurn,
  shanten,
  lastDiscard,
  callOptions,
  onCallAction,
}) => {
  if (players.length === 0) {
    return null;
  }
  return (
    <div className="w-full grid grid-cols-4 gap-2">
      {/* 上部：AIの捨て牌 */}
      {players.slice(1).map(ai => (
        <div key={ai.name} className="flex flex-col items-center">
          <div className="text-sm mb-1">{ai.name}</div>
          {ai.melds.length > 0 && (
            <div className="flex gap-1 mb-1">
              {ai.melds.map((m, idx) => (
                <MeldView key={idx} meld={m} />
              ))}
            </div>
          )}
          <div className="grid grid-cols-6 gap-1">
            {ai.discard.map(tile => (
              <TileView
                key={tile.id}
                tile={tile}
                isShonpai={lastDiscard?.tile.id === tile.id && lastDiscard.isShonpai}
              />
            ))}
          </div>
        </div>
      ))}
      {/* ドラ表示 */}
      <div className="col-span-4 flex flex-col items-center mt-2">
        <div className="text-sm mb-1">ドラ表示</div>
        <div className="flex gap-1">
          {dora.map(tile => (
            <TileView key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
      {/* 自分の手牌 */}
      <div className="col-span-4 flex flex-col items-center mt-4">
        {players[0].melds.length > 0 && (
          <div className="flex gap-2 mb-2">
            {players[0].melds.map((m, idx) => (
              <MeldView key={idx} meld={m} />
            ))}
          </div>
        )}
        <div className="text-lg mb-1">あなたの手牌</div>
        <div className="text-sm mb-2">
          {(() => {
            const base = Math.min(shanten.standard, shanten.chiitoi, shanten.kokushi);
            let label = '';
            if (shanten.chiitoi === base && base < shanten.standard) {
              label = `七対子${base}向聴`;
            } else if (shanten.kokushi === base && base < shanten.standard) {
              label = `国士無双${base}向聴`;
            }
            return <>向聴数: {base}{label && ` (${label})`}</>;
          })()}
        </div>
        {(() => {
          const my = players[0];
          const handTiles = my.drawnTile
            ? my.hand.filter(t => t.id !== my.drawnTile?.id)
            : my.hand;
          return (
            <div className="flex gap-2 items-center">
              {handTiles.map(tile => (
                <button
                  key={tile.id}
                  className={`border rounded bg-white px-2 py-1 hover:bg-blue-100 ${isMyTurn ? '' : 'opacity-50 pointer-events-none'}`}
                  onClick={() => onDiscard(tile.id)}
                  disabled={!isMyTurn}
                >
                  <TileView tile={tile} />
                </button>
              ))}
              {my.drawnTile && (
                <button
                  key={my.drawnTile.id}
                  className={`border rounded bg-white px-2 py-1 hover:bg-blue-100 ml-4 ${isMyTurn ? '' : 'opacity-50 pointer-events-none'}`}
                  onClick={() => onDiscard(my.drawnTile!.id)}
                  disabled={!isMyTurn}
                >
                  <TileView tile={my.drawnTile} />
                </button>
              )}
            </div>
          );
        })()}
        <div className="flex gap-1 mt-2">
          {players[0].discard.map(tile => (
            <TileView
              key={tile.id}
              tile={tile}
              isShonpai={lastDiscard?.tile.id === tile.id && lastDiscard.isShonpai}
            />
          ))}
        </div>
        {callOptions && callOptions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {callOptions.map(act => (
              <button
                key={act}
                className="px-2 py-1 bg-yellow-200 rounded"
                onClick={() => onCallAction?.(act)}
              >
                {act === 'pon' ? 'ポン' : act === 'chi' ? 'チー' : act === 'kan' ? 'カン' : 'スルー'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
