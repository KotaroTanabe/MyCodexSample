import { LogEntry, RoundStartInfo, Tile } from '../types/mahjong';

export interface RoundEndInfo {
  result: '和了' | '流局';
  diffs: number[];
  winner?: number;
  loser?: number;
  uraDora?: Tile[];
}

export function tileToTenhouNumber(tile: Tile): number {
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
  const nums = e.tiles.map(t => tileToTenhouNumber(t)).join('');
  const prefix = e.meldType === 'chi' ? 'c' : e.meldType === 'pon' ? 'p' : 'm';
  return prefix + nums;
}

export function exportTenhouLog(
  round: RoundStartInfo,
  log: LogEntry[],
  startScores: number[],
  end: RoundEndInfo,
) {
  const hai = round.hands.map(h => h.map(tileToTenhouNumber));
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
        const prev = log[i - 1];
        if (
          lastDraw[entry.player] &&
          prev &&
          prev.type === 'draw' &&
          prev.player === entry.player &&
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
        take[entry.player].push(encodeMeld(entry));
        dahai[entry.from].push(0);
        lastDraw[entry.player] = null;
        break;
      case 'tsumo':
        take[entry.player].push(tileToTenhouNumber(entry.tile));
        lastDraw[entry.player] = null;
        break;
      case 'ron':
        take[entry.player].push(tileToTenhouNumber(entry.tile));
        lastDraw[entry.player] = null;
        break;
    }
  }

  const dora = [tileToTenhouNumber(round.doraIndicator)];
  const ura = end.uraDora ? end.uraDora.map(tileToTenhouNumber) : [];

  const kyokuNum = round.kyoku - 1;

  const hand: any[] = [
    [kyokuNum, 0, 0],
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
    resultArr.push([end.winner, end.loser ?? end.winner, end.winner, '']);
  }
  hand.push(resultArr);

  return {
    title: ['', ''],
    name: ['A', 'B', 'C', 'D'],
    // Fixed rule display string for Tenhou format
    rule: { disp: '四南喰', aka: 0 },
    log: [hand],
  };
}
