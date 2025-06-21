import React from 'react';
import { PlayerState, Tile, Suit, MeldType } from '../types/mahjong';

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

// 牌表示（簡易）
export const TileView: React.FC<{ tile: Tile; isShonpai?: boolean }> = ({ tile, isShonpai }) => {
  const suitMap: Record<string, string> = { man: '萬', pin: '筒', sou: '索', wind: '', dragon: '' };
  const honorMap: Record<string, Record<number, string>> = {
    wind: { 1: '東', 2: '南', 3: '西', 4: '北' },
    dragon: { 1: '白', 2: '發', 3: '中' },
  };
  const emojiMap: Record<Suit, Record<number, string>> = {
    man: {
      1: '🀇',
      2: '🀈',
      3: '🀉',
      4: '🀊',
      5: '🀋',
      6: '🀌',
      7: '🀍',
      8: '🀎',
      9: '🀏',
    },
    pin: {
      1: '🀙',
      2: '🀚',
      3: '🀛',
      4: '🀜',
      5: '🀝',
      6: '🀞',
      7: '🀟',
      8: '🀠',
      9: '🀡',
    },
    sou: {
      1: '🀐',
      2: '🀑',
      3: '🀒',
      4: '🀓',
      5: '🀔',
      6: '🀕',
      7: '🀖',
      8: '🀗',
      9: '🀘',
    },
    wind: {
      1: '🀀',
      2: '🀁',
      3: '🀂',
      4: '🀃',
    },
    dragon: {
      1: '🀆',
      2: '🀅',
      3: '🀄',
    },
  };
  const kanji =
    tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou'
      ? `${tile.rank}${suitMap[tile.suit]}`
      : honorMap[tile.suit]?.[tile.rank] ?? '';
  return (
    <span
      className="inline-block border px-1 py-0.5 bg-white tile-font-size"
      aria-label={kanji}
    >
      <span className="font-emoji">
        {emojiMap[tile.suit]?.[tile.rank] ?? kanji}
      </span>
      {isShonpai && <span className="text-yellow-500 ml-0.5">★</span>}
    </span>
  );
};
