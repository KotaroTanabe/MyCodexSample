import { describe, it, expect } from 'vitest';
import { payoutTsumo, payoutRon } from './payout';
import { createInitialPlayerState } from '../components/Player';

function setupPlayers() {
  return [
    createInitialPlayerState('p1', false),
    createInitialPlayerState('p2', false),
    createInitialPlayerState('p3', false),
    createInitialPlayerState('p4', false),
  ];
}

describe('payoutTsumo', () => {
  it('adjusts scores for a tsumo win', () => {
    const players = setupPlayers();
    const updated = payoutTsumo(players, 0, 1000);
    expect(updated[0].score).toBe(players[0].score + 3000);
    for (let i = 1; i < 4; i++) {
      expect(updated[i].score).toBe(players[i].score - 1000);
    }
  });
});

describe('payoutRon', () => {
  it('adjusts scores for a ron win', () => {
    const players = setupPlayers();
    const updated = payoutRon(players, 1, 2, 2000);
    expect(updated[1].score).toBe(players[1].score + 2000);
    expect(updated[2].score).toBe(players[2].score - 2000);
    expect(updated[0].score).toBe(players[0].score);
    expect(updated[3].score).toBe(players[3].score);
  });
});
