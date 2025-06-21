import React, { useState, useEffect, useRef } from 'react';
import { Tile, PlayerState } from '../types/mahjong';
import { generateTileWall, drawDoraIndicator } from './TileWall';
import { createInitialPlayerState, drawTiles, discardTile, claimMeld, declareRiichi } from './Player';
import { MeldType } from '../types/mahjong';
import { selectMeldTiles, getValidCallOptions } from '../utils/meld';
import { filterChiOptions } from '../utils/table';
import { isWinningHand, detectYaku } from '../score/yaku';
import { calculateScore } from '../score/score';
import { UIBoard } from './UIBoard';
import { ScoreBoard } from './ScoreBoard';
import { HelpModal } from './HelpModal';
import { calcShanten } from '../utils/shanten';
import { incrementDiscardCount, findRonWinner } from './DiscardUtil';
import { chooseAICallOption } from '../utils/ai';
import { payoutTsumo, payoutRon } from '../utils/payout';

type GamePhase = 'init' | 'playing' | 'end';

export const GameController: React.FC = () => {
  // ゲーム状態
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [dora, setDora] = useState<Tile[]>([]);
  const [turn, setTurn] = useState(0); // 0:自分, 1-3:AI
  const [phase, setPhase] = useState<GamePhase>('init');
  const [message, setMessage] = useState<string>('');
  const [kyoku, setKyoku] = useState<number>(1); // 東1局など
  const [helpOpen, setHelpOpen] = useState(false);
  const [shanten, setShanten] = useState<{ standard: number; chiitoi: number; kokushi: number }>({ standard: 8, chiitoi: 8, kokushi: 13 });
  const [discardCounts, setDiscardCounts] = useState<Record<string, number>>({});
  const [lastDiscard, setLastDiscard] = useState<{ tile: Tile; player: number; isShonpai: boolean } | null>(null);
  const [callOptions, setCallOptions] = useState<(MeldType | 'pass')[] | null>(null);

  const turnRef = useRef(turn);
  const playersRef = useRef<PlayerState[]>(players);
  const wallRef = useRef<Tile[]>(wall);
  const kyokuRef = useRef(kyoku);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    wallRef.current = wall;
  }, [wall]);

  useEffect(() => {
    kyokuRef.current = kyoku;
  }, [kyoku]);

  useEffect(() => {
    playersRef.current = players;
    if (players.length > 0) {
      setShanten(calcShanten(players[0].hand));
    }
  }, [players]);

  // ラウンド初期化関数
  const startRound = (resetKyoku: boolean) => {
    let wallStack = generateTileWall();
    const doraResult = drawDoraIndicator(wallStack, 1);
    const doraTiles = doraResult.dora;
    wallStack = doraResult.wall;
    let p: PlayerState[];
    if (resetKyoku) {
      p = [
        createInitialPlayerState('あなた', false, 0),
        createInitialPlayerState('AI東家', true, 1),
        createInitialPlayerState('AI南家', true, 2),
        createInitialPlayerState('AI西家', true, 3),
      ];
    } else {
      p = playersRef.current.map(pl => ({
        ...pl,
        hand: [],
        discard: [],
        melds: [],
        drawnTile: null,
        isRiichi: false,
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
    setDora(doraTiles);
    setTurn(0);
    setDiscardCounts({});
    setLastDiscard(null);
    setMessage('配牌が完了しました。あなたのターンです。');
    setPhase('playing');
  };

  // 初期化
  useEffect(() => {
    if (phase === 'init') {
      setKyoku(1);
      startRound(true);
    }
  }, [phase]);

  const nextKyoku = () => {
    const next = kyokuRef.current + 1;
    if (next > 8) {
      setPhase('init');
    } else {
      setKyoku(next);
      startRound(false);
    }
  };

  // ツモ処理
  const drawForCurrentPlayer = () => {
    if (wallRef.current.length === 0) {
      setMessage('牌山が尽きました。流局です。');
      setTimeout(nextKyoku, 500);
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
    if (isWinningHand([...p[currentIndex].hand, ...p[currentIndex].melds.flatMap(m => m.tiles)])) {
      const fullHand = [
        ...p[currentIndex].hand,
        ...p[currentIndex].melds.flatMap(m => m.tiles),
      ];
      const yaku = detectYaku(fullHand, p[currentIndex].melds, {
        isTsumo: true,
        isRiichi: p[currentIndex].isRiichi,
      });
      const { han, fu, points } = calculateScore(
        p[currentIndex].hand,
        p[currentIndex].melds,
        yaku,
        dora,
      );
      const newPlayers = payoutTsumo(p, currentIndex, points);
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
      const yaku = detectYaku(fullHand, winningPlayer.melds, {
        isTsumo: false,
        isRiichi: winningPlayer.isRiichi,
      });
      const { han, fu, points } = calculateScore(
        [...winningPlayer.hand, tile],
        winningPlayer.melds,
        yaku,
      );
      const updated = payoutRon(p, winIdx, idx, points);
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
    if (idx !== 0) {
      let options = getValidCallOptions(p[0], tile);
      options = filterChiOptions(
        options,
        playersRef.current[0].seat,
        playersRef.current[idx].seat,
      );
      if (options.length === 0) {
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
      nextTurn();
      return;
    }
    const caller = 0;
    const discarder = lastDiscard.player;
    let p = [...playersRef.current];
    const meldTiles = selectMeldTiles(p[caller], lastDiscard.tile, action);
    if (!meldTiles) {
      setCallOptions(null);
      setLastDiscard(null);
      nextTurn();
      return;
    }
    p[discarder] = {
      ...p[discarder],
      discard: p[discarder].discard.filter(t => t.id !== lastDiscard.tile.id),
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
      const doraResult = drawDoraIndicator(wallRef.current, 1);
      setDora(prev => [...prev, ...doraResult.dora]);
      setWall(doraResult.wall);
      wallRef.current = doraResult.wall;
      turnRef.current = caller;
      drawForCurrentPlayer();
    }

    setCallOptions(null);
    setLastDiscard(null);
  setTurn(caller);
};

  const performAICall = (caller: number, action: MeldType) => {
    if (!lastDiscard) return;
    const discarder = lastDiscard.player;
    let p = [...playersRef.current];
    const meldTiles = selectMeldTiles(p[caller], lastDiscard.tile, action);
    if (!meldTiles) return;
    p[discarder] = {
      ...p[discarder],
      discard: p[discarder].discard.filter(t => t.id !== lastDiscard.tile.id),
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
      const doraResult = drawDoraIndicator(wallRef.current, 1);
      setDora(prev => [...prev, ...doraResult.dora]);
      setWall(doraResult.wall);
      wallRef.current = doraResult.wall;
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
      <ScoreBoard players={players} kyoku={kyoku} onHelp={() => setHelpOpen(true)} />
      <UIBoard
        players={players}
        dora={dora}
        onDiscard={handleDiscard}
        isMyTurn={turn === 0}
        shanten={shanten}
        lastDiscard={lastDiscard}
        callOptions={callOptions ?? undefined}
        onCallAction={handleCallAction}
        onRiichi={handleRiichi}
      />
      <div className="mt-2">{message}</div>
      {phase === 'end' && (
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleRestart}>
          リプレイ
        </button>
      )}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};
