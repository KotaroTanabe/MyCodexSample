import { PlayerState, Tile, LogEntry } from '../types/mahjong';
import { canDiscardTile, isTenpaiAfterDiscard } from '../components/Player';

/**
 * Validate a discard considering riichi state and pending riichi.
 * @returns error message if invalid, otherwise null
 */
export function validateDiscard(
  player: PlayerState,
  tileId: string,
  declaringRiichi: boolean,
): string | null {
  if (!declaringRiichi && !canDiscardTile(player, tileId)) {
    return 'リーチ後はツモ牌しか切れません';
  }
  if (declaringRiichi && !isTenpaiAfterDiscard(player, tileId)) {
    return 'その牌ではリーチできません';
  }
  return null;
}

/**
 * Append a discard entry to the log.
 */
export function appendDiscardLog(
  log: LogEntry[],
  player: number,
  tile: Tile,
): LogEntry[] {
  return [...log, { type: 'discard', player, tile }];
}
