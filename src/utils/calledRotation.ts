export const calledRotation = (seat: number, from: number): number => {
  if (from === seat) return 0;
  const diff = (from - seat + 4) % 4;
  switch (diff) {
    case 1:
      return 90; // from right
    case 2:
      return 180; // from opposite
    case 3:
      return -90; // from left
    default:
      return 0;
  }
};
