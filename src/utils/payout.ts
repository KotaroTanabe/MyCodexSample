import { PlayerState } from '../types/mahjong';

export function payoutTsumo(
  players: PlayerState[],
  winner: number,
  points: number,
  honba = 0,
): PlayerState[] {
  const bonusEach = honba * 100;
  return players.map((p, idx) => {
    if (idx === winner) {
      return {
        ...p,
        score: p.score + points * (players.length - 1) + honba * 300,
      };
    }
    return { ...p, score: p.score - (points + bonusEach) };
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
  const penalty = 1000;
  const bonus = (notenCount * penalty) / tenpaiCount;
  const updated: PlayerState[] = players.map((p, idx) => {
    if (tenpai[idx]) return { ...p, score: p.score + bonus };
    return { ...p, score: p.score - penalty };
  });
  const changes = updated.map((p, idx) => p.score - players[idx].score);
  return { players: updated, changes };
}
