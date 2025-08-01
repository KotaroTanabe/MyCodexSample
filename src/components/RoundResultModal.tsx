import React from 'react';

export interface RoundResultRow {
  name: string;
  score: number;
  change: number;
  isTenpai: boolean;
}

export interface RoundResult {
  results: RoundResultRow[];
}

interface Props {
  results: RoundResultRow[];
  onNext: () => void;
  nextLabel?: string;
  onCopyTenhou?: () => void;
  tenhouUrl?: string;
}

export const RoundResultModal: React.FC<Props> = ({
  results,
  onNext,
  nextLabel = '次局へ',
  onCopyTenhou,
  tenhouUrl,
}) => {
  if (results.length === 0) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-2">流局結果</h2>
        <table className="border-collapse text-sm mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">プレイヤー</th>
              <th className="border px-2 py-1">聴牌</th>
              <th className="border px-2 py-1">増減</th>
              <th className="border px-2 py-1">点数</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.name}>
                <td className="border px-2 py-1">{r.name}</td>
                <td className="border px-2 py-1 text-center">{r.isTenpai ? '○' : '×'}</td>
                <td className="border px-2 py-1 text-right">{r.change >= 0 ? `+${r.change}` : r.change}</td>
                <td className="border px-2 py-1 text-right">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(onCopyTenhou || tenhouUrl) && (
          <div className="flex gap-2 mt-2">
            {onCopyTenhou && (
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={onCopyTenhou}
              >
                Tenhouログ コピー
              </button>
            )}
            {tenhouUrl && (
              <a
                className="px-2 py-1 bg-gray-200 rounded"
                href={tenhouUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                天鳳牌譜エディタ
              </a>
            )}
            <a
              className="px-2 py-1 bg-gray-200 rounded"
              href="https://mjai.ekyu.moe/ja.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              牌譜解析（外部サイト）
            </a>
          </div>
        )}
        <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded" onClick={onNext}>{nextLabel}</button>
      </div>
    </div>
  );
};
