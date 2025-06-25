import React from 'react';
import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { TileView } from './TileView';
import { canDeclareRiichi } from './Player';
import { MeldView } from './MeldView';
import { RiverView } from './RiverView';
import { ScoreBoard } from './ScoreBoard';

const suitMap: Record<string, string> = { man: '萬', pin: '筒', sou: '索', wind: '', dragon: '' };
const honorMap: Record<string, Record<number, string>> = {
  wind: { 1: '東', 2: '南', 3: '西', 4: '北' },
  dragon: { 1: '白', 2: '發', 3: '中' },
};

interface UIBoardProps {
  players: PlayerState[];
  dora: Tile[];
  kyoku: number;
  wallCount: number;
  kyotaku: number;
  honba: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onDiscard: (tileId: string) => void;
  isMyTurn: boolean;
  shanten: { standard: number; chiitoi: number; kokushi: number };
  lastDiscard: { tile: Tile; player: number; isShonpai: boolean } | null;
  callOptions?: (MeldType | 'pass')[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onCallAction?: (action: MeldType | 'pass') => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onRiichi?: () => void;
  selfKanOptions?: Tile[][];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onSelfKan?: (tiles: Tile[]) => void;
  chiOptions?: Tile[][];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  onChi?: (tiles: Tile[]) => void;
  tsumoOption?: boolean;
  onTsumo?: () => void;
  onTsumoPass?: () => void;
  ronOption?: boolean;
  onRon?: () => void;
  onRonPass?: () => void;
  playerIsAI?: boolean;
  onToggleAI?: () => void;
}

// 簡易UI：自分の手牌＋捨て牌、AIの捨て牌のみ表示
export const UIBoard: React.FC<UIBoardProps> = ({
  players,
  dora,
  kyoku,
  wallCount,
  kyotaku,
  honba,
  onDiscard,
  isMyTurn,
  shanten,
  lastDiscard,
  callOptions,
  onCallAction,
  onRiichi,
  selfKanOptions,
  onSelfKan,
  chiOptions,
  onChi,
  tsumoOption,
  onTsumo,
  onTsumoPass,
  ronOption,
  onRon,
  onRonPass,
  playerIsAI,
  onToggleAI,
}) => {
  if (players.length === 0) {
    return null;
  }
  const me = players[0];
  const right = players[1];
  const top = players[2];
  const left = players[3];
  return (
    <div
      data-testid="ui-board"
      className="w-full grid gap-2 place-items-center"
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateAreas: `
          '. top .'
          'left center right'
          '. me .'
        `,
      }}
    >
      {/* 対面 */}
      <div className="flex flex-col items-center" style={{ gridArea: 'top' }}>
        <div className="text-sm mb-1">
          {top.name}: <span className="font-mono">{top.score}</span>
        </div>
        {top.melds.length > 0 && (
          <div className="flex gap-1 mb-1">
            {top.melds.map((m, idx) => (
              <MeldView key={idx} meld={m} seat={top.seat} />
            ))}
          </div>
        )}
        {top.isRiichi && <div className="text-xs">1000点棒</div>}
        <RiverView
          tiles={top.discard}
          seat={top.seat}
          lastDiscard={lastDiscard}
          dataTestId="discard-seat-2"
        />
      </div>

      {/* 右側：下家 */}
      <div className="flex items-start gap-2" style={{ gridArea: 'right' }}>
        <div className="flex flex-col items-center">
          {right.melds.length > 0 && (
            <div className="flex gap-1 mb-1">
              {right.melds.map((m, idx) => (
                <MeldView key={idx} meld={m} seat={right.seat} />
              ))}
            </div>
          )}
          {right.isRiichi && <div className="text-xs">1000点棒</div>}
          <RiverView
            tiles={right.discard}
            seat={right.seat}
            lastDiscard={lastDiscard}
            dataTestId="discard-seat-1"
          />
        </div>
        <div className="text-sm">
          {right.name}: <span className="font-mono">{right.score}</span>
        </div>
      </div>

      {/* 左側：上家 */}
      <div className="flex items-start gap-2" style={{ gridArea: 'left' }}>
        <div className="text-sm">
          {left.name}: <span className="font-mono">{left.score}</span>
        </div>
        <div className="flex flex-col items-center">
          {left.melds.length > 0 && (
            <div className="flex gap-1 mb-1">
              {left.melds.map((m, idx) => (
                <MeldView key={idx} meld={m} seat={left.seat} />
              ))}
            </div>
          )}
          {left.isRiichi && <div className="text-xs">1000点棒</div>}
          <RiverView
            tiles={left.discard}
            seat={left.seat}
            lastDiscard={lastDiscard}
            dataTestId="discard-seat-3"
          />
        </div>
      </div>

      {/* ドラ表示と局情報 */}
      <div
        className="flex items-center gap-4"
        style={{ gridArea: 'center' }}
        data-testid="center-area"
      >
        <ScoreBoard kyoku={kyoku} wallCount={wallCount} kyotaku={kyotaku} honba={honba} />
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm">ドラ表示</div>
          <div className="flex gap-1">
            {dora.map(tile => (
              <TileView key={tile.id} tile={tile} />
            ))}
          </div>
        </div>
      </div>

      {/* 自分の手牌 */}
      <div
        className="flex flex-col items-center mt-2"
        style={{ gridArea: 'me' }}
      >
        {me.melds.length > 0 && (
          <div className="flex gap-2 mb-2">
            {me.melds.map((m, idx) => (
              <MeldView key={idx} meld={m} seat={me.seat} />
            ))}
          </div>
        )}
        {me.isRiichi && <div className="text-xs">1000点棒</div>}
        <RiverView
          tiles={me.discard}
          seat={me.seat}
          lastDiscard={lastDiscard}
          dataTestId="discard-seat-0"
        />
        <div className="text-sm mb-1">
          {me.name}: <span className="font-mono">{me.score}</span>
        </div>
        <div className="text-sm mb-2">
          {(() => {
            const base = Math.min(shanten.standard, shanten.chiitoi, shanten.kokushi);
            let label = '';
            if (shanten.chiitoi === base && base < shanten.standard) {
              label = `七対子${base}向聴`;
            } else if (shanten.kokushi === base && base < shanten.standard) {
              label = `国士無双${base}向聴`;
            }
            return base === 0
              ? <>聴牌{label && ` (${label})`}</>
              : <>向聴数: {base}{label && ` (${label})`}</>;
          })()}
        </div>
        {(() => {
          const my = me;
          const handTiles = my.drawnTile
            ? my.hand.filter(t => t.id !== my.drawnTile?.id)
            : my.hand;
          return (
            <div className="flex gap-2 items-center overflow-x-auto">
              <span className="text-xs text-gray-600">手牌</span>
              {handTiles.map(tile => {
                const kanji =
                  tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou'
                    ? `${tile.rank}${suitMap[tile.suit]}`
                    : honorMap[tile.suit]?.[tile.rank] ?? '';
                return (
                  <button
                    key={tile.id}
                    className={`border rounded bg-surface-0 dark:bg-surface-700 px-2 py-1 hover:bg-primary-100 dark:hover:bg-primary-700 ${isMyTurn ? '' : 'opacity-50 pointer-events-none'}`}
                    onClick={() => onDiscard(tile.id)}
                    disabled={!isMyTurn}
                    aria-label={kanji}
                  >
                    <TileView tile={tile} />
                  </button>
                );
              })}
              {my.drawnTile && (() => {
                const t = my.drawnTile;
                const kanji =
                  t.suit === 'man' || t.suit === 'pin' || t.suit === 'sou'
                    ? `${t.rank}${suitMap[t.suit]}`
                    : honorMap[t.suit]?.[t.rank] ?? '';
                return (
                  <button
                    key={t.id}
                    className={`border rounded bg-surface-0 dark:bg-surface-700 px-2 py-1 hover:bg-primary-100 dark:hover:bg-primary-700 ml-4 ${isMyTurn ? '' : 'opacity-50 pointer-events-none'}`}
                    onClick={() => onDiscard(t.id)}
                    disabled={!isMyTurn}
                    aria-label={kanji}
                  >
                    <TileView tile={t} />
                  </button>
                );
              })()}
            </div>
          );
        })()}
        {callOptions && callOptions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {callOptions.map(act => (
              <button
                key={act}
                className="px-2 py-1 bg-warning-200 dark:bg-warning-700 rounded"
                onClick={() => onCallAction?.(act)}
              >
                {act === 'pon' ? 'ポン' : act === 'chi' ? 'チー' : act === 'kan' ? 'カン' : 'スルー'}
              </button>
            ))}
          </div>
        )}
        {chiOptions && chiOptions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {chiOptions.map((tiles, idx) => {
              const labels = tiles
                .map(t =>
                  t.suit === 'man' || t.suit === 'pin' || t.suit === 'sou'
                    ? `${t.rank}${suitMap[t.suit]}`
                    : honorMap[t.suit]?.[t.rank] ?? ''
                )
                .join('');
              return (
                <button
                  key={idx}
                  className="px-2 py-1 bg-warning-200 dark:bg-warning-700 rounded flex gap-1"
                  onClick={() => onChi?.(tiles)}
                  aria-label={labels}
                >
                  チー
                  {tiles.map(t => (
                    <TileView key={t.id} tile={t} />
                  ))}
                </button>
              );
            })}
          </div>
        )}
        {selfKanOptions && selfKanOptions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {selfKanOptions.map((tiles, idx) => (
              <button
                key={idx}
                className="px-2 py-1 bg-secondary-200 dark:bg-secondary-700 rounded"
                onClick={() => onSelfKan?.(tiles)}
              >
                カン
              </button>
            ))}
          </div>
        )}
        {tsumoOption && (
          <div className="flex gap-2 mt-2">
            <button className="px-2 py-1 bg-primary-200 dark:bg-primary-700 rounded" onClick={() => onTsumo?.()}>ツモ</button>
            <button className="px-2 py-1 bg-surface-200 dark:bg-surface-600 rounded" onClick={() => onTsumoPass?.()}>スルー</button>
          </div>
        )}
        {ronOption && (
          <div className="flex gap-2 mt-2">
            <button className="px-2 py-1 bg-danger-200 dark:bg-danger-700 rounded" onClick={() => onRon?.()}>ロン</button>
            <button className="px-2 py-1 bg-surface-200 dark:bg-surface-600 rounded" onClick={() => onRonPass?.()}>スルー</button>
          </div>
        )}
        {onRiichi && isMyTurn && canDeclareRiichi(me) && (
          <button
            className="mt-2 px-2 py-1 bg-danger-200 dark:bg-danger-700 rounded"
            onClick={() => onRiichi()}
          >
            リーチ
          </button>
        )}
        {onToggleAI && (
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={playerIsAI} onChange={onToggleAI} />
            観戦モード
          </label>
        )}
      </div>
    </div>
  );
};
