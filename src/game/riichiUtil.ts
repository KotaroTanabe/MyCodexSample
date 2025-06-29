export const shouldRotateRiichi = (
  seat: number,
  pending: number | null,
  indicators: number[],
): boolean => {
  return seat === pending || indicators.includes(seat);
};
