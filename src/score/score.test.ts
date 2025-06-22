import { describe, it, expect } from 'vitest';
import { calcRoundedScore } from './score';

describe('calcRoundedScore', () => {
  it('calculates child ron for 3 han 40 fu', () => {
    const points = calcRoundedScore(3, 40, false, 'ron');
    // 3翻40符の子ロンなので基本点 40 * 2^(3 + 2) = 1280
    // これに4倍して5120、100点単位に切り上げて5200になるはず
    expect(points).toBe(5200);
  });

  it('calculates child mangan correctly', () => {
    const points = calcRoundedScore(5, 40, false, 'ron');
    // 5翻は満貫扱いなので基本点2000、子ロンは4倍で8000になるはず
    expect(points).toBe(8000);
  });

  it('calculates dealer tsumo haneman', () => {
    const points = calcRoundedScore(6, 30, true, 'tsumo');
    // 6翻は跳満で基本点3000、親ツモは2倍支払いの6000オールになるはず
    expect(points).toBe(6000);
  });

  it('caps at yakuman for dealer ron', () => {
    const points = calcRoundedScore(13, 30, true, 'ron');
    // 13翻は役満なので基本点8000、親ロンは6倍で48000になるはず
    expect(points).toBe(48000);
  });
});
