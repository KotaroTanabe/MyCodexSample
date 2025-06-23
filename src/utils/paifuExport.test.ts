import { describe, it, expect } from 'vitest';
import { exportLqRecord } from './paifuExport';
import { LogEntry } from '../types/mahjong';
import { RecordHead } from '../types/jantama';

const sampleHead: RecordHead = {
  startTime: 0,
  endTime: 100,
  rule: { gameLength: 'east1' },
  players: [{ name: 'p1', seat: 0, isAI: false }],
};

const tile = { suit: 'man', rank: 1, id: 'a' } as const;

const log: LogEntry[] = [
  { type: 'startRound', kyoku: 1 },
  { type: 'draw', player: 0, tile },
  { type: 'discard', player: 0, tile },
];

describe('exportLqRecord', () => {
  it('maps log entries to lq actions', () => {
    const result = exportLqRecord(log, sampleHead);
    expect(result.name).toBe('.lq.GameDetailRecords');
    expect(result.data.length).toBe(3);
    expect(result.data[0].actions[0].name).toBe('.lq.RecordNewRound');
    expect(result.data[1].actions[0].name).toBe('.lq.RecordDrawTile');
    expect(result.data[2].actions[0].name).toBe('.lq.RecordDiscardTile');
  });
});
