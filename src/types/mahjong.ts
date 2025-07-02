// 牌の定義
export type Suit = 'man' | 'pin' | 'sou' | 'wind' | 'dragon';

export interface Tile {
  suit: Suit;
  rank: number; // 1–9／風:1東2南3西4北／三元:1白2発3中
  id: string;   // ユニーク識別子
  /** true if this discard was claimed for a meld */
  called?: boolean;
  /** seat index of the player who called this tile */
  calledFrom?: number;
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
  /** type of kan if this meld is a kan */
  kanType?: 'ankan' | 'kakan' | 'daiminkan';
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
  /** true if this riichi was declared on the very first turn */
  doubleRiichi: boolean;
  name: string;
  isAI: boolean;
  drawnTile: Tile | null;
  seat: number;
}

export interface RoundStartInfo {
  /** starting hand for each player (seat order 0-3) */
  hands: Tile[][];
  /** seat index of the dealer */
  dealer: number;
  /** first dora indicator */
  doraIndicator: Tile;
  /** round number */
  kyoku: number;
}

export type LogEntry =
  | { type: 'startRound'; kyoku: number }
  | { type: 'draw'; player: number; tile: Tile }
  | { type: 'discard'; player: number; tile: Tile }
  | {
      type: 'meld';
      player: number;
      tiles: Tile[];
      meldType: MeldType;
      from: number;
      kanType?: 'ankan' | 'kakan' | 'daiminkan';
    }
  | { type: 'riichi'; player: number; tile: Tile }
  | { type: 'tsumo'; player: number; tile: Tile }
  | { type: 'ron'; player: number; tile: Tile; from: number };
