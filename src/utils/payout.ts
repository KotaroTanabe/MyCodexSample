import { PlayerState } from '../types/mahjong';

export function payoutTsumo(
  players: PlayerState[],
  winner: number,
  payments: { dealer: number; nonDealer: number },
  dealerIndex: number,
): PlayerState[] {
  return players.map((p, idx) => {
    if (idx === winner) {
      const gain =
        winner === dealerIndex
          ? payments.dealer * (players.length - 1)
          : payments.dealer + payments.nonDealer * (players.length - 2);
      return { ...p, score: p.score + gain };
    }
    const pay =
      winner === dealerIndex
        ? payments.dealer
        : idx === dealerIndex
          ? payments.dealer
          : payments.nonDealer;
    return { ...p, score: p.score - pay };
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
