import React from 'react';
import { Tile } from '../types/mahjong';
import { TileView } from './TileView';
import { rotationForSeat } from '../utils/rotation';
import { calledRotation } from '../utils/calledRotation';

export const RIVER_COLS = 6;
export const RIVER_ROWS_MOBILE = 3;
export const RIVER_ROWS_DESKTOP = 4;
export const RIVER_GAP_PX = 4;
/**
 * Offset for called tiles relative to the tile size.
 *
 * Using a CSS calculation keeps the spacing consistent when users
 * change the `--tile-font-size` variable to scale tiles.
 */
export const CALLED_OFFSET = 'calc(var(--tile-font-size) / 5)';

export const GRID_CLASS =
  'grid grid-cols-[repeat(6,_max-content)] grid-rows-3 sm:grid-rows-4';

/**
 * Positional adjustment for a tile claimed from another player's river.
 *
 * Each seat uses a different translation so that called tiles visually shift
 * toward the caller. The offset pairs with {@link calledRotation} and
 * {@link rotationForSeat} to display the tile at the correct angle.
 */
const calledOffset = (seat: number): string => {
  switch (seat % 4) {
    case 1:
      return `translateY(-${CALLED_OFFSET})`;
    case 2:
      return `translateX(-${CALLED_OFFSET})`;
    case 3:
      return `translateY(${CALLED_OFFSET})`;
    default:
      return `translateX(${CALLED_OFFSET})`;
  }
};

/**
 * Minimum cells to reserve for a player's discard area on large screens.
 * Mobile layouts typically only show three rows of discards, so fewer
 * placeholders are required.
 */
export const RESERVED_RIVER_SLOTS = RIVER_COLS * RIVER_ROWS_DESKTOP;
export const RESERVED_RIVER_SLOTS_MOBILE = RIVER_COLS * RIVER_ROWS_MOBILE;

const smallScreen = ():
  boolean => typeof window !== 'undefined' && window.innerWidth < 640;

/**
 * Returns a slot count that updates when the window is resized.
 */
export const useResponsiveRiverSlots = (): number => {
  const [slots, setSlots] = React.useState(
    smallScreen() ? RESERVED_RIVER_SLOTS_MOBILE : RESERVED_RIVER_SLOTS,
  );
  React.useEffect(() => {
    const handler = () => {
      setSlots(
        smallScreen() ? RESERVED_RIVER_SLOTS_MOBILE : RESERVED_RIVER_SLOTS,
      );
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return slots;
};

interface RiverViewProps {
  tiles: Tile[];
  seat: number;
  lastDiscard: { tile: Tile; player: number; isShonpai: boolean } | null;
  dataTestId?: string;
  showBorder?: boolean;
}

export const RiverView: React.FC<RiverViewProps> = ({
  tiles,
  seat,
  lastDiscard,
  dataTestId,
  showBorder = true,
}) => {
  // Called (melded) tiles should appear at the right edge of each player's
  // discard area, mimicking a real mahjong table. We therefore reorder the
  // tiles so that any claimed tile is rendered last.
  const regularTiles = tiles.filter(t => !t.called);
  const calledTiles = tiles.filter(t => t.called);
  const ordered = [...regularTiles, ...calledTiles];
  const reservedSlots = useResponsiveRiverSlots();
  const rowCount = reservedSlots / RIVER_COLS;
  const gapPx = RIVER_GAP_PX * (rowCount - 1);
  const maxHeight = `calc((var(--tile-font-size) + 4px) * ${rowCount} + ${gapPx}px)`;
  const placeholdersCount = Math.max(0, reservedSlots - ordered.length);
  return (
    <div
      className={`relative ${GRID_CLASS} ${showBorder ? 'border' : ''}`}
      style={{
        gap: RIVER_GAP_PX,
        transform: `rotate(${rotationForSeat(seat)}deg)`,
        overflowY: 'auto',
        maxHeight,
        height: maxHeight,
      }}
      data-testid={dataTestId}
    >
      {showBorder && (
        <span
          className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs opacity-25 pointer-events-none select-none"
          aria-hidden="true"
        >
          河
        </span>
      )}
      {ordered.map(tile => {
        const extraRotation =
          tile.calledFrom !== undefined
            ? calledRotation(seat, tile.calledFrom)
            : tile.called || tile.riichiDiscard
              ? 90
              : 0;
        return (
          <TileView
            key={tile.id}
            tile={tile}
            rotate={extraRotation}
            extraTransform={
              tile.called || tile.calledFrom !== undefined ? calledOffset(seat) : ''
            }
            isShonpai={lastDiscard?.tile.id === tile.id && lastDiscard.isShonpai}
          />
        );
      })}
      {Array.from({ length: placeholdersCount }).map((_, idx) => (
        <span
          key={`placeholder-${idx}`}
          className="inline-block px-0.5 py-px leading-none bg-white tile-font-size opacity-0 font-emoji"
        >
          🀇
        </span>
      ))}
    </div>
  );
};
