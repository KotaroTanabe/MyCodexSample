import React, { useState } from 'react';
import { Tile, Meld } from '../types/mahjong';
import { TileView } from './TileView';
import { sortHand } from './Player';

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

function calculateFuDetail(hand: Tile[], melds: Meld[] = []): { fu: number; steps: string[] } {
  const allTiles = [...hand, ...melds.flatMap(m => m.tiles)];
  const parsed = decomposeHand(allTiles);
  if (!parsed) return { fu: 0, steps: ['invalid hand'] };

  let fu = 20;
  const steps = ['基本符20'];

  if (parsed.pair[0].suit === 'dragon') {
    fu += 2;
    steps.push('役牌の雀頭 +2');
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

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

interface Question {
  hand: Tile[];
  melds: Meld[];
}

const QUESTIONS: Question[] = [
  {
    hand: [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ],
    melds: [],
  },
  {
    hand: [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ],
    melds: [
      { type: 'pon', tiles: [t('dragon',1,'d1a'),t('dragon',1,'d1b'),t('dragon',1,'d1c')], fromPlayer: 1, calledTileId: 'd1a' },
    ],
  },
  {
    hand: [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ],
    melds: [
      { type: 'kan', tiles: [t('dragon',1,'k1a'),t('dragon',1,'k1b'),t('dragon',1,'k1c')], fromPlayer: 2, calledTileId: 'k1a' },
    ],
  },
];

interface FuQuizProps {
  initialIndex?: number;
}

export const FuQuiz: React.FC<FuQuizProps> = ({ initialIndex }) => {
  const [idx, setIdx] = useState(initialIndex ?? 0);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<{ fu: number; steps: string[] } | null>(null);

  const question = QUESTIONS[idx];
  const fullHand = sortHand([...question.hand, ...question.melds.flatMap(m => m.tiles)]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const detail = calculateFuDetail(question.hand, question.melds);
    setResult(detail);
  };

  const nextQuestion = () => {
    setIdx((idx + 1) % QUESTIONS.length);
    setGuess('');
    setResult(null);
  };

  return (
    <div className="p-4 border rounded">
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
          <div>正解: {result.fu}符</div>
          <ul className="list-disc list-inside text-sm">
            {result.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={nextQuestion} className="mt-2 px-2 py-1 bg-green-200 rounded">
        次の問題
      </button>
    </div>
  );
};
