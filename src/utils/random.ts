export const randomModule = {
  random: Math.random,
};

export function random(): number {
  return randomModule.random();
}
