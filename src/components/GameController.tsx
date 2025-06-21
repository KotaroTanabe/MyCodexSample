import React, { useState, useEffect } from 'react';
import { Tile, PlayerState } from '../types/mahjong';
import { generateTileWall } from './TileWall';
import { createInitialPlayerState, drawTiles, discardTile } from './Player';
import { UIBoard } from './UIBoard';
import { ScoreBoard } from './ScoreBoard';

type GamePhase = 'init' | 'playing' | 'end';

export const GameController: React.FC = () => {
  // ゲーム状態
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [turn, setTurn] = useState(0); // 0:自分, 1-3:AI
  const [phase, setPhase] = useState<GamePhase>('init');
  const [message, setMessage] = useState<string>('');
  const [kyoku, setKyoku] = useState<number>(1); // 東1局など

  // 初期化
  useEffect(() => {
    if (phase === 'init') {
      let wall = generateTileWall();
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
      setPlayers(p);
      setWall(wall);
      setTurn(0);
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
    let p = [...players];
    const result = drawTiles(p[turn], wall, 1);
    p[turn] = result.player;
    setPlayers(p);
    setWall(result.wall);
    setMessage(`${p[turn].name} がツモりました。`);
  };

  // 捨て牌処理（自分／AI共通）
  const handleDiscard = (tileId: string) => {
    let p = [...players];
    p[turn] = discardTile(p[turn], tileId);
    setPlayers(p);
    nextTurn();
  };

  // ターン進行
  const nextTurn = () => {
    let next = (turn + 1) % 4;
    setTurn(next);
    setTimeout(() => {
      if (players[next].isAI) {
        drawForCurrentPlayer();
        // AIの打牌ロジック（現時点はランダム）
        setTimeout(() => {
          const tile = players[next].hand[0];
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
      <ScoreBoard players={players} kyoku={kyoku} />
      <UIBoard
        players={players}
        onDiscard={handleDiscard}
        isMyTurn={turn === 0}
      />
      <div className="mt-2">{message}</div>
      {phase === 'end' && (
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleRestart}>
          リプレイ
        </button>
      )}
    </div>
  );
};