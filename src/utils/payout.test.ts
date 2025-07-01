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
  it('adjusts scores for a tsumo win', () => {
    const players = setupPlayers();
    const updated = payoutTsumo(players, 0, 1000);
    expect(updated[0].score).toBe(players[0].score + 3000);
    for (let i = 1; i < 4; i++) {
      expect(updated[i].score).toBe(players[i].score - 1000);
    }
  });

  it('includes honba bonus for tsumo', () => {
    const players = setupPlayers();
    const updated = payoutTsumo(players, 0, 1000, 2);
    // 今の実装だと2本場でツモした場合、各家が1000点+200点支払いとなるため
    // 合計3600点受け取りになるはず
    expect(updated[0].score).toBe(players[0].score + 3600);
    for (let i = 1; i < 4; i++) {
      expect(updated[i].score).toBe(players[i].score - 1200);
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

  it('includes honba bonus for ron', () => {
    const players = setupPlayers();
    const updated = payoutRon(players, 1, 2, 2000, 3);
    // 今の実装だと3本場でロン上がりした場合、放銃者は2000点+900点支払い
    // 和了者は同じ2900点受け取るはず
    expect(updated[1].score).toBe(players[1].score + 2900);
    expect(updated[2].score).toBe(players[2].score - 2900);
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
    // 2人テンパイ・2人ノーテンの場合、ノーテン者はテンパイ者それぞれに1000点支払う
    // よってテンパイ者は1000点×2=2000点受け取り、ノーテン者は2000点支払いとなるはず
    expect(updated[0].score).toBe(players[0].score + 2000);
    expect(updated[1].score).toBe(players[1].score + 2000);
    for (let i = 2; i < 4; i++) {
      expect(updated[i].score).toBe(players[i].score - 2000);
    }
  });

  it('handles one noten against three tenpai correctly', () => {
    const players = setupPlayers();
    const tenpai = [true, true, true, false];
    const { players: updated } = payoutNoten(players, tenpai);
    // ノーテン1人が3人に1000点ずつ支払うため計3000点マイナス
    expect(updated[3].score).toBe(players[3].score - 3000);
    // テンパイ者はそれぞれ1000点ずつ受け取る
    for (let i = 0; i < 3; i++) {
      expect(updated[i].score).toBe(players[i].score + 1000);
    }
  });
});
