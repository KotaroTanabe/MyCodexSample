import React, { useState, useEffect, useRef } from 'react';
import { Tile, PlayerState, LogEntry, MeldType } from '../types/mahjong';
import { generateTileWall, drawDoraIndicator } from './TileWall';
import {
  createInitialPlayerState,
  drawTiles,
  discardTile,
  claimMeld,
  declareRiichi,
  clearIppatsu,
  isTenpaiAfterDiscard,
  canDiscardTile,
  canCallMeld,
  removeDiscardTile,
} from './Player';
import {
  selectMeldTiles,
  getValidCallOptions,
  getSelfKanOptions,
  getChiOptions,
} from '../utils/meld';
import { filterChiOptions } from '../utils/table';
import { isWinningHand, detectYaku } from '../score/yaku';
import { calculateScore } from '../score/score';
import { UIBoard } from './UIBoard';
import { calcShanten } from '../utils/shanten';
import { incrementDiscardCount, findRonWinner } from './DiscardUtil';
import { chooseAICallOption } from '../utils/ai';
import { payoutTsumo, payoutRon, payoutNoten } from '../utils/payout';
import { RoundResultModal, RoundResult } from './RoundResultModal';
import { FinalResultModal } from './FinalResultModal';
import { WinResultModal, WinResult } from './WinResultModal';
import { exportLqRecord } from '../utils/paifuExport';
import type { RecordHead } from '../types/jantama';

const DEAD_WALL_SIZE = 14;

export type GameLength = 'east1' | 'tonpu' | 'tonnan';
export const maxKyokuForLength = (len: GameLength): number =>
  len === 'tonnan' ? 8 : len === 'tonpu' ? 4 : 1;

type GamePhase = 'init' | 'playing' | 'end';

interface Props {
  gameLength: GameLength;
}

export const GameController: React.FC<Props> = ({ gameLength }) => {
  // ゲーム状態
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [dora, setDora] = useState<Tile[]>([]);
  const [deadWall, setDeadWall] = useState<Tile[]>([]);
  const [playerIsAI, setPlayerIsAI] = useState(false);
  const [turn, setTurn] = useState(0); // 0:自分, 1-3:AI
  const [phase, setPhase] = useState<GamePhase>('init');
  const [message, setMessage] = useState<string>('');
  const [kyoku, setKyoku] = useState<number>(1); // 東1局など
  const [shanten, setShanten] = useState<{ standard: number; chiitoi: number; kokushi: number }>({ standard: 8, chiitoi: 8, kokushi: 13 });
  const [discardCounts, setDiscardCounts] = useState<Record<string, number>>({});
  const [lastDiscard, setLastDiscard] = useState<{ tile: Tile; player: number; isShonpai: boolean } | null>(null);
  const [callOptions, setCallOptions] = useState<(MeldType | 'pass')[] | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [selfKanOptions, setSelfKanOptions] = useState<Tile[][] | null>(null);
  const [chiTileOptions, setChiTileOptions] = useState<Tile[][] | null>(null);
  const [riichiPool, setRiichiPool] = useState(0);
  const [honba, setHonba] = useState(0);
  const [pendingRiichi, setPendingRiichi] = useState<number | null>(null);
  const [tsumoOption, setTsumoOption] = useState(false);
  const [ronCandidate, setRonCandidate] = useState<{ tile: Tile; from: number } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const turnRef = useRef(turn);
  const playersRef = useRef<PlayerState[]>(players);
  const wallRef = useRef<Tile[]>(wall);
  const deadWallRef = useRef<Tile[]>(deadWall);
  const kyokuRef = useRef(kyoku);
  const riichiPoolRef = useRef(riichiPool);
  const honbaRef = useRef(honba);
  const logRef = useRef<LogEntry[]>(log);
  const kanDrawRef = useRef<number | null>(null);
  const drawInfoRef = useRef<Record<number, { rinshan: boolean; last: boolean }>>({});
  const recordHeadRef = useRef<RecordHead>({
    startTime: 0,
    endTime: 0,
    rule: { gameLength },
    players: [],
  });

  const togglePlayerAI = () => {
    setPlayerIsAI(prev => {
      const next = !prev;
      setPlayers(ps =>
        ps.map((pl, idx) => (idx === 0 ? { ...pl, isAI: next } : pl)),
      );
      playersRef.current = playersRef.current.map((pl, idx) =>
        idx === 0 ? { ...pl, isAI: next } : pl,
      );
      if (next && turnRef.current === 0) {
        setTimeout(() => {
          const tile = playersRef.current[0].hand[0];
          handleDiscard(tile.id);
        }, 500);
      }
      return next;
    });
  };

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    wallRef.current = wall;
  }, [wall]);

  useEffect(() => {
    deadWallRef.current = deadWall;
  }, [deadWall]);

  useEffect(() => {
    kyokuRef.current = kyoku;
  }, [kyoku]);

  useEffect(() => {
    riichiPoolRef.current = riichiPool;
  }, [riichiPool]);

  useEffect(() => {
    honbaRef.current = honba;
  }, [honba]);

  useEffect(() => {
    logRef.current = log;
  }, [log]);

  useEffect(() => {
    playersRef.current = players;
    if (players.length > 0) {
      setShanten(calcShanten(players[0].hand, players[0].melds.length));
    }
  }, [players]);

  // ラウンド初期化関数
  const startRound = (resetKyoku: boolean, roundNumber: number = kyokuRef.current) => {
    let wallStack = generateTileWall();
    let wanpai = wallStack.slice(0, DEAD_WALL_SIZE);
    wallStack = wallStack.slice(DEAD_WALL_SIZE);
    const doraResult = drawDoraIndicator(wanpai, 1);
    const doraTiles = doraResult.dora;
    wanpai = doraResult.wall;
    let p: PlayerState[];
    if (resetKyoku) {
      p = [
        createInitialPlayerState('あなた', playerIsAI, 0),
        createInitialPlayerState('AI下家', true, 1),
        createInitialPlayerState('AI対面', true, 2),
        createInitialPlayerState('AI上家', true, 3),
      ];
    } else {
      p = playersRef.current.map(pl => ({
        ...pl,
        hand: [],
        discard: [],
        melds: [],
        drawnTile: null,
        isRiichi: false,
        isAI: pl.seat === 0 ? playerIsAI : pl.isAI,
      }));
    }
    for (let i = 0; i < 4; i++) {
      const result = drawTiles(p[i], wallStack, 13);
      p[i] = result.player;
      wallStack = result.wall;
    }
    // 親は1枚多く持つ
    const extra = drawTiles(p[0], wallStack, 1);
    p[0] = extra.player;
    wallStack = extra.wall;
    setPlayers(p);
    playersRef.current = p;
    setWall(wallStack);
    wallRef.current = wallStack;
    setDeadWall(wanpai);
    deadWallRef.current = wanpai;
    setDora(doraTiles);
    setTurn(0);
    setDiscardCounts({});
    setLastDiscard(null);
    setPendingRiichi(null);
    setTsumoOption(false);
    setRonCandidate(null);
    setRoundResult(null);
    setWinResult(null);
    if (resetKyoku) {
      setRiichiPool(0);
      setHonba(0);
      honbaRef.current = 0;
      recordHeadRef.current.startTime = Date.now();
      recordHeadRef.current.endTime = 0;
      recordHeadRef.current.rule = { gameLength };
      recordHeadRef.current.players = playersRef.current.map(p => ({
        name: p.name,
        seat: p.seat,
        isAI: p.isAI,
      }));
    }
    setMessage(
      `配牌が完了しました。${playerIsAI ? 'AIのターンです。' : 'あなたのターンです。'}`,
    );
    setLog([{ type: 'startRound', kyoku: roundNumber }]);
    logRef.current = [{ type: 'startRound', kyoku: roundNumber }];
    kanDrawRef.current = null;
    drawInfoRef.current = {};
    setPhase('playing');
  };

  // 初期化
  useEffect(() => {
    if (phase === 'init') {
      setKyoku(1);
      startRound(true, 1);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'end') {
      recordHeadRef.current.endTime = Date.now();
    }
  }, [phase]);

  const maxKyoku = maxKyokuForLength(gameLength);
  const nextKyoku = (dealerContinues = false) => {
    if (dealerContinues) {
      setHonba(h => h + 1);
      honbaRef.current += 1;
      startRound(false, kyokuRef.current);
      return;
    }
    setHonba(0);
    honbaRef.current = 0;
    const next = kyokuRef.current + 1;
    if (next > maxKyoku) {
      setPhase('end');
    } else {
      setKyoku(next);
      startRound(false, next);
    }
  };

  const handleWallExhaustion = () => {
    const tenpai = playersRef.current.map(p => {
      const s = calcShanten(p.hand, p.melds.length);
      return Math.min(s.standard, s.chiitoi, s.kokushi) === 0;
    });
    const { players: updated, changes } = payoutNoten(playersRef.current, tenpai);
    setPlayers(updated);
    playersRef.current = updated;
    const results: RoundResult = {
      results: updated.map((p, idx) => ({
        name: p.name,
        score: p.score,
        change: changes[idx],
        isTenpai: tenpai[idx],
      })),
    };
    setRoundResult(results);
    setMessage('牌山が尽きました。流局です。');
  };

  // ツモ処理
  const drawForCurrentPlayer = () => {
    if (wallRef.current.length === 0) {
      handleWallExhaustion();
      return;
    }
    const currentIndex = turnRef.current;
    let p = [...playersRef.current];
    const result = drawTiles(p[currentIndex], wallRef.current, 1);
    p[currentIndex] = result.player;
    setPlayers(p);
    playersRef.current = p;
    setWall(result.wall);
    wallRef.current = result.wall;
    const rinshan = kanDrawRef.current === currentIndex;
    if (rinshan) kanDrawRef.current = null;
    const last = result.wall.length === 0;
    drawInfoRef.current[currentIndex] = { rinshan, last };
    setLog(prev => [...prev, { type: 'draw', player: currentIndex, tile: result.player.drawnTile as Tile }]);
    logRef.current = [...logRef.current, { type: 'draw', player: currentIndex, tile: result.player.drawnTile as Tile }];
    if (last) {
      // postpone exhaustion until after possible win/discard
    }
    if (!playersRef.current[currentIndex].isAI) {
      const opts = getSelfKanOptions(playersRef.current[currentIndex]);
      setSelfKanOptions(opts.length > 0 ? opts : null);
    } else {
      const opts = getSelfKanOptions(playersRef.current[currentIndex]);
      if (opts.length > 0) {
        performSelfKan(currentIndex, opts[0]);
        return;
      }
    }
    if (isWinningHand([...p[currentIndex].hand, ...p[currentIndex].melds.flatMap(m => m.tiles)])) {
      if (p[currentIndex].isAI || currentIndex !== 0) {
        performTsumo(currentIndex);
        return;
      } else {
        setTsumoOption(true);
        return;
      }
    }
    if (last) {
      handleWallExhaustion();
      return;
    }

  };

  // 捨て牌処理（自分／AI共通）
  const handleDiscard = (tileId: string) => {
    const idx = turnRef.current;
    let p = [...playersRef.current];
    const tile = p[idx].hand.find(t => t.id === tileId);
    if (!tile) return;
    if (pendingRiichi !== idx && !canDiscardTile(p[idx], tileId)) {
      setMessage('リーチ後はツモ牌しか切れません');
      return;
    }
    if (pendingRiichi === idx && !isTenpaiAfterDiscard(p[idx], tileId)) {
      setMessage('その牌ではリーチできません');
      return;
    }
    setSelfKanOptions(null);
    setChiTileOptions(null);
    if (pendingRiichi !== idx && p[idx].ippatsu) {
      p[idx] = clearIppatsu(p[idx]);
    }
    const result = incrementDiscardCount(discardCounts, tile);
    setDiscardCounts(result.record);
    setLastDiscard({ tile, player: idx, isShonpai: result.isShonpai });
    const isRiichi = p[idx].isRiichi;
    p[idx] = discardTile(p[idx], tileId, isRiichi);
    setPlayers(p);
    playersRef.current = p;
    setLog(prev => [...prev, { type: 'discard', player: idx, tile }]);
    logRef.current = [...logRef.current, { type: 'discard', player: idx, tile }];
    const winIdx = findRonWinner(p, idx, tile);
    if (winIdx !== null) {
      if (p[winIdx].isAI || winIdx !== 0) {
        performRon(winIdx, idx, tile);
        return;
      } else {
        setRonCandidate({ tile, from: idx });
        return;
      }
    }
    if (pendingRiichi === idx) {
      p[idx] = { ...p[idx], score: p[idx].score - 1000, ippatsu: true };
      setRiichiPool(prev => prev + 1);
      setPendingRiichi(null);
      setPlayers(p);
      playersRef.current = p;
    }
    const info = drawInfoRef.current[idx];
    drawInfoRef.current[idx] = { rinshan: false, last: false };
    if (info?.last) {
      handleWallExhaustion();
      return;
    }
    if (idx !== 0 && !playersRef.current[0].isAI) {
      let options = getValidCallOptions(p[0], tile);
      options = filterChiOptions(
        options,
        playersRef.current[0].seat,
        playersRef.current[idx].seat,
      );
      const hasAction = options.some(o => o !== 'pass');
      if (!hasAction) {
        setCallOptions(null);
        setLastDiscard(null);
        nextTurn();
      } else {
        setCallOptions(options);
      }
    } else {
      nextTurn();
    }
  };


const handleCallAction = (action: MeldType | 'pass') => {
  if (!lastDiscard) return;
  if (!canCallMeld(playersRef.current[0])) {
    setCallOptions(null);
    setLastDiscard(null);
    return;
  }
  if (action === 'pass') {
    setCallOptions(null);
    setLastDiscard(null);
    setSelfKanOptions(null);
    setChiTileOptions(null);
    nextTurn();
    return;
  }
  const caller = 0;
  const discarder = lastDiscard.player;
  let p = [...playersRef.current];
  p = p.map(pl => clearIppatsu(pl));
  if (action === 'chi') {
    const options = getChiOptions(p[caller], lastDiscard.tile);
    if (options.length > 1 && !chiTileOptions) {
      setChiTileOptions(options);
      setCallOptions(['pass']);
      return;
    }
  }
  const meldTiles = selectMeldTiles(p[caller], lastDiscard.tile, action);
  if (!meldTiles) {
    setCallOptions(null);
    setLastDiscard(null);
    nextTurn();
    return;
    }
  p[discarder] = removeDiscardTile(p[discarder], lastDiscard.tile.id);
  p[caller] = claimMeld(
    p[caller],
    [...meldTiles, lastDiscard.tile],
    action,
    discarder,
    lastDiscard.tile.id,
  );
  setPlayers(p);
  playersRef.current = p;
  setLog(prev => [
    ...prev,
    {
      type: 'meld',
      player: caller,
      tiles: [...meldTiles, lastDiscard.tile],
      meldType: action,
      from: discarder,
    },
  ]);
  logRef.current = [
    ...logRef.current,
    {
      type: 'meld',
      player: caller,
      tiles: [...meldTiles, lastDiscard.tile],
      meldType: action,
      from: discarder,
    },
  ];

  if (action === 'kan') {
    kanDrawRef.current = caller;
  }

  if (action === 'kan') {
    const doraResult = drawDoraIndicator(deadWallRef.current, 1);
    setDora(prev => [...prev, ...doraResult.dora]);
    setDeadWall(doraResult.wall);
    deadWallRef.current = doraResult.wall;
      turnRef.current = caller;
      drawForCurrentPlayer();
    }

  setCallOptions(null);
  setLastDiscard(null);
  setSelfKanOptions(null);
  setChiTileOptions(null);
  setTurn(caller);
};

  const performSelfKan = (caller: number, tiles: Tile[]) => {
    if (!canCallMeld(playersRef.current[caller])) return;
    let p = playersRef.current.map(pl => clearIppatsu(pl));
  p = [...p];
  p[caller] = claimMeld(p[caller], tiles, 'kan', caller, tiles[0].id);
  setPlayers(p);
  playersRef.current = p;
  setLog(prev => [
    ...prev,
    { type: 'meld', player: caller, tiles, meldType: 'kan', from: caller },
  ]);
  logRef.current = [
    ...logRef.current,
    { type: 'meld', player: caller, tiles, meldType: 'kan', from: caller },
  ];

  kanDrawRef.current = caller;

  const doraResult = drawDoraIndicator(deadWallRef.current, 1);
    setDora(prev => [...prev, ...doraResult.dora]);
    setDeadWall(doraResult.wall);
    deadWallRef.current = doraResult.wall;
    turnRef.current = caller;
    drawForCurrentPlayer();
  };

  const performAICall = (caller: number, action: MeldType) => {
    if (!lastDiscard) return;
    if (!canCallMeld(playersRef.current[caller])) return;
    const discarder = lastDiscard.player;
    let p = playersRef.current.map(pl => clearIppatsu(pl));
    p = [...p];
    const meldTiles = selectMeldTiles(p[caller], lastDiscard.tile, action);
    if (!meldTiles) return;
    p[discarder] = removeDiscardTile(p[discarder], lastDiscard.tile.id);
    p[caller] = claimMeld(
      p[caller],
      [...meldTiles, lastDiscard.tile],
      action,
      discarder,
      lastDiscard.tile.id,
    );
    setPlayers(p);
    playersRef.current = p;
    setLog(prev => [
      ...prev,
      {
        type: 'meld',
        player: caller,
        tiles: [...meldTiles, lastDiscard.tile],
        meldType: action,
        from: discarder,
      },
    ]);
    logRef.current = [
      ...logRef.current,
      {
        type: 'meld',
        player: caller,
        tiles: [...meldTiles, lastDiscard.tile],
        meldType: action,
        from: discarder,
      },
    ];
    setMessage(`${p[caller].name} が ${action}しました。`);

    if (action === 'kan') {
      const doraResult = drawDoraIndicator(deadWallRef.current, 1);
      setDora(prev => [...prev, ...doraResult.dora]);
      setDeadWall(doraResult.wall);
      deadWallRef.current = doraResult.wall;
      turnRef.current = caller;
      drawForCurrentPlayer();
    }

    setLastDiscard(null);
    setTurn(caller);
    setTimeout(() => {
      const tile = playersRef.current[caller].hand[0];
      handleDiscard(tile.id);
    }, 500);
  };

  const performTsumo = (idx: number) => {
    const p = [...playersRef.current];
    let ura: Tile[] = [];
    if (p[idx].isRiichi) {
      const uraRes = drawDoraIndicator(deadWallRef.current, dora.length);
      ura = uraRes.dora;
      setDeadWall(uraRes.wall);
      deadWallRef.current = uraRes.wall;
    }
    const fullHand = [...p[idx].hand, ...p[idx].melds.flatMap(m => m.tiles)];
    const info = drawInfoRef.current[idx];
    drawInfoRef.current[idx] = { rinshan: false, last: false };
    const seatWind = p[idx].seat + 1;
    const roundWind = kyokuRef.current <= 4 ? 1 : 2;
    const yaku = detectYaku(fullHand, p[idx].melds, {
      isTsumo: true,
      isRiichi: p[idx].isRiichi,
      doubleRiichi: p[idx].doubleRiichi,
      ippatsu: p[idx].ippatsu,
      rinshan: info?.rinshan,
      haitei: info?.last,
      seatWind,
      roundWind,
      uraDoraIndicators: ura,
    });
    const { han, fu, points } = calculateScore(
      p[idx].hand,
      p[idx].melds,
      yaku,
      dora,
      { seatWind, roundWind, winType: 'tsumo' },
    );
    let newPlayers = payoutTsumo(p, idx, points, honbaRef.current).map((pl, i) =>
      i === idx ? { ...pl, ippatsu: false } : pl,
    );
    if (riichiPoolRef.current > 0) {
      newPlayers = newPlayers.map((pl, i) =>
        i === idx ? { ...pl, score: pl.score + riichiPoolRef.current * 1000 } : pl,
      );
      setRiichiPool(0);
      riichiPoolRef.current = 0;
    }
    setPlayers(newPlayers);
    playersRef.current = newPlayers;
    setLog(prev => [...prev, { type: 'tsumo', player: idx, tile: p[idx].drawnTile as Tile }]);
    logRef.current = [...logRef.current, { type: 'tsumo', player: idx, tile: p[idx].drawnTile as Tile }];
    setMessage(`${p[idx].name} の和了！`);
    setTsumoOption(false);
    setWinResult({
      players: newPlayers,
      winner: idx,
      winType: 'tsumo',
      yaku: yaku.map(y => y.name),
      han,
      fu,
      points,
      uraDora: ura,
    });
  };

  const performRon = (winner: number, from: number, tile: Tile) => {
    const p = [...playersRef.current];
    let ura: Tile[] = [];
    if (p[winner].isRiichi) {
      const uraRes = drawDoraIndicator(deadWallRef.current, dora.length);
      ura = uraRes.dora;
      setDeadWall(uraRes.wall);
      deadWallRef.current = uraRes.wall;
    }
    const fullHand = [...p[winner].hand, ...p[winner].melds.flatMap(m => m.tiles), tile];
    const fromInfo = drawInfoRef.current[from];
    drawInfoRef.current[from] = { rinshan: false, last: false };
    const prev = logRef.current[logRef.current.length - 1];
    const chankan = prev && prev.type === 'meld' && prev.meldType === 'kan' && prev.player === from && prev.tiles.some(t => t.id === tile.id);
    const seatWind = p[winner].seat + 1;
    const roundWind = kyokuRef.current <= 4 ? 1 : 2;
    const yaku = detectYaku(fullHand, p[winner].melds, {
      isTsumo: false,
      isRiichi: p[winner].isRiichi,
      doubleRiichi: p[winner].doubleRiichi,
      ippatsu: p[winner].ippatsu,
      chankan,
      houtei: fromInfo?.last,
      seatWind,
      roundWind,
      uraDoraIndicators: ura,
    });
    const { han, fu, points } = calculateScore(
      [...p[winner].hand, tile],
      p[winner].melds,
      yaku,
      dora,
      { seatWind, roundWind, winType: 'ron' },
    );
    let updated = payoutRon(p, winner, from, points, honbaRef.current).map((pl, i) =>
      i === winner ? { ...pl, ippatsu: false } : pl,
    );
    if (riichiPoolRef.current > 0) {
      updated = updated.map((pl, i) =>
        i === winner ? { ...pl, score: pl.score + riichiPoolRef.current * 1000 } : pl,
      );
      setRiichiPool(0);
      riichiPoolRef.current = 0;
    }
    setPlayers(updated);
    playersRef.current = updated;
    setLog(prev => [...prev, { type: 'ron', player: winner, tile, from }]);
    logRef.current = [...logRef.current, { type: 'ron', player: winner, tile, from }];
    setMessage(`${p[winner].name} のロン！`);
    setWinResult({
      players: updated,
      winner,
      winType: 'ron',
      yaku: yaku.map(y => y.name),
      han,
      fu,
      points,
      uraDora: ura,
    });
  };

  const handleRiichi = () => {
    let p = [...playersRef.current];
    const isDouble = playersRef.current.every(pl => pl.discard.length === 0);
    p[0] = declareRiichi(p[0], isDouble);
    setPlayers(p);
    playersRef.current = p;
    setPendingRiichi(0);
    setMessage('リーチする牌を選んでください');
    setLog(prev => [...prev, { type: 'riichi', player: 0, tile: p[0].drawnTile as Tile }]);
    logRef.current = [...logRef.current, { type: 'riichi', player: 0, tile: p[0].drawnTile as Tile }];
  };

  const handleSelfKan = (tiles: Tile[]) => {
    if (!canCallMeld(playersRef.current[0])) return;
    setSelfKanOptions(null);
    performSelfKan(0, tiles);
  };

  const handleChiSelect = (tiles: Tile[]) => {
    if (!lastDiscard) return;
    if (!canCallMeld(playersRef.current[0])) return;
    const caller = 0;
    const discarder = lastDiscard.player;
    let p = [...playersRef.current];
  p[discarder] = removeDiscardTile(p[discarder], lastDiscard.tile.id);
  p[caller] = claimMeld(
    p[caller],
    [...tiles, lastDiscard.tile],
    'chi',
    discarder,
    lastDiscard.tile.id,
  );
  setPlayers(p);
  playersRef.current = p;
  setLog(prev => [
    ...prev,
    { type: 'meld', player: caller, tiles: [...tiles, lastDiscard.tile], meldType: 'chi', from: discarder },
  ]);
  logRef.current = [
    ...logRef.current,
    { type: 'meld', player: caller, tiles: [...tiles, lastDiscard.tile], meldType: 'chi', from: discarder },
  ];
    setCallOptions(null);
    setLastDiscard(null);
    setChiTileOptions(null);
    setSelfKanOptions(null);
    setTurn(caller);
  };

  const handleTsumo = () => {
    performTsumo(0);
  };

  const handleTsumoPass = () => {
    setTsumoOption(false);
  };

  const handleRon = () => {
    if (!ronCandidate) return;
    const { tile, from } = ronCandidate;
    setRonCandidate(null);
    performRon(0, from, tile);
  };

  const handleRonPass = () => {
    if (!ronCandidate) return;
    const { tile, from } = ronCandidate;
    setRonCandidate(null);
    if (turnRef.current !== from) return; // safety
    if (!playersRef.current[0].isAI) {
      let options = getValidCallOptions(playersRef.current[0], tile);
      options = filterChiOptions(
        options,
        playersRef.current[0].seat,
        playersRef.current[from].seat,
      );
      const hasAction = options.some(o => o !== 'pass');
      if (!hasAction) {
        setCallOptions(null);
        setLastDiscard(null);
        nextTurn();
      } else {
        setCallOptions(options);
      }
    } else {
      nextTurn();
    }
  };

  // ターン進行
  const nextTurn = () => {
    setTsumoOption(false);
    setRonCandidate(null);
    let next = (turnRef.current + 1) % 4;
    setTurn(next);
    setTimeout(() => {
      if (playersRef.current[next].isAI) {
        // Check if the AI wants to call on the previous discard
        if (lastDiscard && lastDiscard.player !== next) {
          const action = chooseAICallOption(
            playersRef.current[next],
            lastDiscard.tile,
          );
          if (action !== 'pass') {
            performAICall(next, action);
            return;
          }
          setLastDiscard(null);
        }
        drawForCurrentPlayer();
        if (wallRef.current.length === 0) return;
        // AIの打牌ロジック（現時点はランダム）
        setTimeout(() => {
          const tile = playersRef.current[next].hand[0];
          handleDiscard(tile.id);
        }, 500);
      } else {
        drawForCurrentPlayer();
      }
    }, 500);
  };

  // リセット
  const handleRestart = () => {
    setPhase('init');
  };

  const handleDownloadLog = () => {
    const record = exportLqRecord(logRef.current, recordHeadRef.current);
    const data = JSON.stringify(record, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.lq.GameDetailRecords';
    a.click();
    URL.revokeObjectURL(url);
  };

  // UI
  return (
    <div className="p-2 flex flex-col gap-4">
      <UIBoard
        players={players}
        dora={dora}
        kyoku={kyoku}
        wallCount={wall.length}
        kyotaku={riichiPool}
        honba={honba}
        onDiscard={handleDiscard}
        isMyTurn={turn === 0 && !players[0]?.isAI}
        shanten={shanten}
        lastDiscard={lastDiscard}
        callOptions={!players[0]?.isAI ? callOptions ?? undefined : undefined}
        onCallAction={!players[0]?.isAI ? handleCallAction : undefined}
        onRiichi={!players[0]?.isAI ? handleRiichi : undefined}
        selfKanOptions={!players[0]?.isAI ? selfKanOptions ?? undefined : undefined}
        onSelfKan={!players[0]?.isAI ? handleSelfKan : undefined}
        chiOptions={!players[0]?.isAI ? chiTileOptions ?? undefined : undefined}
        onChi={!players[0]?.isAI ? handleChiSelect : undefined}
        tsumoOption={!players[0]?.isAI ? tsumoOption : false}
        onTsumo={!players[0]?.isAI ? handleTsumo : undefined}
        onTsumoPass={!players[0]?.isAI ? handleTsumoPass : undefined}
        ronOption={!players[0]?.isAI ? !!ronCandidate : false}
        onRon={!players[0]?.isAI ? handleRon : undefined}
        onRonPass={!players[0]?.isAI ? handleRonPass : undefined}
        playerIsAI={playerIsAI}
        onToggleAI={togglePlayerAI}
      />
      <div className="mt-2">{message}</div>
      <button className="px-2 py-1 bg-gray-200 rounded" onClick={handleDownloadLog}>
        ログダウンロード
      </button>
      {winResult && (
        <WinResultModal
          {...winResult}
          nextLabel={kyokuRef.current >= maxKyoku ? '結果発表へ' : undefined}
          onNext={() => {
            const dealerWon = winResult.winner === 0;
            setWinResult(null);
            nextKyoku(dealerWon);
          }}
        />
      )}
      {roundResult && (
        <RoundResultModal
          results={roundResult.results}
          nextLabel={kyokuRef.current >= maxKyoku ? '結果発表へ' : undefined}
          onNext={() => {
            setRoundResult(null);
            nextKyoku(true);
          }}
        />
      )}
      {phase === 'end' && (
        <FinalResultModal players={players} onReplay={handleRestart} />
      )}
    </div>
  );
};
