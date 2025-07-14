import { describe, it, expect, afterEach } from 'vitest';
import { exportTenhouLog, tileToTenhouNumber, RoundEndInfo } from './tenhouExport';
import { LogEntry, RoundStartInfo, Tile } from '../types/mahjong';
declare function require(name: string): any;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { writeFileSync, unlinkSync } = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');

function makeTile(id: number): Tile {
  return { suit: 'man', rank: 1, id: `${id}` };
}

afterEach(() => {
  try {
    unlinkSync('tmp.tenhou.json');
  } catch {
    /* ignore */
  }
});

describe('exportTenhouLog', () => {
  it('converts simple round to tenhou format', () => {
    const t = makeTile(1);
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(0).map((_, i) => makeTile(i + 2)));
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: t,
      kyoku: 1,
    };
    const log: LogEntry[] = [
      { type: 'startRound', kyoku: 1 },
      { type: 'draw', player: 0, tile: t },
      { type: 'discard', player: 0, tile: t },
      { type: 'tsumo', player: 0, tile: t },
    ];
    const end: RoundEndInfo = {
      result: '和了',
      diffs: [0, 0, 0, 0],
      winner: 0,
      loser: 0,
      uraDora: [],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    expect(json.log[0][1]).toEqual(scores);
    expect(json.log[0][4][0]).toBe(tileToTenhouNumber(t));
    expect(json.log[0][16][0]).toBe('和了');
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('sets rule.disp to a fixed value', () => {
    const t = makeTile(5);
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(t));
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: t,
      kyoku: 1,
    };
    const log: LogEntry[] = [
      { type: 'startRound', kyoku: 1 },
      { type: 'draw', player: 0, tile: t },
      { type: 'tsumo', player: 0, tile: t },
    ];
    const end: RoundEndInfo = {
      result: '和了',
      diffs: [0, 0, 0, 0],
      winner: 0,
      loser: 0,
      uraDora: [],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    expect(json.rule.disp).toBe('四南喰');
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('uses discard tile for riichi event', () => {
    const drawTile = makeTile(32);
    const discardTile = makeTile(31);
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(0).map((_, i) => makeTile(i + 2)));
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: drawTile,
      kyoku: 1,
    };
    const log: LogEntry[] = [
      { type: 'startRound', kyoku: 1 },
      { type: 'draw', player: 0, tile: drawTile },
      { type: 'riichi', player: 0, tile: discardTile },
      { type: 'discard', player: 0, tile: discardTile },
      { type: 'tsumo', player: 0, tile: drawTile },
    ];
    const end: RoundEndInfo = {
      result: '和了',
      diffs: [0, 0, 0, 0],
      winner: 0,
      loser: 0,
      uraDora: [],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    const dahai = json.log[0][6];
    expect(dahai).toEqual(['r' + tileToTenhouNumber(discardTile)]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('encodes tsumogiri as 60', () => {
    const t = makeTile(42);
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(t));
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: t,
      kyoku: 1,
    };
    const log: LogEntry[] = [
      { type: 'startRound', kyoku: 1 },
      { type: 'draw', player: 0, tile: t },
      { type: 'discard', player: 0, tile: t },
      { type: 'tsumo', player: 0, tile: t },
    ];
    const end: RoundEndInfo = {
      result: '和了',
      diffs: [0, 0, 0, 0],
      winner: 0,
      loser: 0,
      uraDora: [],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    expect(json.log[0][6]).toEqual([60]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });
});
