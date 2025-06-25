import { describe, it, expect, afterEach } from 'vitest';
import seedrandom from 'seedrandom';
import { random, randomModule, setRandomSource } from './random';

const restore = randomModule.random;

afterEach(() => {
  setRandomSource(restore);
});

describe('random module', () => {
  it('produces deterministic values with a seed', () => {
    setRandomSource(seedrandom('seed'));
    const first = random();
    const second = random();
    setRandomSource(seedrandom('seed'));
    expect(random()).toBe(first);
    expect(random()).toBe(second);
  });
});
