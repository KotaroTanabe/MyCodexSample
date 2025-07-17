import { Tile } from '../types/mahjong';
import { isWinningHand, detectYaku } from '../score/yaku';

export function incrementDiscardCount(
  record: Record<string, number>,
  tile: Tile,
): { record: Record<string, number>; isShonpai: boolean } {
  const key = `${tile.suit}-${tile.rank}`;
  const count = (record[key] ?? 0) + 1;
  const newRecord = { ...record, [key]: count };
  return { record: newRecord, isShonpai: count === 1 };
}

export function findRonWinner(
  players: { hand: Tile[]; melds: { tiles: Tile[] }[]; seat: number }[],
  discarderIndex: number,
  tile: Tile,
  roundWind: number,
): number | null {
  for (let i = 0; i < players.length; i++) {
    if (i === discarderIndex) continue;
    const candidate = [
      ...players[i].hand,
      ...players[i].melds.flatMap(m => m.tiles),
      tile,
    ];
    if (isWinningHand(candidate)) {
      const yaku = detectYaku(
        [...players[i].hand, tile],
        players[i].melds as any,
        { seatWind: players[i].seat + 1, roundWind, isTsumo: false },
      );
      const hasBaseYaku = yaku.some(y => y.name !== 'Ura Dora');
      if (hasBaseYaku) return i;
    }
  }
  return null;
}
