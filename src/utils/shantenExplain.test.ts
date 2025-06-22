import { describe, it, expect } from 'vitest';
import { explainShanten } from './shantenExplain';
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
    expect(shanten).toBe(4);
    expect(explanation).toBe('標準形: 面子0組、対子2組、ターツ3組 -> 8 - 0*2 - 3 - 1 = 4');
  });
});
