// 牌の定義
export type Suit = 'man' | 'pin' | 'sou' | 'wind' | 'dragon';

export interface Tile {
  suit: Suit;
  rank: number; // 1–9／風:1東2南3西4北／三元:1白2発3中
  id: string;   // ユニーク識別子
}

export type MeldType = 'pon' | 'chi' | 'kan';

export interface Meld {
  type: MeldType;
  tiles: Tile[];
}

// プレイヤー状態
export interface PlayerState {
  hand: Tile[];
  discard: Tile[];
  melds: Meld[];
  score: number;
  isRiichi: boolean;
  name: string;
  isAI: boolean;
}