import seedrandom from 'seedrandom';

export type RandomSource = () => number;

let rng: seedrandom.PRNG = seedrandom();

export const randomModule = {
  random: (): number => rng(),
};

export function setRandomSource(fn: RandomSource): void {
  rng = fn as unknown as seedrandom.PRNG;
  randomModule.random = fn;
}

export function seedRandom(seed: string): void {
  rng = seedrandom(seed);
  randomModule.random = (): number => rng();
}

export function random(): number {
  return randomModule.random();
}
