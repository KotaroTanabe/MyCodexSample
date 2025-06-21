export function isLeftOf(a: number, b: number): boolean {
  return a === ((b + 1) % 4);
}

export function filterChiOptions(
  options: (string)[],
  callerSeat: number,
  discarderSeat: number,
): string[] {
  if (!isLeftOf(callerSeat, discarderSeat)) {
    return options.filter(o => o !== 'chi');
  }
  return options;
}
