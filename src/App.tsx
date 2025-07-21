import React, { useEffect, useState } from 'react';
import { GameController } from './components/GameController';
import { FuQuiz } from './components/FuQuiz';
import { ScoreQuiz } from './components/ScoreQuiz';
import { ShantenQuiz } from './components/ShantenQuiz';
import { UkeireQuiz } from './components/UkeireQuiz';
import { HelpModal } from './components/HelpModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [tileFont, setTileFont] = useState(2);
  const [mode, setMode] = useState<'game' | 'fu-quiz' | 'score-quiz' | 'shanten-quiz' | 'ukeire-quiz'>('game');
  const [gameLength, setGameLength] = useState<'east1' | 'tonpu' | 'tonnan'>(
    'east1',
  );
  const [redAka, setRedAka] = useState(1);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [showBorders, setShowBorders] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div
      className="min-h-screen bg-surface-100 dark:bg-surface-900 text-surface-900 dark:text-surface-100 flex items-center justify-center py-2"
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
                setMode(
                  e.target.value as
                    | 'game'
                    | 'fu-quiz'
                    | 'score-quiz'
                    | 'shanten-quiz'
                    | 'ukeire-quiz',
                )
              }
              className="border px-2 py-1"
            >
              <option value="game">ゲーム</option>
              <option value="fu-quiz">符クイズ</option>
              <option value="score-quiz">点数クイズ</option>
              <option value="shanten-quiz">向聴数クイズ</option>
              <option value="ukeire-quiz">受け入れ枚数クイズ</option>
            </select>
          </div>
        {mode === 'game' && (
          <>
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
            <div className="flex items-center gap-2">
              <label htmlFor="aka">赤5枚数</label>
              <select
                id="aka"
                value={redAka}
                onChange={e => setRedAka(parseInt(e.target.value))}
                className="border px-2 py-1"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </>
        )}
        <button
          onClick={() => setToolsOpen(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-0 dark:bg-surface-700 shadow text-sm hover:bg-surface-100 dark:hover:bg-surface-600"
          aria-label="メニュー"
        >
          📄
        </button>
        <button
          onClick={() => setHelpOpen(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-surface-0 dark:bg-surface-700 shadow text-sm font-bold hover:bg-surface-100 dark:hover:bg-surface-600"
          aria-label="ヘルプ"
        >
          ?
        </button>
        <button
          onClick={() => setDark(d => !d)}
          aria-label="Dark mode"
          className="px-2 py-1 border rounded bg-surface-0 dark:bg-surface-700 hover:bg-surface-100 dark:hover:bg-surface-600"
        >
          {dark ? 'Light' : 'Dark'}
        </button>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showBorders}
            onChange={() => setShowBorders(b => !b)}
          />
          枠表示
        </label>
      </div>
      {mode === 'game' ? (
        <GameController
          key={`${gameLength}-${redAka}`}
          gameLength={gameLength}
          red={redAka}
          showBorders={showBorders}
          toolsOpen={toolsOpen}
          onCloseTools={() => setToolsOpen(false)}
        />
      ) : mode === 'fu-quiz' ? (
        <FuQuiz />
      ) : mode === 'score-quiz' ? (
        <ScoreQuiz />
      ) : mode === 'shanten-quiz' ? (
        <ShantenQuiz />
      ) : (
        <UkeireQuiz />
      )}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <ToastContainer position="bottom-right" />
      </div>
    </div>
  );
}

export default App;
