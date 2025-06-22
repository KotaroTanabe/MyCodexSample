import React, { useState, useEffect, useRef } from 'react';
import { Tile, PlayerState } from '../types/mahjong';
import { generateTileWall, drawDoraIndicator } from './TileWall';
import { createInitialPlayerState, drawTiles, discardTile, claimMeld, declareRiichi, isTenpaiAfterDiscard } from './Player';
import { MeldType } from '../types/mahjong';
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
  const [selfKanOptions, setSelfKanOptions] = useState<Tile[][] | null>(null);
  const [chiTileOptions, setChiTileOptions] = useState<Tile[][] | null>(null);
  const [riichiPool, setRiichiPool] = useState(0);
  const [pendingRiichi, setPendingRiichi] = useState<number | null>(null);

  const turnRef = useRef(turn);
  const playersRef = useRef<PlayerState[]>(players);
  const wallRef = useRef<Tile[]>(wall);
  const deadWallRef = useRef<Tile[]>(deadWall);
  const kyokuRef = useRef(kyoku);
  const riichiPoolRef = useRef(riichiPool);

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
    playersRef.current = players;
    if (players.length > 0) {
      setShanten(calcShanten(players[0].hand, players[0].melds.length));
    }
  }, [players]);

  // ラウンド初期化関数
  const startRound = (resetKyoku: boolean) => {
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
    setRoundResult(null);
    if (resetKyoku) {
      setRiichiPool(0);
    }
    setMessage(
      `配牌が完了しました。${playerIsAI ? 'AIのターンです。' : 'あなたのターンです。'}`,
    );
    setPhase('playing');
  };

  // 初期化
  useEffect(() => {
    if (phase === 'init') {
      setKyoku(1);
      startRound(true);
    }
  }, [phase]);

  const maxKyoku = maxKyokuForLength(gameLength);
  const nextKyoku = () => {
    const next = kyokuRef.current + 1;
    if (next > maxKyoku) {
      setPhase('end');
    } else {
      setKyoku(next);
      startRound(false);
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
    if (result.wall.length === 0) {
      handleWallExhaustion();
      return;
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
      const fullHand = [
        ...p[currentIndex].hand,
        ...p[currentIndex].melds.flatMap(m => m.tiles),
      ];
      const seatWind = p[currentIndex].seat + 1;
      const roundWind = kyokuRef.current <= 4 ? 1 : 2;
      const yaku = detectYaku(fullHand, p[currentIndex].melds, {
        isTsumo: true,
        isRiichi: p[currentIndex].isRiichi,
        seatWind,
        roundWind,
      });
      const { han, fu, points } = calculateScore(
        p[currentIndex].hand,
        p[currentIndex].melds,
        yaku,
        dora,
        { seatWind, roundWind, winType: 'tsumo' },
      );
      let newPlayers = payoutTsumo(p, currentIndex, points);
      if (riichiPoolRef.current > 0) {
        newPlayers = newPlayers.map((pl, idx) =>
          idx === currentIndex ? { ...pl, score: pl.score + riichiPoolRef.current * 1000 } : pl,
        );
        setRiichiPool(0);
        riichiPoolRef.current = 0;
      }
      setPlayers(newPlayers);
      playersRef.current = newPlayers;
      setMessage(
        `${p[currentIndex].name} の和了！ ${yaku.map(y => y.name).join(', ')} ${han}翻 ${fu}符 ${points}点`,
      );
      setTimeout(nextKyoku, 500);
      return;
    }
    setMessage(`${p[currentIndex].name} がツモりました。`);
  };

  // 捨て牌処理（自分／AI共通）
  const handleDiscard = (tileId: string) => {
    const idx = turnRef.current;
    let p = [...playersRef.current];
    const tile = p[idx].hand.find(t => t.id === tileId);
    if (!tile) return;
    if (pendingRiichi === idx && !isTenpaiAfterDiscard(p[idx], tileId)) {
      setMessage('その牌ではリーチできません');
      return;
    }
    setSelfKanOptions(null);
    setChiTileOptions(null);
    const result = incrementDiscardCount(discardCounts, tile);
    setDiscardCounts(result.record);
    setLastDiscard({ tile, player: idx, isShonpai: result.isShonpai });
    p[idx] = discardTile(p[idx], tileId);
    setPlayers(p);
    playersRef.current = p;
    const winIdx = findRonWinner(p, idx, tile);
    if (winIdx !== null) {
      const winningPlayer = p[winIdx];
      const fullHand = [
        ...winningPlayer.hand,
        ...winningPlayer.melds.flatMap(m => m.tiles),
        tile,
      ];
      const seatWind = winningPlayer.seat + 1;
      const roundWind = kyokuRef.current <= 4 ? 1 : 2;
      const yaku = detectYaku(fullHand, winningPlayer.melds, {
        isTsumo: false,
        isRiichi: winningPlayer.isRiichi,
        seatWind,
        roundWind,
      });
      const { han, fu, points } = calculateScore(
        [...winningPlayer.hand, tile],
        winningPlayer.melds,
        yaku,
        [],
        { seatWind, roundWind, winType: 'ron' },
      );
      let updated = payoutRon(p, winIdx, idx, points);
      if (riichiPoolRef.current > 0) {
        updated = updated.map((pl, i) =>
          i === winIdx ? { ...pl, score: pl.score + riichiPoolRef.current * 1000 } : pl,
        );
        setRiichiPool(0);
        riichiPoolRef.current = 0;
      }
      setPlayers(updated);
      playersRef.current = updated;
      setMessage(
        `${winningPlayer.name} のロン！ ${yaku
          .map(y => y.name)
          .join(', ')} ${han}翻 ${fu}符 ${points}点`,
      );
      setTimeout(nextKyoku, 500);
      return;
    }
    if (pendingRiichi === idx) {
      p[idx] = { ...p[idx], score: p[idx].score - 1000 };
      setRiichiPool(prev => prev + 1);
      setPendingRiichi(null);
      setPlayers(p);
      playersRef.current = p;
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
    p[discarder] = {
      ...p[discarder],
      discard: p[discarder].discard.map(t =>
        t.id === lastDiscard.tile.id ? { ...t, called: true } : t,
      ),
    };
    p[caller] = claimMeld(
      p[caller],
      [...meldTiles, lastDiscard.tile],
      action,
      discarder,
      lastDiscard.tile.id,
    );
    setPlayers(p);
    playersRef.current = p;

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
    let p = [...playersRef.current];
    p[caller] = claimMeld(p[caller], tiles, 'kan', caller, tiles[0].id);
    setPlayers(p);
    playersRef.current = p;

    const doraResult = drawDoraIndicator(deadWallRef.current, 1);
    setDora(prev => [...prev, ...doraResult.dora]);
    setDeadWall(doraResult.wall);
    deadWallRef.current = doraResult.wall;
    turnRef.current = caller;
    drawForCurrentPlayer();
  };

  const performAICall = (caller: number, action: MeldType) => {
    if (!lastDiscard) return;
    const discarder = lastDiscard.player;
    let p = [...playersRef.current];
    const meldTiles = selectMeldTiles(p[caller], lastDiscard.tile, action);
    if (!meldTiles) return;
    p[discarder] = {
      ...p[discarder],
      discard: p[discarder].discard.map(t =>
        t.id === lastDiscard.tile.id ? { ...t, called: true } : t,
      ),
    };
    p[caller] = claimMeld(
      p[caller],
      [...meldTiles, lastDiscard.tile],
      action,
      discarder,
      lastDiscard.tile.id,
    );
    setPlayers(p);
    playersRef.current = p;
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

  const handleRiichi = () => {
    let p = [...playersRef.current];
    p[0] = declareRiichi(p[0]);
    setPlayers(p);
    playersRef.current = p;
    setPendingRiichi(0);
    setMessage('リーチする牌を選んでください');
  };

  const handleSelfKan = (tiles: Tile[]) => {
    setSelfKanOptions(null);
    performSelfKan(0, tiles);
  };

  const handleChiSelect = (tiles: Tile[]) => {
    if (!lastDiscard) return;
    const caller = 0;
    const discarder = lastDiscard.player;
    let p = [...playersRef.current];
    p[discarder] = {
      ...p[discarder],
      discard: p[discarder].discard.map(t =>
        t.id === lastDiscard.tile.id ? { ...t, called: true } : t,
      ),
    };
    p[caller] = claimMeld(
      p[caller],
      [...tiles, lastDiscard.tile],
      'chi',
      discarder,
      lastDiscard.tile.id,
    );
    setPlayers(p);
    playersRef.current = p;
    setCallOptions(null);
    setLastDiscard(null);
    setChiTileOptions(null);
    setSelfKanOptions(null);
    setTurn(caller);
  };

  // ターン進行
  const nextTurn = () => {
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

  // UI
  return (
    <div className="p-2 flex flex-col gap-4">
      <UIBoard
        players={players}
        dora={dora}
        kyoku={kyoku}
        wallCount={wall.length}
        kyotaku={riichiPool}
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
        playerIsAI={playerIsAI}
        onToggleAI={togglePlayerAI}
      />
      <div className="mt-2">{message}</div>
      {roundResult && (
        <RoundResultModal
          results={roundResult.results}
          nextLabel={kyokuRef.current >= maxKyoku ? '結果発表へ' : undefined}
          onNext={() => {
            setRoundResult(null);
            nextKyoku();
          }}
        />
      )}
      {phase === 'end' && (
        <FinalResultModal players={players} onReplay={handleRestart} />
      )}
    </div>
  );
};
