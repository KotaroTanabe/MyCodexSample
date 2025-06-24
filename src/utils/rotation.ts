export const rotationForSeat = (seat: number): number => {
  const rotations = [0, 270, 180, 90];
  return rotations[(seat % 4 + 4) % 4];
};
