// 牌の定義
export type Suit = 'man' | 'pin' | 'sou' | 'wind' | 'dragon';

export interface Tile {
  suit: Suit;
  rank: number; // 1–9／風:1東2南3西4北／三元:1白2発3中
  id: string;   // ユニーク識別子
  /** true if this discard was claimed for a meld */
  called?: boolean;
  /** true if discarded after declaring riichi */
  riichiDiscard?: boolean;
}

export type MeldType = 'pon' | 'chi' | 'kan';

export interface Meld {
  type: MeldType;
  tiles: Tile[];
  /** index of the player from whom the tile was taken */
  fromPlayer: number;
  /** id of the tile claimed from another player's discard */
  calledTileId: string;
}

// プレイヤー状態
export interface PlayerState {
  hand: Tile[];
  discard: Tile[];
  melds: Meld[];
  score: number;
  isRiichi: boolean;
  /** true if ippatsu is still possible after declaring riichi */
  ippatsu: boolean;
  name: string;
  isAI: boolean;
  drawnTile: Tile | null;
  seat: number;
}
