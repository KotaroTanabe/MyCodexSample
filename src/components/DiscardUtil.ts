import { Tile } from '../types/mahjong';

export function incrementDiscardCount(
  record: Record<string, number>,
  tile: Tile,
): { record: Record<string, number>; isShonpai: boolean } {
  const key = `${tile.suit}-${tile.rank}`;
  const count = (record[key] ?? 0) + 1;
  const newRecord = { ...record, [key]: count };
  return { record: newRecord, isShonpai: count === 1 };
}
