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
        <ul className="list-disc pl-5 space-y-1 max-h-96 overflow-y-auto">
          {YAKU_LIST.map(y => (
            <li key={y.name}>
              <span className="font-semibold">{y.name}</span> - {y.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
