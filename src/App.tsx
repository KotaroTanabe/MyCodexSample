import React, { useState } from 'react';
import { GameController } from './components/GameController';

function App() {
  const [tileFont, setTileFont] = useState(2);

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
        <GameController />
      </div>
    </div>
  );
}

export default App;
