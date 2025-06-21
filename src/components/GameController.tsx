import React, { useState, useEffect, useRef } from 'react';
import { Tile, PlayerState } from '../types/mahjong';
import { generateTileWall, drawDoraIndicator } from './TileWall';
import { createInitialPlayerState, drawTiles, discardTile, claimMeld, declareRiichi } from './Player';
import { MeldType } from '../types/mahjong';
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
  const [shanten, setShanten] = useState<{ standard: number; chiitoi: number; kokushi: number }>({ standard: 8, chiitoi: 8, kokushi: 13 });
  const [discardCounts, setDiscardCounts] = useState<Record<string, number>>({});
  const [lastDiscard, setLastDiscard] = useState<{ tile: Tile; player: number; isShonpai: boolean } | null>(null);
  const [callOptions, setCallOptions] = useState<(MeldType | 'pass')[] | null>(null);

  const turnRef = useRef(turn);
  const playersRef = useRef<PlayerState[]>(players);
  const wallRef = useRef<Tile[]>(wall);

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    wallRef.current = wall;
  }, [wall]);

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
      wallRef.current = wall;
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
    if (wallRef.current.length === 0) {
      setMessage('牌山が尽きました。流局です。');
      setPhase('end');
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
      });
      if (p[currentIndex].isRiichi) {
        yaku.push({ name: 'Riichi', han: 1 });
      }
      const { han, fu, points } = calculateScore(p[currentIndex].hand, p[currentIndex].melds, yaku);
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
    setLastDiscard({ tile, player: idx, isShonpai: result.isShonpai });
    p[idx] = discardTile(p[idx], tileId);
    setPlayers(p);
    playersRef.current = p;
    if (idx !== 0) {
      setCallOptions(['pon', 'chi', 'kan', 'pass']);
    } else {
      nextTurn();
    }
  };

  const selectMeldTiles = (
    player: PlayerState,
    tile: Tile,
    type: MeldType,
  ): Tile[] | null => {
    if (type === 'pon' || type === 'kan') {
      const need = type === 'pon' ? 2 : 3;
      const matches = player.hand.filter(
        t => t.suit === tile.suit && t.rank === tile.rank,
      );
      if (matches.length >= need) return matches.slice(0, need);
      return null;
    }
    // chi
    if (tile.suit === 'man' || tile.suit === 'pin' || tile.suit === 'sou') {
      const opts = [
        [tile.rank - 2, tile.rank - 1],
        [tile.rank - 1, tile.rank + 1],
        [tile.rank + 1, tile.rank + 2],
      ];
      for (const [a, b] of opts) {
        const t1 = player.hand.find(t => t.suit === tile.suit && t.rank === a);
        const t2 = player.hand.find(t => t.suit === tile.suit && t.rank === b);
        if (t1 && t2) return [t1, t2];
      }
    }
    return null;
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
    p[caller] = claimMeld(p[caller], [...meldTiles, lastDiscard.tile], action);
    setPlayers(p);
    playersRef.current = p;
    setCallOptions(null);
    setLastDiscard(null);
    setTurn(caller);
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
        onDeclareRiichi={handleRiichi}
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
