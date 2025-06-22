import React, { useState } from 'react';
import { GameController } from './components/GameController';
import { FuQuiz } from './components/FuQuiz';
import { ScoreQuiz } from './components/ScoreQuiz';

function App() {
  const [tileFont, setTileFont] = useState(2);
  const [mode, setMode] = useState<'game' | 'fu-quiz' | 'score-quiz'>('game');

  return (
    <div
      className="min-h-screen bg-green-100 flex items-center justify-center py-8"
      style={{ ['--tile-font-size' as any]: `${tileFont}rem` } as React.CSSProperties}
    >
      <div className="w-full max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-2xl font-bold text-center">麻雀 Web アプリ（1人用デモ）</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="size">牌サイズ</label>
          <input
            id="size"
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={tileFont}
            onChange={e => setTileFont(parseFloat(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="mode">モード</label>
          <select
            id="mode"
            value={mode}
            onChange={e => setMode(e.target.value as 'game' | 'fu-quiz' | 'score-quiz')}
            className="border px-2 py-1"
          >
            <option value="game">ゲーム</option>
            <option value="fu-quiz">符クイズ</option>
            <option value="score-quiz">点数クイズ</option>
          </select>
        </div>
        {mode === 'game' ? <GameController /> : mode === 'fu-quiz' ? <FuQuiz /> : <ScoreQuiz />}
      </div>
    </div>
  );
}

export default App;
