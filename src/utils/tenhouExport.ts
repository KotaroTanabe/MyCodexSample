import { LogEntry, RoundStartInfo, Tile } from '../types/mahjong';
import { calcBase, calcRoundedScore } from '../score/score';
import { toTenhouName } from './tenhouYakuNames';

export interface RoundEndInfo {
  result: '和了' | '流局';
  diffs: number[];
  winner?: number;
  loser?: number;
  uraDora?: Tile[];
  han?: number;
  fu?: number;
  seatWind?: number;
  winType?: 'ron' | 'tsumo';
  yakuList?: { name: string; han: number; detail?: string }[];
}

export function tileToTenhouNumber(tile: Tile): number {
  if (tile.red) {
    if (tile.suit === 'man') return 51;
    if (tile.suit === 'pin') return 52;
    if (tile.suit === 'sou') return 53;
  }
  switch (tile.suit) {
    case 'man':
      return 10 + tile.rank;
    case 'pin':
      return 20 + tile.rank;
    case 'sou':
      return 30 + tile.rank;
    case 'wind':
      return 40 + tile.rank;
    case 'dragon':
      return 44 + tile.rank;
    default:
      return 0;
  }
}

function encodeMeld(e: Extract<LogEntry, { type: 'meld' }>): string {
  const prefixMap = {
    chi: 'c',
    pon: 'p',
    kan: e.kanType === 'daiminkan' ? 'm' : e.kanType === 'kakan' ? 'k' : 'a',
  } as const;

  if (e.meldType === 'chi') {
    const called = tileToTenhouNumber(e.tiles[e.tiles.length - 1]);
    const others = e.tiles
      .slice(0, e.tiles.length - 1)
      .map(t => tileToTenhouNumber(t))
      .sort((a, b) => a - b);
    return prefixMap.chi + [called, ...others].join('');
  }

  const called = tileToTenhouNumber(e.tiles[e.tiles.length - 1]);
  const others = e.tiles
    .slice(0, e.tiles.length - 1)
    .map(t => tileToTenhouNumber(t))
    .sort((a, b) => a - b);
  const diff = (e.from - e.player + 4) % 4;
  const pos = diff === 3 ? 0 : diff === 2 ? 1 : diff === 1 ? 2 : 3;
  others.splice(pos, 0, called);
  return others
    .map((n, i) => (i === pos ? prefixMap[e.meldType] + n : String(n)))
    .join('');
}

function formatPointString(han: number, fu: number, seatWind: number, winType: 'ron' | 'tsumo'): string {
  const base = calcBase(han, fu);
  const limit =
    han >= 13
      ? '役満'
      : han >= 11
      ? '三倍満'
      : han >= 8
      ? '倍満'
      : han >= 6
      ? '跳満'
      : han === 5 || base >= 2000
      ? '満貫'
      : null;

  if (winType === 'ron') {
    const pts = calcRoundedScore(han, fu, seatWind === 1, 'ron');
    return limit ? `${limit}${pts}点` : `${fu}符${han}飜${pts}点`;
  }

  if (seatWind === 1) {
    const each = calcRoundedScore(han, fu, true, 'tsumo');
    return limit ? `${limit}${each}点∀` : `${fu}符${han}飜${each}点∀`;
  }
  const child = calcRoundedScore(han, fu, false, 'tsumo');
  const dealer = calcRoundedScore(han, fu, true, 'tsumo');
  return limit
    ? `${limit}${child}-${dealer}点`
    : `${fu}符${han}飜${child}-${dealer}点`;
}

export function exportTenhouLog(
  round: RoundStartInfo,
  log: LogEntry[],
  startScores: number[],
  end: RoundEndInfo,
  doraIndicators: Tile[] = [round.doraIndicator],
  aka = 0,
  startHonba = 0,
  startKyotaku = 0,
) {
  const hai = round.hands.map(h => h.map(tileToTenhouNumber));
  // Dealer has 14 tiles in RoundStartInfo; Tenhou format expects 13.
  // Remove the tile that was drawn before the round began so it only
  // appears in the take list.
  if (hai[round.dealer].length === 14) {
    let drawTile: Tile | null = null;
    for (const e of log) {
      if (e.type === 'draw' && e.player === round.dealer) {
        drawTile = e.tile;
        break;
      }
    }
    if (drawTile) {
      const n = tileToTenhouNumber(drawTile);
      const idx = hai[round.dealer].indexOf(n);
      if (idx !== -1) hai[round.dealer].splice(idx, 1);
    }
  }
  const take: (Array<number | string>)[] = [[], [], [], []];
  const dahai: (Array<number | string>)[] = [[], [], [], []];
  const lastDraw: (Tile | null)[] = [null, null, null, null];

  for (let i = 0; i < log.length; i++) {
    const entry = log[i];
    switch (entry.type) {
      case 'draw':
        take[entry.player].push(tileToTenhouNumber(entry.tile));
        lastDraw[entry.player] = entry.tile;
        break;
      case 'discard': {
        if (
          lastDraw[entry.player] &&
          lastDraw[entry.player]!.id === entry.tile.id
        ) {
          dahai[entry.player].push(60);
        } else {
          dahai[entry.player].push(tileToTenhouNumber(entry.tile));
        }
        lastDraw[entry.player] = null;
        break;
      }
      case 'riichi': {
        dahai[entry.player].push('r' + tileToTenhouNumber(entry.tile));
        const next = log[i + 1];
        if (
          next &&
          next.type === 'discard' &&
          next.player === entry.player &&
          next.tile.id === entry.tile.id
        ) {
          i++;
        }
        lastDraw[entry.player] = null;
        break;
      }
      case 'meld':
        if (entry.meldType === 'kan' && entry.kanType !== 'daiminkan') {
          dahai[entry.player].push(encodeMeld(entry));
        } else {
          take[entry.player].push(encodeMeld(entry));
          if (entry.meldType === 'kan' && entry.kanType === 'daiminkan') {
            // In Tenhou logs, only daiminkan replaces the discard with 0.
            dahai[entry.from].push(0);
          }
        }
        lastDraw[entry.player] = null;
        break;
      case 'tsumo': {
        // If the previous event was the draw of this tile, we already
        // recorded it. Avoid duplicating the winning tile in the take list.
        const prev = log[i - 1];
        if (
          i > 0 &&
          prev &&
          prev.type === 'draw' &&
          prev.player === entry.player &&
          prev.tile.id === entry.tile.id
        ) {
          lastDraw[entry.player] = null;
        } else {
          take[entry.player].push(tileToTenhouNumber(entry.tile));
          lastDraw[entry.player] = null;
        }
        break;
      }
      case 'ron':
        // Ron tiles should not appear in the take list. Only the
        // discarded tile from the losing player is recorded. See
        // docs/tenhou-json.md for details.
        lastDraw[entry.player] = null;
        break;
    }
  }

  const dora = doraIndicators.map(tileToTenhouNumber);
  const ura = end.uraDora ? end.uraDora.map(tileToTenhouNumber) : [];

  const kyokuNum = round.kyoku - 1;

  const hand: any[] = [
    [kyokuNum, startHonba, startKyotaku],
    startScores,
    dora,
    ura,
    hai[0],
    take[0],
    dahai[0],
    hai[1],
    take[1],
    dahai[1],
    hai[2],
    take[2],
    dahai[2],
    hai[3],
    take[3],
    dahai[3],
  ];

  const resultArr: any[] = [end.result, end.diffs];
  if (end.result === '和了') {
    const pointStr =
      end.han !== undefined &&
      end.fu !== undefined &&
      end.seatWind !== undefined &&
      end.winType
        ? formatPointString(end.han, end.fu, end.seatWind, end.winType)
        : '';
    const yaku =
      end.yakuList?.map(y => {
        const name =
          y.name === 'Yakuhai' && y.detail ? y.detail : toTenhouName(y.name);
        return `${name}(${y.han}飜)`;
      }) ?? [];
    resultArr.push([end.winner, end.loser ?? end.winner, end.winner, pointStr, ...yaku]);
  }
  hand.push(resultArr);

  return {
    title: ['', ''],
    name: ['A', 'B', 'C', 'D'],
    // Fixed rule display string for Tenhou format
    rule: {
      disp: `四南喰${aka > 0 ? `赤${aka}` : ''}`,
      aka,
    },
    log: [hand],
  };
}

/**
 * Convert a Tenhou JSON log to a URL that can be opened in the
 * Tenhou replay/editor page.
 */
export function tenhouJsonToUrl(data: unknown): string {
  const json = JSON.stringify(data);
  return `https://tenhou.net/6/#json=${encodeURIComponent(json)}&ts=0`;
}
