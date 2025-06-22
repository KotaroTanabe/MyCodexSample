import { Tile, Meld } from '../types/mahjong';

const t = (suit: Tile['suit'], rank: number, id: string): Tile => ({ suit, rank, id });

export interface SampleHand {
  hand: Tile[];
  melds: Meld[];
}

export const SAMPLE_HANDS: SampleHand[] = [
  {
    hand: [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',6,'m6a'),t('man',7,'m7a'),t('man',8,'m8a'),
      t('pin',5,'p5a'),t('pin',5,'p5b'),
    ],
    melds: [],
  },
  {
    hand: [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ],
    melds: [
      { type: 'pon', tiles: [t('dragon',1,'d1a'),t('dragon',1,'d1b'),t('dragon',1,'d1c')], fromPlayer: 1, calledTileId: 'd1a' },
    ],
  },
  {
    hand: [
      t('man',2,'m2a'),t('man',3,'m3a'),t('man',4,'m4a'),
      t('pin',2,'p2a'),t('pin',3,'p3a'),t('pin',4,'p4a'),
      t('sou',2,'s2a'),t('sou',3,'s3a'),t('sou',4,'s4a'),
      t('man',5,'m5a'),t('man',5,'m5b'),
    ],
    melds: [
      { type: 'kan', tiles: [t('dragon',1,'k1a'),t('dragon',1,'k1b'),t('dragon',1,'k1c')], fromPlayer: 2, calledTileId: 'k1a' },
    ],
  },
];

function rand(): string {
  return Math.random().toString(36).slice(2, 8);
}

function randomizeIds(hand: SampleHand): SampleHand {
  const handTiles = hand.hand.map(t => ({ ...t, id: rand() }));
  const melds = hand.melds.map(m => {
    const tiles = m.tiles.map(t => ({ ...t, id: rand() }));
    const idx = m.tiles.findIndex(t => t.id === m.calledTileId);
    const calledTileId = idx >= 0 ? tiles[idx].id : rand();
    return { ...m, tiles, calledTileId };
  });
  return { hand: handTiles, melds };
}

export function randomizeSampleHands(hands: SampleHand[]): SampleHand[] {
  return hands.map(h => randomizeIds(h));
}
