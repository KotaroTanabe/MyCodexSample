import React from 'react';
import { GameController } from './components/GameController';

function App() {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center py-8">
      <div className="w-full max-w-4xl mx-auto px-4 space-y-6">
        <h1 className="text-2xl font-bold text-center">麻雀 Web アプリ（1人用デモ）</h1>
        <GameController />
      </div>
    </div>
  );
}

export default App;
