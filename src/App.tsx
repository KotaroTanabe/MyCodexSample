import React, { useState } from 'react';
import { GameController } from './components/GameController';
import { FuQuiz } from './components/FuQuiz';
import { ScoreQuiz } from './components/ScoreQuiz';
import { HelpModal } from './components/HelpModal';

function App() {
  const [tileFont, setTileFont] = useState(2);
  const [mode, setMode] = useState<'game' | 'fu-quiz' | 'score-quiz'>('game');
  const [gameLength, setGameLength] = useState<'east1' | 'tonpu' | 'tonnan'>(
    'east1',
  );
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-green-100 flex items-center justify-center py-2"
      style={{ ['--tile-font-size' as any]: `${tileFont}rem` } as React.CSSProperties}
    >
      <div className="w-full mx-auto px-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
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
              onChange={e =>
                setMode(e.target.value as 'game' | 'fu-quiz' | 'score-quiz')
              }
              className="border px-2 py-1"
            >
              <option value="game">ゲーム</option>
              <option value="fu-quiz">符クイズ</option>
              <option value="score-quiz">点数クイズ</option>
            </select>
          </div>
        {mode === 'game' && (
          <div className="flex items-center gap-2">
            <label htmlFor="length">試合形式</label>
            <select
              id="length"
              value={gameLength}
              onChange={e =>
                setGameLength(
                  e.target.value as 'east1' | 'tonpu' | 'tonnan',
                )
              }
              className="border px-2 py-1"
            >
              <option value="east1">東1局のみ</option>
              <option value="tonpu">東風戦</option>
              <option value="tonnan">東南戦</option>
            </select>
          </div>
        )}
        <button
          onClick={() => setHelpOpen(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow text-sm font-bold hover:bg-gray-100"
          aria-label="ヘルプ"
        >
          ?
        </button>
      </div>
      {mode === 'game' ? (
        <GameController key={gameLength} gameLength={gameLength} />
      ) : mode === 'fu-quiz' ? (
        <FuQuiz />
      ) : (
        <ScoreQuiz />
      )}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </div>
  );
}

export default App;
