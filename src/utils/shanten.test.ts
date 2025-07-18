import { describe, it, expect } from 'vitest';
import {
  calcStandardShanten,
  calcChiitoiShanten,
  calcKokushiShanten,
  calcShanten,
} from './shanten';
import { Tile } from '../types/mahjong';
import { tilesFromString } from './tileString';

describe('shanten calculations', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

  it('detects a complete standard hand', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 1, 'j'), t('pin', 1, 'k'), t('pin', 1, 'l'),
      t('sou', 2, 'm'), t('sou', 2, 'n'),
    ];
    expect(calcStandardShanten(hand)).toBe(-1);
    expect(calcChiitoiShanten(hand)).toBe(4);
    expect(calcKokushiShanten(hand)).toBe(9);
    expect(calcShanten(hand)).toEqual({ standard: -1, chiitoi: 4, kokushi: 9 });
  });

  it('calculates chiitoitsu tenpai correctly', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 1, 'b'),
      t('man', 2, 'c'), t('man', 2, 'd'),
      t('man', 3, 'e'), t('man', 3, 'f'),
      t('pin', 1, 'g'), t('pin', 1, 'h'),
      t('pin', 2, 'i'), t('pin', 2, 'j'),
      t('sou', 1, 'k'), t('sou', 1, 'l'),
      t('sou', 2, 'm'), t('sou', 3, 'n'),
    ];
    expect(calcChiitoiShanten(hand)).toBe(0);
    expect(calcStandardShanten(hand)).toBe(0);
    expect(calcKokushiShanten(hand)).toBe(9);
    expect(calcShanten(hand)).toEqual({ standard: 0, chiitoi: 0, kokushi: 9 });
  });

  it('calculates chiitoitsu 2-shanten', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 1, 'b'),
      t('man', 2, 'c'), t('man', 2, 'd'),
      t('pin', 3, 'e'), t('pin', 3, 'f'),
      t('pin', 4, 'g'), t('pin', 4, 'h'),
      t('sou', 5, 'i'), t('sou', 6, 'j'),
      t('wind', 1, 'k'), t('dragon', 1, 'l'),
      t('man', 3, 'm'), t('man', 4, 'n'),
    ];
    expect(calcChiitoiShanten(hand)).toBe(2);
  });

  it('handles a standard 1-shanten hand', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 1, 'j'), t('pin', 1, 'k'),
      t('sou', 2, 'l'), t('sou', 2, 'm'), t('sou', 3, 'n'),
    ];
    // 123/456/789m 11p 223s -> one tile away from winning
    expect(calcStandardShanten(hand)).toBe(0);
    expect(calcChiitoiShanten(hand)).toBe(4);
    expect(calcKokushiShanten(hand)).toBe(9);
    expect(calcShanten(hand)).toEqual({ standard: 0, chiitoi: 4, kokushi: 9 });
  });

  it('calculates kokushi 2-shanten', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 9, 'b'),
      t('pin', 1, 'c'), t('pin', 9, 'd'),
      t('sou', 1, 'e'), t('sou', 9, 'f'),
      t('wind', 1, 'g'), t('wind', 2, 'h'), t('wind', 3, 'i'),
      t('dragon', 1, 'j'), t('dragon', 2, 'k'),
      t('man', 2, 'l'), t('pin', 3, 'm'),
    ];
    expect(calcKokushiShanten(hand)).toBe(2);
  });

  it('accounts for open melds in standard shanten', () => {
    const hand: Tile[] = [
      t('man', 1, 'a'), t('man', 2, 'b'), t('man', 3, 'c'),
      t('man', 4, 'd'), t('man', 5, 'e'), t('man', 6, 'f'),
      t('man', 7, 'g'), t('man', 8, 'h'), t('man', 9, 'i'),
      t('pin', 2, 'j'), t('pin', 2, 'k'),
    ];
    expect(calcStandardShanten(hand, 1)).toBe(-1);
    expect(calcShanten(hand, 1).standard).toBe(-1);
  });

  it('recognizes a tricky 1-shanten shape', () => {
    const hand: Tile[] = [
      t('man', 4, 'a'), t('man', 4, 'b'),
      t('pin', 2, 'c'),
      t('pin', 9, 'd'), t('pin', 9, 'e'),
      t('sou', 1, 'f'), t('sou', 2, 'g'), t('sou', 3, 'h'),
      t('sou', 4, 'i'), t('sou', 5, 'j'), t('sou', 6, 'k'),
      t('wind', 3, 'l'), t('wind', 3, 'm'),
    ];
    // この手牌は44m 2p 99p 123456s 西西で、2pを引けば聴牌になる
    expect(calcStandardShanten(hand)).toBe(1);
  });

  it('calculates tenpai for 2345677p 8p 22345s', () => {
    const hand: Tile[] = [
      t('pin', 2, 'a'), t('pin', 3, 'b'), t('pin', 4, 'c'),
      t('pin', 5, 'd'), t('pin', 6, 'e'), t('pin', 7, 'f'),
      t('pin', 7, 'g'), t('pin', 8, 'h'),
      t('sou', 2, 'i'), t('sou', 2, 'j'), t('sou', 3, 'k'),
      t('sou', 4, 'l'), t('sou', 5, 'm'),
    ];
    // 234p 567p 77p 22345s -> waiting on 6p or 9p
    expect(calcStandardShanten(hand)).toBe(0);
  });

  it('computes 0 shanten for 678p1234466s5s with open 555m', () => {
    const hand = tilesFromString('678p1234466s5s');
    // 555m is already opened, so openMelds = 1
    expect(calcStandardShanten(hand, 1)).toBe(0);
  });

  it('computes shabo wait correctly regardless of open melds', () => {
    const patterns: [number, string][] = [
      [0, '111m234p567s33m99p'],
      [1, '234p567s33m99p'],
      [2, '567s33m99p'],
      [3, '33m99p'],
    ];
    // 3面子2対子形で一つの対子を塔子とみなすため 0 向聴になる
    for (const [n, str] of patterns) {
      const hand = tilesFromString(str);
      expect(calcStandardShanten(hand, n)).toBe(0);
    }
  });
  it('uses extra pair as taatsu when beneficial', () => {
    const hand = tilesFromString('11m22m345p678p789s5m');
    // One pair is used as the head, the other as a taatsu
    expect(calcStandardShanten(hand)).toBe(0);
  });
});
