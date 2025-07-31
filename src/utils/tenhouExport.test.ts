import { describe, it, expect, afterEach } from 'vitest';
import {
  exportTenhouLog,
  tileToTenhouNumber,
  tenhouJsonToUrl,
  RoundEndInfo,
} from './tenhouExport';
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
      han: 1,
      fu: 30,
      seatWind: 1,
      winType: 'tsumo',
      yakuList: [{ name: '立直', han: 1 }],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    expect(json.log[0][1]).toEqual(scores);
    expect(json.log[0][4][0]).toBe(tileToTenhouNumber(t));
    expect(json.log[0][16][0]).toBe('和了');
    expect(json.log[0][16][2][3]).toBe('30符1飜500点∀');
    expect(json.log[0][16][2][4]).toBe('立直(1飜)');
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('translates yaku names to Tenhou style', () => {
    const t = makeTile(2);
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
      { type: 'tsumo', player: 0, tile: t },
    ];
    const end: RoundEndInfo = {
      result: '和了',
      diffs: [0, 0, 0, 0],
      winner: 0,
      loser: 0,
      uraDora: [],
      han: 2,
      fu: 30,
      seatWind: 1,
      winType: 'tsumo',
      yakuList: [
        { name: 'Riichi', han: 1 },
        { name: 'Menzen Tsumo', han: 1 },
      ],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    const yakuStrings = json.log[0][16][2].slice(4);
    expect(yakuStrings).toEqual(['立直(1飜)', '門前清自摸和(1飜)']);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('includes yakuhai detail text', () => {
    const t = makeTile(3);
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
      { type: 'tsumo', player: 0, tile: t },
    ];
    const end: RoundEndInfo = {
      result: '和了',
      diffs: [0, 0, 0, 0],
      winner: 0,
      loser: 0,
      uraDora: [],
      han: 1,
      fu: 30,
      seatWind: 1,
      winType: 'tsumo',
      yakuList: [{ name: 'Yakuhai', han: 1, detail: '白' }],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    const yakuStrings = json.log[0][16][2].slice(4);
    expect(yakuStrings).toEqual(['役牌 白(1飜)']);
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

  it('handles delayed tsumogiri discard', () => {
    const t = makeTile(88);
    const other = makeTile(99);
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
      { type: 'draw', player: 1, tile: other },
      { type: 'discard', player: 1, tile: other },
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

  it('avoids duplicate take entry for tsumo tile', () => {
    const t = makeTile(77);
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
    expect(json.log[0][5]).toEqual([tileToTenhouNumber(t)]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('does not record ron tile in take list', () => {
    const t = makeTile(88);
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
      { type: 'draw', player: 1, tile: t },
      { type: 'discard', player: 1, tile: t },
      { type: 'ron', player: 2, tile: t, from: 1 },
    ];
    const end: RoundEndInfo = {
      result: '和了',
      diffs: [0, 0, 0, 0],
      winner: 2,
      loser: 1,
      uraDora: [],
    };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end);
    expect(json.log[0][11]).toEqual([]); // player 2 take list
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('outputs 13-tile starting hand for dealer', () => {
    const extra = makeTile(99);
    const base = makeTile(1);
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(base));
    hands[0].push(extra); // dealer has 14 tiles
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: base,
      kyoku: 1,
    };
    const log: LogEntry[] = [
      { type: 'startRound', kyoku: 1 },
      { type: 'draw', player: 0, tile: extra },
      { type: 'tsumo', player: 0, tile: base },
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
    expect(json.log[0][4]).toHaveLength(13);
    expect(json.log[0][5][0]).toBe(tileToTenhouNumber(extra));
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('encodes chi meld and keeps discard tile', () => {
    const t7: Tile = { suit: 'pin', rank: 7, id: 't7' };
    const t8: Tile = { suit: 'pin', rank: 8, id: 't8' };
    const t9: Tile = { suit: 'pin', rank: 9, id: 't9' };
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(t7));
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: t7,
      kyoku: 1,
    };
    const log: LogEntry[] = [
      { type: 'startRound', kyoku: 1 },
      { type: 'draw', player: 1, tile: t8 },
      { type: 'discard', player: 1, tile: t7 },
      { type: 'meld', player: 2, tiles: [t8, t9, t7], meldType: 'chi', from: 1 },
      { type: 'tsumo', player: 0, tile: t7 },
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
    expect(json.log[0][11]).toEqual(['c272829']);
    expect(json.log[0][9]).toEqual([tileToTenhouNumber(t7)]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('encodes kakan as discard and rinshan draw', () => {
    const base: Tile = { suit: 'man', rank: 1, id: 'b' };
    const rinshan: Tile = { suit: 'man', rank: 2, id: 'r' };
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(base));
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: base,
      kyoku: 1,
    };
    const log: LogEntry[] = [
      { type: 'startRound', kyoku: 1 },
      { type: 'draw', player: 0, tile: base },
      { type: 'meld', player: 0, tiles: [base, base, base, base], meldType: 'kan', from: 1, kanType: 'kakan' },
      { type: 'draw', player: 0, tile: rinshan },
      { type: 'tsumo', player: 0, tile: rinshan },
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
    const code = tileToTenhouNumber(base);
  const expected = `${code}${code}k${code}${code}`;
  expect(json.log[0][6]).toEqual([expected]);
  expect(json.log[0][5]).toEqual([code, tileToTenhouNumber(rinshan)]);
  writeFileSync('tmp.tenhou.json', JSON.stringify(json));
  execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('includes kan dora indicators', () => {
    const base = makeTile(1);
    const kanDora = makeTile(2);
    const start: RoundStartInfo = {
      hands: Array(4)
        .fill(0)
        .map(() => Array(13).fill(base)),
      dealer: 0,
      doraIndicator: base,
      kyoku: 1,
    };
    const log: LogEntry[] = [{ type: 'startRound', kyoku: 1 }];
    const end: RoundEndInfo = { result: '流局', diffs: [0, 0, 0, 0] };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end, [base, kanDora]);
    expect(json.log[0][2]).toEqual([
      tileToTenhouNumber(base),
      tileToTenhouNumber(kanDora),
    ]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
  execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('records honba and kyotaku counts', () => {
    const t = makeTile(1);
    const start: RoundStartInfo = {
      hands: Array(4)
        .fill(0)
        .map(() => Array(13).fill(t)),
      dealer: 0,
      doraIndicator: t,
      kyoku: 1,
    };
    const log: LogEntry[] = [{ type: 'startRound', kyoku: 1 }];
    const end: RoundEndInfo = { result: '流局', diffs: [0, 0, 0, 0] };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end, [t], 0, 2, 1);
    expect(json.log[0][0]).toEqual([0, 2, 1]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('uses kyotaku value from round start even after riichi', () => {
    const t = makeTile(1);
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
      { type: 'draw', player: 1, tile: t },
      { type: 'riichi', player: 1, tile: t },
      { type: 'discard', player: 1, tile: t },
    ];
    const end: RoundEndInfo = { result: '流局', diffs: [0, 0, 0, 0] };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end, [t], 0, 0, 0);
    expect(json.log[0][0]).toEqual([0, 0, 0]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('carries kyotaku over between rounds', () => {
    const t = makeTile(2);
    const hands = Array(4)
      .fill(0)
      .map(() => Array(13).fill(t));
    const start: RoundStartInfo = {
      hands,
      dealer: 0,
      doraIndicator: t,
      kyoku: 2,
    };
    const log: LogEntry[] = [{ type: 'startRound', kyoku: 2 }];
    const end: RoundEndInfo = { result: '流局', diffs: [0, 0, 0, 0] };
    const scores = [25000, 25000, 25000, 25000];
    const json = exportTenhouLog(start, log, scores, end, [t], 0, 1, 1);
    expect(json.log[0][0]).toEqual([1, 1, 1]);
    writeFileSync('tmp.tenhou.json', JSON.stringify(json));
    execSync('python devutils/tenhou-validator.py tmp.tenhou.json');
  });

  it('encodes red tiles with special numbers', () => {
    const red: Tile = { suit: 'pin', rank: 5, id: 'r1', red: true };
    expect(tileToTenhouNumber(red)).toBe(52);
  });

  it('creates tenhou replay url', () => {
    const json = { title: ['',''], name: ['A','B','C','D'], rule: { disp: '四南喰', aka: 0 }, log: [] };
    const url = tenhouJsonToUrl(json);
    expect(url).toBe(
      'https://tenhou.net/6/#json=' +
        encodeURIComponent(JSON.stringify(json)) +
        '&ts=0',
    );
  });
});
