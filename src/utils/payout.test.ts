import { describe, it, expect } from 'vitest';
import { payoutTsumo, payoutRon, payoutNoten } from './payout';
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
  it('adjusts scores for a non-dealer tsumo win', () => {
    const players = setupPlayers();
    const payments = { dealer: 2000, nonDealer: 1000 };
    const updated = payoutTsumo(players, 0, payments, 1);
    expect(updated[0].score).toBe(players[0].score + 4000);
    expect(updated[1].score).toBe(players[1].score - 2000);
    expect(updated[2].score).toBe(players[2].score - 1000);
    expect(updated[3].score).toBe(players[3].score - 1000);
  });

  it('adjusts scores when the dealer tsumo wins', () => {
    const players = setupPlayers();
    const payments = { dealer: 2000, nonDealer: 2000 };
    const updated = payoutTsumo(players, 1, payments, 1);
    expect(updated[1].score).toBe(players[1].score + 6000);
    for (let i of [0,2,3]) {
      expect(updated[i].score).toBe(players[i].score - 2000);
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

describe('payoutNoten', () => {
  it('distributes penalty when some players are tenpai', () => {
    const players = setupPlayers();
    const tenpai = [true, false, false, false];
    const { players: updated } = payoutNoten(players, tenpai);
    expect(updated[0].score).toBe(players[0].score + 3000);
    for (let i = 1; i < 4; i++) {
      expect(updated[i].score).toBe(players[i].score - 1000);
    }
  });

  it('splits penalty among multiple tenpai players', () => {
    const players = setupPlayers();
    const tenpai = [true, true, false, false];
    const { players: updated } = payoutNoten(players, tenpai);
    expect(updated[0].score).toBe(players[0].score + 1000);
    expect(updated[1].score).toBe(players[1].score + 1000);
    for (let i = 2; i < 4; i++) {
      expect(updated[i].score).toBe(players[i].score - 1000);
    }
  });
});
