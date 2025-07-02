import { describe, it, expect } from 'vitest';
import { exportMjaiRecord } from './mjaiExport';
import { LogEntry, RoundStartInfo } from '../types/mahjong';

const tile = { suit: 'man', rank: 1, id: 'a' } as const;
const start: RoundStartInfo = {
  hands: [
    [tile, tile, tile, tile],
    [tile, tile, tile, tile],
    [tile, tile, tile, tile],
    [tile, tile, tile, tile],
  ],
  dealer: 0,
  doraIndicator: tile,
  kyoku: 1,
};

const log: LogEntry[] = [
  { type: 'startRound', kyoku: 1 },
  { type: 'draw', player: 0, tile },
  { type: 'discard', player: 0, tile },
];

describe('exportMjaiRecord', () => {
  it('converts log and round info to mjai events', () => {
    const scores = [25000, 25000, 25000, 25000];
    const result = exportMjaiRecord(log, start, scores);
    expect(result[0]).toBe('{"type":"start_game"}');
    expect(result[1]).toContain('"start_kyoku"');
    expect(result[2]).toBe('{"type":"tsumo","actor":0,"pai":"1m"}');
    expect(result[3]).toBe('{"type":"dahai","actor":0,"pai":"1m","tsumogiri":false}');
  });
});
