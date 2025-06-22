import React, { useState } from 'react';
import { YAKU_LIST } from '../yaku';
import { RULE_STATUS } from '../ruleStatus';
import { ScoreTable } from './ScoreTable';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'yaku' | 'score' | 'rules'>('yaku');
  const [isDealer, setIsDealer] = useState(false);
  const [winType, setWinType] = useState<'ron' | 'tsumo'>('ron');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">
            {view === 'yaku'
              ? '役一覧'
              : view === 'score'
                ? '点数表'
                : 'ルール対応状況'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black font-bold"
            aria-label="close"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2 mb-2">
          <button
            className={`px-2 py-1 rounded ${view === 'yaku' ? 'bg-blue-200' : 'bg-gray-200'}`}
            onClick={() => setView('yaku')}
          >
            役一覧
          </button>
          <button
            className={`px-2 py-1 rounded ${view === 'score' ? 'bg-blue-200' : 'bg-gray-200'}`}
            onClick={() => setView('score')}
          >
            点数表
          </button>
          <button
            className={`px-2 py-1 rounded ${view === 'rules' ? 'bg-blue-200' : 'bg-gray-200'}`}
            onClick={() => setView('rules')}
          >
            ルール対応状況
          </button>
        </div>
        {view === 'yaku' ? (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">役</th>
                  <th className="border px-2 py-1">門前</th>
                  <th className="border px-2 py-1">副露</th>
                  <th className="border px-2 py-1">説明</th>
                </tr>
              </thead>
              <tbody>
                {YAKU_LIST.map(y => (
                  <tr key={y.name}>
                    <td className="border px-2 py-1 font-semibold">{y.name}</td>
                    <td className="border px-2 py-1 text-center">{y.hanClosed}</td>
                    <td className="border px-2 py-1 text-center">{y.hanOpen}</td>
                    <td className="border px-2 py-1">{y.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : view === 'score' ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <label>
                <input
                  type="radio"
                  checked={!isDealer}
                  onChange={() => setIsDealer(false)}
                />
                子
              </label>
              <label>
                <input
                  type="radio"
                  checked={isDealer}
                  onChange={() => setIsDealer(true)}
                />
                親
              </label>
              <label>
                <input
                  type="radio"
                  checked={winType === 'ron'}
                  onChange={() => setWinType('ron')}
                />
                ロン
              </label>
              <label>
                <input
                  type="radio"
                  checked={winType === 'tsumo'}
                  onChange={() => setWinType('tsumo')}
                />
                ツモ
              </label>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <ScoreTable isDealer={isDealer} winType={winType} />
            </div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">用語</th>
                  <th className="border px-2 py-1">実装状況</th>
                </tr>
              </thead>
              <tbody>
                {RULE_STATUS.map(r => (
                  <tr key={r.term}>
                    <td className="border px-2 py-1 font-semibold">{r.term}</td>
                    <td className="border px-2 py-1 text-center">
                      {r.implemented ? '○' : '×'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
