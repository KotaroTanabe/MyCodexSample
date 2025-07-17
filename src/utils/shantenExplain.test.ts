import { describe, it, expect } from 'vitest';
import { explainShanten } from './shantenExplain';
import { tilesFromString } from './tileString';
import { Tile } from '../types/mahjong';

describe('explainShanten', () => {
  const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

  it('reports all pairs even when more than one', () => {
    const hand: Tile[] = [
      t('man', 6, 'a'), t('man', 7, 'b'),
      t('pin', 1, 'c'), t('pin', 5, 'd'), t('pin', 6, 'e'), t('pin', 8, 'f'),
      t('sou', 3, 'g'), t('sou', 5, 'h'), t('sou', 6, 'i'),
      t('wind', 1, 'j'), t('wind', 1, 'k'),
      t('dragon', 1, 'l'), t('dragon', 1, 'm'),
      t('dragon', 3, 'n'),
    ];
    const { shanten, explanation } = explainShanten(hand);
    expect(shanten).toBe(3);
    expect(explanation).toBe('標準形: 面子0組、対子2組、ターツ4組 -> 8 - 0*2 - 4 - 1 = 3');
  });

  it('counts extra pair as taatsu', () => {
    const { shanten, explanation } = explainShanten(tilesFromString('11m22m345p678p789s5m'));
    expect(shanten).toBe(0);
    expect(explanation).toBe('聴牌。標準形: 面子3組、対子2組、ターツ1組 -> 8 - 3*2 - 1 - 1 = 0');
  });
});
