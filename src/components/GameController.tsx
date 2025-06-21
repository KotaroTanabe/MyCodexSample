import React, { useState, useEffect, useRef } from 'react';
import { Tile, PlayerState } from '../types/mahjong';
import { generateTileWall, drawDoraIndicator } from './TileWall';
import { createInitialPlayerState, drawTiles, discardTile } from './Player';
import { isWinningHand, detectYaku } from '../score/yaku';
import { calculateScore } from '../score/score';
import { UIBoard } from './UIBoard';
import { ScoreBoard } from './ScoreBoard';
import { HelpModal } from './HelpModal';
import { calcShanten } from '../utils/shanten';
import { incrementDiscardCount } from './DiscardUtil';

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
  const [shanten, setShanten] = useState<{ value: number; isChiitoi: boolean }>({ value: 8, isChiitoi: false });
  const [discardCounts, setDiscardCounts] = useState<Record<string, number>>({});
  const [lastDiscard, setLastDiscard] = useState<{ tileId: string; isShonpai: boolean } | null>(null);

  const turnRef = useRef(turn);
  const playersRef = useRef<PlayerState[]>(players);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    playersRef.current = players;
    if (players.length > 0) {
      setShanten(calcShanten(players[0].hand));
    }
  }, [players]);

  // 初期化
  useEffect(() => {
    if (phase === 'init') {
      let wall = generateTileWall();
      const doraResult = drawDoraIndicator(wall, 1);
      const doraTiles = doraResult.dora;
      wall = doraResult.wall;
      let p: PlayerState[] = [
        createInitialPlayerState('あなた', false),
        createInitialPlayerState('AI東家', true),
        createInitialPlayerState('AI南家', true),
        createInitialPlayerState('AI西家', true),
      ];
      // 配牌
      for (let i = 0; i < 4; i++) {
        const result = drawTiles(p[i], wall, 13);
        p[i] = result.player;
        wall = result.wall;
      }
      // 親の14牌目を配る
      const extra = drawTiles(p[0], wall, 1);
      p[0] = extra.player;
      wall = extra.wall;
      setPlayers(p);
      setWall(wall);
      setDora(doraTiles);
      setTurn(0);
      setDiscardCounts({});
      setLastDiscard(null);
      setKyoku(1);
      setMessage('配牌が完了しました。あなたのターンです。');
      setPhase('playing');
    }
  }, [phase]);

  // ツモ処理
  const drawForCurrentPlayer = () => {
    if (wall.length === 0) {
      setMessage('牌山が尽きました。流局です。');
      setPhase('end');
      return;
    }
    const currentIndex = turnRef.current;
    let p = [...playersRef.current];
    const result = drawTiles(p[currentIndex], wall, 1);
    p[currentIndex] = result.player;
    setPlayers(p);
    playersRef.current = p;
    setWall(result.wall);
    if (isWinningHand(p[currentIndex].hand)) {
      const yaku = detectYaku(p[currentIndex].hand);
      const { han, fu, points } = calculateScore(p[currentIndex].hand, yaku);
      const newPlayers = p.map((pl, idx) =>
        idx === currentIndex ? { ...pl, score: pl.score + points } : pl,
      );
      setPlayers(newPlayers);
      playersRef.current = newPlayers;
      setMessage(
        `${p[currentIndex].name} の和了！ ${yaku.map(y => y.name).join(', ')} ${han}翻 ${fu}符 ${points}点`,
      );
      setPhase('end');
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
    setLastDiscard({ tileId, isShonpai: result.isShonpai });
    p[idx] = discardTile(p[idx], tileId);
    setPlayers(p);
    playersRef.current = p;
    nextTurn();
  };

  // ターン進行
  const nextTurn = () => {
    let next = (turnRef.current + 1) % 4;
    setTurn(next);
    setTimeout(() => {
      if (playersRef.current[next].isAI) {
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
