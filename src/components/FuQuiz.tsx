import React, { useState } from 'react';
import { Tile, Meld } from '../types/mahjong';
import { calculateFu } from '../score/score';
import { TileView } from './TileView';
import { sortHand } from './Player';
import { useAgariQuiz } from '../quiz/useAgariQuiz';

// helper functions copied from score.ts for fu breakdown
function tileKey(t: Tile): string {
  return `${t.suit}-${t.rank}`;
}

function countTiles(tiles: Tile[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const t of tiles) {
    const key = tileKey(t);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function parseKey(key: string): Tile {
  const [suit, rankStr] = key.split('-');
  return { suit: suit as Tile['suit'], rank: Number(rankStr), id: '' };
}

interface ParsedMeld {
  type: 'chi' | 'pon';
  tiles: Tile[];
}

function isTerminalOrHonor(tile: Tile): boolean {
  return (
    tile.suit === 'wind' ||
    tile.suit === 'dragon' ||
    tile.rank === 1 ||
    tile.rank === 9
  );
}

function findMelds(counts: Record<string, number>): ParsedMeld[] | null {
  const keys = Object.keys(counts).filter(k => counts[k] > 0).sort();
  if (keys.length === 0) return [];

  const first = keys[0];
  const [suit, rankStr] = first.split('-');
  const rank = Number(rankStr);

  if (counts[first] >= 3) {
    counts[first] -= 3;
    const rest = findMelds(counts);
    counts[first] += 3;
    if (rest) {
      return [{ type: 'pon', tiles: [parseKey(first), parseKey(first), parseKey(first)] }, ...rest];
    }
  }

  if (
    (suit === 'man' || suit === 'pin' || suit === 'sou') &&
    counts[`${suit}-${rank + 1}`] > 0 &&
    counts[`${suit}-${rank + 2}`] > 0
  ) {
    counts[first]--;
    counts[`${suit}-${rank + 1}`]--;
    counts[`${suit}-${rank + 2}`]--;
    const rest = findMelds(counts);
    counts[first]++;
    counts[`${suit}-${rank + 1}`]++;
    counts[`${suit}-${rank + 2}`]++;
    if (rest) {
      return [
        { type: 'chi', tiles: [parseKey(first), parseKey(`${suit}-${rank + 1}`), parseKey(`${suit}-${rank + 2}`)] },
        ...rest,
      ];
    }
  }

  return null;
}

function decomposeHand(tiles: Tile[]): { pair: Tile[]; melds: ParsedMeld[] } | null {
  const counts = countTiles(tiles);
  const tileKeys = Object.keys(counts);
  for (const key of tileKeys) {
    if (counts[key] >= 2) {
      counts[key] -= 2;
      const melds = findMelds(counts);
      counts[key] += 2;
      if (melds) {
        return { pair: [parseKey(key), parseKey(key)], melds };
      }
    }
  }
  return null;
}

function calculateFuDetail(
  hand: Tile[],
  melds: Meld[] = [],
  seatWind = 1,
  roundWind = 1,
): { fu: number; steps: string[] } {
  const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
  const parsed = decomposeHand(allTiles);
  if (!parsed) return { fu: 0, steps: ['invalid hand'] };

  let fu = 20;
  const steps = ['基本符20'];

  let pairFu = 0;
  if (parsed.pair[0].suit === 'dragon') {
    pairFu = 2;
  } else if (parsed.pair[0].suit === 'wind') {
    if (parsed.pair[0].rank === seatWind) pairFu += 2;
    if (parsed.pair[0].rank === roundWind) pairFu += 2;
  }
  if (pairFu > 0) {
    fu += pairFu;
    steps.push(`役牌の雀頭 +${pairFu}`);
  }

  for (const meld of parsed.melds) {
    if (meld.type === 'pon') {
      if (isTerminalOrHonor(meld.tiles[0])) {
        fu += 8;
        steps.push('么九刻子 +8');
      } else {
        fu += 4;
        steps.push('刻子 +4');
      }
    }
  }

  for (const meld of melds) {
    if (meld.type === 'kan') {
      const base = isTerminalOrHonor(meld.tiles[0]) ? 8 : 4;
      const kanFu = isTerminalOrHonor(meld.tiles[0]) ? 32 : 16;
      fu += kanFu - base;
      steps.push(`カンボーナス +${kanFu - base}`);
    }
  }

  const rounded = Math.ceil(fu / 10) * 10;
  if (rounded !== fu) {
    steps.push(`繰り上げて${rounded}符`);
  }
  return { fu: rounded, steps };
}

interface FuQuizProps {
  initialIndex?: number;
  initialWinType?: 'ron' | 'tsumo';
}

export const FuQuiz: React.FC<FuQuizProps> = ({ initialIndex, initialWinType }) => {
  const { question, winType, nextQuestion } = useAgariQuiz({
    initialIndex,
    initialWinType,
  });
  const seatWind = 1;
  const roundWind = 1;
  const windNames: Record<number, string> = { 1: '東', 2: '南', 3: '西', 4: '北' };
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<{ fu: number; steps: string[]; correct: boolean } | null>(
    null,
  );
  const fullHand = sortHand([...question.hand, ...question.melds.flatMap(m => m.tiles)]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fu = calculateFu(question.hand, question.melds, { seatWind, roundWind });
    const detail = calculateFuDetail(question.hand, question.melds, seatWind, roundWind);
    const correct = Number(guess) === fu;
    setResult({ fu, steps: detail.steps, correct });
  };

  const handleNext = () => {
    nextQuestion();
    setGuess('');
    setResult(null);
  };

  return (
    <div className="p-4 border rounded">
      <div className="text-sm mb-1">
        場風: {windNames[roundWind]} / 自風: {windNames[seatWind]} /
        {winType === 'tsumo' ? ' ツモ' : ' ロン'}
      </div>
      <div className="flex gap-1 mb-2 flex-wrap">
        {fullHand.map(t => (
          <TileView key={t.id} tile={t} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 items-center mb-2">
        <input
          className="border px-2 py-1 w-20"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="符を入力"
        />
        <button type="submit" className="px-2 py-1 bg-blue-200 rounded">答える</button>
      </form>
      {result && (
        <div className="mt-2">
          <div>{result.correct ? '正解！' : `不正解。正解: ${result.fu}符`}</div>
          <ul className="list-disc list-inside text-sm">
            {result.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleNext} className="mt-2 px-2 py-1 bg-green-200 rounded">
        次の問題
      </button>
    </div>
  );
};
