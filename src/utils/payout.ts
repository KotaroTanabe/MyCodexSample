import { PlayerState } from '../types/mahjong';

export function payoutTsumo(
  players: PlayerState[],
  winner: number,
  childPoints: number,
  dealerPoints: number,
  dealer: number,
  honba = 0,
): PlayerState[] {
  const bonusEach = honba * 100;
  const payments = players.map((_, idx) => {
    if (idx === winner) return 0;
    const base = idx === dealer ? dealerPoints : childPoints;
    return base + bonusEach;
  });
  const gain = payments.reduce((sum, p) => sum + p, 0);
  return players.map((p, idx) => {
    if (idx === winner) return { ...p, score: p.score + gain };
    return { ...p, score: p.score - payments[idx] };
  });
}

export function payoutRon(
  players: PlayerState[],
  winner: number,
  loser: number,
  points: number,
  honba = 0,
): PlayerState[] {
  const bonus = honba * 300;
  return players.map((p, idx) => {
    if (idx === winner) return { ...p, score: p.score + points + bonus };
    if (idx === loser) return { ...p, score: p.score - (points + bonus) };
    return p;
  });
}

export function payoutNoten(
  players: PlayerState[],
  tenpai: boolean[],
): { players: PlayerState[]; changes: number[] } {
  const tenpaiCount = tenpai.filter(t => t).length;
  if (tenpaiCount === 0 || tenpaiCount === players.length) {
    return { players: [...players], changes: players.map(() => 0) };
  }
  const notenCount = players.length - tenpaiCount;
  const totalPenalty = 3000;
  const gain = totalPenalty / tenpaiCount;
  const loss = totalPenalty / notenCount;
  const updated: PlayerState[] = players.map((p, idx) => {
    if (tenpai[idx]) {
      return { ...p, score: p.score + gain };
    }
    return { ...p, score: p.score - loss };
  });
  const changes = updated.map((p, idx) => p.score - players[idx].score);
  return { players: updated, changes };
}
