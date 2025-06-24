export type GameLength = 'east1' | 'tonpu' | 'tonnan';

export interface RecordHead {
  startTime: number;
  endTime: number;
  rule: {
    gameLength: GameLength;
  };
  players: { name: string; seat: number; isAI: boolean }[];
}

export interface RecordActionBase {
  name: string;
}

export interface RecordNewRound extends RecordActionBase {
  name: '.lq.RecordNewRound';
  kyoku: number;
}

export interface RecordDrawTile extends RecordActionBase {
  name: '.lq.RecordDrawTile';
  seat: number;
  tile: string;
}

export interface RecordDiscardTile extends RecordActionBase {
  name: '.lq.RecordDiscardTile';
  seat: number;
  tile: string;
}

export interface RecordCall extends RecordActionBase {
  name: '.lq.RecordCall';
  seat: number;
  tiles: string[];
  meldType: string;
  from: number;
  kanType?: 'ankan' | 'kakan' | 'daiminkan';
}

export interface RecordRiichi extends RecordActionBase {
  name: '.lq.RecordRiichi';
  seat: number;
  tile: string;
}

export interface RecordTsumo extends RecordActionBase {
  name: '.lq.RecordTsumo';
  seat: number;
  tile: string;
}

export interface RecordRon extends RecordActionBase {
  name: '.lq.RecordRon';
  seat: number;
  tile: string;
  from: number;
}

export type RecordAction =
  | RecordNewRound
  | RecordDrawTile
  | RecordDiscardTile
  | RecordCall
  | RecordRiichi
  | RecordTsumo
  | RecordRon;

export interface GameDataEntry {
  time: number;
  actions: RecordAction[];
}

export interface GameDetailRecords {
  name: '.lq.GameDetailRecords';
  head: RecordHead;
  data: GameDataEntry[];
}
