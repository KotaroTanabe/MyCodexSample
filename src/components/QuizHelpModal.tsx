import React from 'react';

interface QuizHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  showScore?: boolean;
}

export const QuizHelpModal: React.FC<QuizHelpModalProps> = ({ isOpen, onClose, showScore }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">クイズヘルプ</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black font-bold"
            aria-label="close"
          >
            ×
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <h3 className="font-semibold mb-1">符計算</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>基本符20</li>
              <li>雀頭が三元牌なら+2、自風なら+2、場風なら+2</li>
              <li>刻子: 中張牌4符 / 么九牌8符</li>
              <li>カン: 中張牌16符 / 么九牌32符</li>
              <li>ツモ上がり +2</li>
              <li>面前ロン +10</li>
              <li>最後に10の位へ切り上げ</li>
            </ul>
          </div>
          {showScore && (
            <div>
              <h3 className="font-semibold mb-1">点数計算</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>基本点 = 符 × 2^(翻 + 2)</li>
                <li>ロンは子×4 / 親×6、ツモは子×1 / 親×2</li>
                <li>掛けた後100点単位へ切り上げ</li>
                <li>例: 30符4翻 親ロン → 30 × 2^6 × 6 = 11520 → 11600</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
