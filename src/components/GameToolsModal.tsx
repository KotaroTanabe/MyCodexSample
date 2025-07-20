import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDownloadLog: () => void;
  onDownloadMjaiLog: () => void;
  preset: string;
  setPreset: (p: string) => void;
  boardInput: string;
  setBoardInput: (s: string) => void;
  onLoadBoard: () => void;
}

export const GameToolsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDownloadLog,
  onDownloadMjaiLog,
  preset,
  setPreset,
  boardInput,
  setBoardInput,
  onLoadBoard,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg space-y-2 max-w-md w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">ツール</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black font-bold"
            aria-label="close"
          >
            ×
          </button>
        </div>
        <button className="px-2 py-1 bg-gray-200 rounded w-full" onClick={onDownloadLog}>
          ログダウンロード
        </button>
        <button className="px-2 py-1 bg-gray-200 rounded w-full" onClick={onDownloadMjaiLog}>
          MJAIログダウンロード
        </button>
        <div className="flex items-center gap-2">
          <label htmlFor="preset" className="whitespace-nowrap">プリセット</label>
          <select
            id="preset"
            aria-label="プリセット"
            className="border px-2 py-1"
            value={preset}
            onChange={e => setPreset(e.target.value as any)}
          >
            <option value="basic">基本形</option>
            <option value="multiCalls">複数鳴き</option>
            <option value="kanVariants">カン各種</option>
            <option value="longRiver">捨て牌19枚</option>
            <option value="allFuro">全員鳴き</option>
          </select>
        </div>
        <textarea
          aria-label="盤面入力"
          className="w-full h-40 p-1 border font-mono"
          value={boardInput}
          onChange={e => setBoardInput(e.target.value)}
        />
        <button className="px-2 py-1 bg-gray-200 rounded w-full" onClick={onLoadBoard}>
          盤面読み込み
        </button>
      </div>
    </div>
  );
};
