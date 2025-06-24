import { LogEntry, Tile } from '../types/mahjong';

export function isChankan(prev: LogEntry | undefined, from: number, tile: Tile): boolean {
  return (
    !!prev &&
    prev.type === 'meld' &&
    prev.meldType === 'kan' &&
    prev.player === from &&
    prev.tiles.some(t => t.id === tile.id) &&
    prev.kanType === 'kakan'
  );
}
