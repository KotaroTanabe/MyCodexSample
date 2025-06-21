import { PlayerState } from '../types/mahjong';

export function payoutTsumo(
  players: PlayerState[],
  winner: number,
  points: number,
): PlayerState[] {
  return players.map((p, idx) => {
    if (idx === winner) {
      return { ...p, score: p.score + points * (players.length - 1) };
    }
    return { ...p, score: p.score - points };
  });
}

export function payoutRon(
  players: PlayerState[],
  winner: number,
  loser: number,
  points: number,
): PlayerState[] {
  return players.map((p, idx) => {
    if (idx === winner) return { ...p, score: p.score + points };
    if (idx === loser) return { ...p, score: p.score - points };
    return p;
  });
}
