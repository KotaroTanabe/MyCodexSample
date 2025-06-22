import React from 'react';

interface ScoreTableProps {
  isDealer: boolean;
  winType: 'ron' | 'tsumo';
}

function calcBase(han: number, fu: number): number {
  if (han >= 13) return 8000; // kazoe yakuman
  if (han >= 11) return 6000; // sanbaiman
  if (han >= 8) return 4000; // baiman
  if (han >= 6) return 3000; // haneman
  const base = fu * Math.pow(2, han + 2);
  if (han === 5 || base >= 2000) return 2000; // mangan
  return base;
}

function formatScore(han: number, fu: number, isDealer: boolean, winType: 'ron' | 'tsumo'): string {
  const base = calcBase(han, fu);
  if (winType === 'ron') {
    const mult = isDealer ? 6 : 4;
    const total = Math.ceil((base * mult) / 100) * 100;
    return total.toString();
  }
  if (isDealer) {
    const each = Math.ceil((base * 2) / 100) * 100;
    return `${each}オール`;
  }
  const nonDealer = Math.ceil(base / 100) * 100;
  const dealerPay = Math.ceil((base * 2) / 100) * 100;
  return `${nonDealer}-${dealerPay}`;
}

export const ScoreTable: React.FC<ScoreTableProps> = ({ isDealer, winType }) => {
  // Display fu values up to the rarely-seen limit of 130
  // so that even edge cases are shown in the table.
  const fuList = [
    20,
    25,
    30,
    40,
    50,
    60,
    70,
    80,
    90,
    100,
    110,
    120,
    130,
  ];
  const hanList = [1, 2, 3, 4];
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border px-2 py-1">符\翻</th>
          {hanList.map(h => (
            <th key={`h${h}`} className="border px-2 py-1 text-center">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {fuList.map(fu => (
          <tr key={`f${fu}`}>
            <td className="border px-2 py-1 text-center">{fu}</td>
            {hanList.map(h => (
              <td key={`f${fu}h${h}`} className="border px-2 py-1 text-center">
                {formatScore(h, fu, isDealer, winType)}
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td className="border px-2 py-1 text-center">満貫以上</td>
          {hanList.map(h => (
            <td key={`m${h}`} className="border px-2 py-1 text-center">
              {formatScore(Math.max(h, 5), 30, isDealer, winType)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

