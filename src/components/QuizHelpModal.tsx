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
              <li>刻子: 数牌4符 / 么九牌8符</li>
              <li>カン: 数牌16符 / 么九牌32符</li>
              <li>最後に10の位へ切り上げ</li>
            </ul>
          </div>
          {showScore && (
            <div>
              <h3 className="font-semibold mb-1">点数計算</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>基本点 = 符 × 2^(翻 + 2)</li>
                <li>このクイズではこの基本点を答える</li>
                <li>例: 20符4翻 → 20 × 2^6 = 1280</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
