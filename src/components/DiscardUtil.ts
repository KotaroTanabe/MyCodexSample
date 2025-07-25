import { Tile, PlayerState } from '../types/mahjong';
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
  players: Pick<
    PlayerState,
    'hand' | 'melds' | 'seat' | 'isRiichi' | 'doubleRiichi' | 'ippatsu'
  >[],
  discarderIndex: number,
  tile: Tile,
  roundWind: number,
): number | null {
  for (let i = 0; i < players.length; i++) {
    if (i === discarderIndex) continue;
    if (isWinningHand([...players[i].hand, tile], players[i].melds as any)) {
      const yaku = detectYaku(
        [...players[i].hand, tile],
        players[i].melds as any,
        {
          seatWind: players[i].seat + 1,
          roundWind,
          isTsumo: false,
          isRiichi: players[i].isRiichi,
          doubleRiichi: players[i].doubleRiichi,
          ippatsu: players[i].ippatsu,
        },
      );
      const hasBaseYaku = yaku.some(y => y.name !== 'Ura Dora');
      if (hasBaseYaku) return i;
    }
  }
  return null;
}
