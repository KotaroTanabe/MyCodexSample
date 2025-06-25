import React from 'react';
import { Tile } from '../types/mahjong';
import { TileView } from './TileView';
import { rotationForSeat } from '../utils/rotation';

const seatRotation = rotationForSeat;
const seatRiverRotation = rotationForSeat;

export const RIVER_GAP_PX = 4;
export const CALLED_OFFSET_PX = 6;


const calledOffset = (seat: number): string => {
  switch (seat % 4) {
    case 1:
      return `translateY(-${CALLED_OFFSET_PX}px)`;
    case 2:
      return `translateX(-${CALLED_OFFSET_PX}px)`;
    case 3:
      return `translateY(${CALLED_OFFSET_PX}px)`;
    default:
      return `translateX(${CALLED_OFFSET_PX}px)`;
  }
};

/**
 * Minimum cells to reserve for a player's discard area on large screens.
 * Mobile layouts typically only show three rows of discards, so fewer
 * placeholders are required.
 */
export const RESERVED_RIVER_SLOTS = 24;
export const RESERVED_RIVER_SLOTS_MOBILE = 18;

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
}

export const RiverView: React.FC<RiverViewProps> = ({
  tiles,
  seat,
  lastDiscard,
  dataTestId,
}) => {
  const ordered = tiles;
  const reservedSlots = useResponsiveRiverSlots();
  const placeholdersCount = Math.max(0, reservedSlots - ordered.length);
  return (
    <div
      className="grid grid-cols-6 grid-rows-3 sm:grid-rows-4"
      style={{ transform: `rotate(${seatRiverRotation(seat)}deg)`, gap: RIVER_GAP_PX }}
      data-testid={dataTestId}
    >
      {ordered.map(tile => (
        <TileView
          key={tile.id}
          tile={tile}
          rotate={
            seatRotation(seat) -
            seatRiverRotation(seat) +
            (tile.called || tile.riichiDiscard ? 90 : 0)
          }
          extraTransform={tile.called ? calledOffset(seat) : ''}
          isShonpai={lastDiscard?.tile.id === tile.id && lastDiscard.isShonpai}
        />
      ))}
      {Array.from({ length: placeholdersCount }).map((_, idx) => (
        <span
          key={`placeholder-${idx}`}
          className="inline-block border px-1 py-0.5 bg-white tile-font-size opacity-0"
          style={{ transform: `rotate(${seatRotation(seat) - seatRiverRotation(seat)}deg)` }}
        />
      ))}
    </div>
  );
};
