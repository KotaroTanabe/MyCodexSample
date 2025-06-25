/**
 * Base rotation of a player's tiles in degrees.
 *
 * Seat numbering assumes 0 = south (bottom), 1 = east (left),
 * 2 = north (top) and 3 = west (right). Rotations wrap around so
 * any integer seat value can be provided.
 */
export const rotationForSeat = (seat: number): number => {
  const rotations = [0, 270, 180, 90];
  return rotations[(seat % 4 + 4) % 4];
};
