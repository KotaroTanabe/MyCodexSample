import { LogEntry } from '../types/mahjong';
import { GameDetailRecords, RecordHead, RecordAction } from '../types/jantama';

function convertAction(entry: LogEntry): RecordAction {
  switch (entry.type) {
    case 'startRound':
      return { name: '.lq.RecordNewRound', kyoku: entry.kyoku };
    case 'draw':
      return { name: '.lq.RecordDrawTile', seat: entry.player, tile: entry.tile.id };
    case 'discard':
      return { name: '.lq.RecordDiscardTile', seat: entry.player, tile: entry.tile.id };
    case 'meld':
      return {
        name: '.lq.RecordCall',
        seat: entry.player,
        tiles: entry.tiles.map(t => t.id),
        meldType: entry.meldType,
        from: entry.from,
      };
    case 'riichi':
      return { name: '.lq.RecordRiichi', seat: entry.player, tile: entry.tile.id };
    case 'tsumo':
      return { name: '.lq.RecordTsumo', seat: entry.player, tile: entry.tile.id };
    case 'ron':
      return {
        name: '.lq.RecordRon',
        seat: entry.player,
        tile: entry.tile.id,
        from: entry.from,
      };
  }
}

export function exportLqRecord(log: LogEntry[], head: RecordHead): GameDetailRecords {
  const data = log.map((e, idx) => ({
    time: head.startTime + idx,
    actions: [convertAction(e)],
  }));
  return { name: '.lq.GameDetailRecords', head, data };
}
