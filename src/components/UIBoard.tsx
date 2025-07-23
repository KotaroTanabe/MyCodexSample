import React from 'react';
import { PlayerState, Tile, MeldType } from '../types/mahjong';
import { TileView } from './TileView';
import { canDeclareRiichi } from './Player';
import { RiverView } from './RiverView';
import { ScoreBoard } from './ScoreBoard';
import { RiichiStick } from './RiichiStick';
import { HandView } from './HandView';
import { MeldArea } from './MeldArea';
import { isWinningHand, detectYaku } from '../score/yaku';
import { countUkeireTiles } from '../utils/ukeire';
import { tileToKanji } from '../utils/tileString';

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
  onDiscard: (_tileId: string) => void;
  isMyTurn: boolean;
  shanten: { standard: number; chiitoi: number; kokushi: number };
  lastDiscard: { tile: Tile; player: number; isShonpai: boolean } | null;
  callOptions?: (MeldType | 'pass')[];
  onCallAction?: (_action: MeldType | 'pass') => void;
  onRiichi?: () => void;
  selfKanOptions?: Tile[][];
  onSelfKan?: (_tiles: Tile[]) => void;
  chiOptions?: Tile[][];
  onChi?: (_tiles: Tile[]) => void;
  tsumoOption?: boolean;
  onTsumo?: () => void;
  onTsumoPass?: () => void;
  ronOption?: boolean;
  onRon?: () => void;
  onRonPass?: () => void;
  playerIsAI?: boolean;
  onToggleAI?: () => void;
  advancedAI?: boolean;
  onToggleAdvancedAI?: () => void;
  showBorders?: boolean;
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
  advancedAI,
  onToggleAdvancedAI,
  showBorders = true,
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
      className="w-full grid gap-0 place-items-center mx-auto max-w-screen-md relative"
      style={{
        gridTemplateColumns: 'auto auto auto',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateAreas: `
          'top top top'
          'left center right'
          'me me me'
        `,
      }}
    >
      {/* 対面 */}
      <div className="flex flex-col items-center" style={{ gridArea: 'top' }}>
        <div className="text-sm mb-1">
          {top.name}: <span className="font-mono">{top.score}</span>
        </div>
        <div
          className="text-xs font-mono mb-1 w-16 text-center"
          data-testid="hand-count-2"
        >
          <span className="font-emoji tile-font-size">🀫</span>
          {` x ${String(top.hand.length).padStart(2, '0')}`}
        </div>
        <RiverView
          tiles={top.discard}
          seat={top.seat}
          lastDiscard={lastDiscard}
          dataTestId="discard-seat-2"
          showBorder={showBorders}
        />
        {top.isRiichi && (
          <div className="text-xs" data-testid="riichi-indicator">
            <RiichiStick seat={top.seat} />
          </div>
        )}
      </div>

      {/* 右側：下家 */}
      <div className="flex items-start gap-2 justify-self-start" style={{ gridArea: 'right' }}>
        <div className="flex flex-col items-center">
          <div className="text-sm mb-1">
            {right.name}: <span className="font-mono">{right.score}</span>
          </div>
          {right.isRiichi && (
            <div className="text-xs" data-testid="riichi-indicator">
              <RiichiStick seat={right.seat} />
            </div>
          )}
          <div className="flex items-start gap-2">
            <RiverView
              tiles={right.discard}
              seat={right.seat}
              lastDiscard={lastDiscard}
              dataTestId="discard-seat-1"
              showBorder={showBorders}
            />
            <div
              className="text-xs font-mono w-16 text-center"
              data-testid="hand-count-1"
            >
              <span className="font-emoji tile-font-size">🀫</span>
              {` x ${String(right.hand.length).padStart(2, '0')}`}
            </div>
          </div>
        </div>
      </div>

      {/* 左側：上家 */}
      <div className="flex items-start gap-2 justify-self-end" style={{ gridArea: 'left' }}>
        <div className="flex flex-col items-center">
          <div className="text-sm mb-1">
            {left.name}: <span className="font-mono">{left.score}</span>
          </div>
          {left.isRiichi && (
            <div className="text-xs" data-testid="riichi-indicator">
              <RiichiStick seat={left.seat} />
            </div>
          )}
          <div className="flex items-start gap-2">
            <div
              className="text-xs font-mono w-16 text-center"
              data-testid="hand-count-3"
            >
              <span className="font-emoji tile-font-size">🀫</span>
              {` x ${String(left.hand.length).padStart(2, '0')}`}
            </div>
            <RiverView
              tiles={left.discard}
              seat={left.seat}
              lastDiscard={lastDiscard}
              dataTestId="discard-seat-3"
              showBorder={showBorders}
            />
          </div>
        </div>
      </div>

      {/* ドラ表示と局情報 */}
      <div
        className="flex flex-col items-center gap-4 justify-center sm:flex-row"
        style={{ gridArea: 'center' }}
        data-testid="info-area"
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
        <div className="flex items-start gap-2">
          <RiverView
            tiles={me.discard}
            seat={me.seat}
            lastDiscard={lastDiscard}
            dataTestId="discard-seat-0"
            showBorder={showBorders}
          />
          <MeldArea
            melds={me.melds}
            seat={me.seat}
            showBorder={showBorders && me.melds.length > 0}
          />
        </div>
        {me.isRiichi && (
          <div className="text-xs" data-testid="riichi-indicator">
            <RiichiStick seat={me.seat} />
          </div>
        )}
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
            if (base < 0) {
              const full = [...me.hand, ...me.melds.flatMap(m => m.tiles)];
              const winning = isWinningHand(full);
              if (!winning || !tsumoOption) {
                console.warn('negative shanten but not tsumo/win', { hand: full, shanten, tsumoOption });
              }
              const seatWind = me.seat + 1;
              const roundWind = kyoku <= 4 ? 1 : 2;
              const hasYaku =
                winning &&
                detectYaku(me.hand, me.melds, {
                  isTsumo: true,
                  seatWind,
                  roundWind,
                }).length > 0;
              return hasYaku ? <>和了可能</> : <>役なし</>;
            }
            if (base === 0) {
              const { counts } = countUkeireTiles(me.hand, me.melds.length);
              const tiles = Object.keys(counts)
                .map(key => {
                  const [suit, rankStr] = key.split('-');
                  return tileToKanji({
                    suit: suit as Tile['suit'],
                    rank: parseInt(rankStr, 10),
                    id: '',
                  });
                })
                .join(' ');
              return (
                <>
                  聴牌{label && ` (${label})`}
                  {tiles && (
                    <span
                      className="ml-1 cursor-help"
                      data-testid="winning-tiles"
                      title={tiles}
                    >
                      ?
                    </span>
                  )}
                </>
              );
            }
            return <>向聴数: {base}{label && ` (${label})`}</>;
          })()}
        </div>
        <HandView
          tiles={me.hand}
          drawnTile={me.drawnTile}
          onDiscard={onDiscard}
          isMyTurn={isMyTurn}
          showBorder={showBorders}
        />
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
      {onToggleAdvancedAI && (
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={advancedAI}
            onChange={onToggleAdvancedAI}
          />
          高度なAI
        </label>
      )}
      </div>
      {/* Meld areas in corners */}
      <div className="absolute left-0 top-0">
        <MeldArea
          melds={top.melds}
          seat={top.seat}
          showBorder={showBorders && top.melds.length > 0}
          dataTestId="meld-seat-2"
        />
      </div>
      <div className="absolute right-0 top-0">
        <MeldArea
          melds={right.melds}
          seat={right.seat}
          showBorder={showBorders && right.melds.length > 0}
          dataTestId="meld-seat-1"
        />
      </div>
      <div className="absolute left-0 bottom-[calc(var(--tile-font-size)*4)]">
        <MeldArea
          melds={left.melds}
          seat={left.seat}
          showBorder={showBorders && left.melds.length > 0}
          dataTestId="meld-seat-3"
        />
      </div>
    </div>
  );
};
