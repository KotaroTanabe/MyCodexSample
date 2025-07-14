import React from 'react';
import { PlayerState, Tile, Meld } from '../types/mahjong';
import { TileView } from './TileView';
import { MeldView } from './MeldView';
import { countDora } from '../utils/dora';
import { calcBase } from '../score/score';

function formatPointsText(
  han: number,
  fu: number,
  seatWind: number,
  winType: 'ron' | 'tsumo',
) {
  const base = calcBase(han, fu);
  if (winType === 'ron') {
    const mult = seatWind === 1 ? 6 : 4;
    const total = Math.ceil((base * mult) / 100) * 100;
    return `${total}点`;
  }
  if (seatWind === 1) {
    const each = Math.ceil((base * 2) / 100) * 100;
    return `${each}点オール`;
  }
  const nonDealer = Math.ceil(base / 100) * 100;
  const dealerPay = Math.ceil((base * 2) / 100) * 100;
  return `${nonDealer}点-${dealerPay}点`;
}

export interface WinResult {
  players: PlayerState[];
  winner: number;
  winType: 'ron' | 'tsumo';
  /** tiles in the winning hand, excluding called melds */
  hand: Tile[];
  /** melds claimed before the win */
  melds: Meld[];
  /** tile used to complete the hand */
  winTile: Tile;
  yaku: string[];
  han: number;
  fu: number;
  points: number;
  /** dora indicators revealed during play */
  dora: Tile[];
  /** ura-dora indicators revealed after a riichi win */
  uraDora?: Tile[];
}

interface Props extends WinResult {
  onNext: () => void;
  nextLabel?: string;
  onDownloadTenhou?: () => void;
  onCopyTenhou?: () => void;
}

export const WinResultModal: React.FC<Props> = ({
  players,
  winner,
  winType,
  hand,
  melds,
  winTile,
  yaku,
  han,
  fu,
  points: _points,
  dora,
  uraDora,
  onNext,
  nextLabel = '次局へ',
  onDownloadTenhou,
  onCopyTenhou,
}) => {
  if (players.length === 0) return null;
  const title = winType === 'ron' ? 'ロン和了' : 'ツモ和了';
  const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
  const doraCount = countDora(allTiles, [...dora, ...(uraDora ?? [])]);
  const yakuText = [
    ...yaku,
    doraCount > 0 ? `ドラ${doraCount}` : undefined,
  ]
    .filter(Boolean)
    .join('、');
  const seatWind = players[winner].seat + 1;
  const pointsText = formatPointsText(han, fu, seatWind, winType);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <div className="mb-2 text-sm">{pointsText}</div>
        <div className="mb-2 text-sm">
          {yakuText} {han}翻 {fu}符
        </div>
        {dora.length > 0 && (
          <div className="mb-2 text-sm flex items-center gap-1">
            <span>表ドラ:</span>
            {dora.map(t => (
              <TileView key={t.id} tile={t} />
            ))}
          </div>
        )}
        {uraDora && uraDora.length > 0 && (
          <div className="mb-2 text-sm flex items-center gap-1">
            <span>裏ドラ:</span>
            {uraDora.map(t => (
              <TileView key={t.id} tile={t} />
            ))}
          </div>
        )}
        <div className="mb-2 text-sm flex items-center gap-1">
          <span>あがり牌:</span>
          <TileView tile={winTile} />
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {melds.map((m, i) => (
            <MeldView key={i} meld={m} seat={winner} />
          ))}
          {hand.map(t => (
            <TileView
              key={t.id}
              tile={t}
              className={t.id === winTile.id ? 'border-2 border-red-500' : ''}
            />
          ))}
        </div>
        <table className="border-collapse text-sm mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">プレイヤー</th>
              <th className="border px-2 py-1">点数</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, idx) => (
              <tr key={p.name} className={idx === winner ? 'font-bold' : ''}>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1 text-right">{p.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(onDownloadTenhou || onCopyTenhou) && (
          <div className="flex gap-2 mt-2">
            {onDownloadTenhou && (
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={onDownloadTenhou}
              >
                Tenhouログダウンロード
              </button>
            )}
            {onCopyTenhou && (
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={onCopyTenhou}
              >
                コピー
              </button>
            )}
          </div>
        )}
        <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
};
