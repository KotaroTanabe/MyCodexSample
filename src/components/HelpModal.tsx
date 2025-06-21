import React from 'react';
import { YAKU_LIST } from '../yaku';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">役一覧</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black font-bold"
            aria-label="close"
          >
            ×
          </button>
        </div>
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
      </div>
    </div>
  );
};
