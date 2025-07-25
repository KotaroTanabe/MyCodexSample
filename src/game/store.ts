import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Tile, PlayerState, LogEntry, MeldType, RoundStartInfo } from '../types/mahjong';
import { isChankan } from './isChankan';
import { generateTileWall, drawDoraIndicator } from '../components/TileWall';
import {
  createInitialPlayerState,
  drawTiles,
  discardTile,
  claimMeld,
  declareRiichi,
  canDeclareRiichi,
  clearIppatsu,
  canCallMeld,
  removeDiscardTile,
} from '../components/Player';
import { validateDiscard, appendDiscardLog } from './helpers';
import {
  selectMeldTiles,
  getValidCallOptions,
  getSelfKanOptions,
  getChiOptions,
} from '../utils/meld';
import { filterChiOptions } from '../utils/table';
import { isWinningHand, detectYaku } from '../score/yaku';
import { calculateScore, calcRoundedScore } from '../score/score';
import { calcShanten } from '../utils/shanten';
import { incrementDiscardCount, findRonWinner } from '../components/DiscardUtil';
import { chooseAICallOption, chooseAIDiscardTile } from '../utils/ai';
import { payoutTsumo, payoutRon, payoutNoten } from '../utils/payout';
import type { RoundResult } from '../components/RoundResultModal';
import type { WinResult } from '../components/WinResultModal';
import { exportLqRecord } from '../utils/paifuExport';
import { exportMjaiRecord } from '../utils/mjaiExport';
import { exportTenhouLog, tenhouJsonToUrl } from '../utils/tenhouExport';
import type { RoundEndInfo } from '../utils/tenhouExport';
import type { RecordHead } from '../types/jantama';
import { shouldRotateRiichi } from './riichiUtil';

/**
 * Rotate seat numbers without reordering the array.
 * Each player's {@link PlayerState.chair} stays fixed so UI orientation
 * remains consistent while the dealer position advances.
 */
const rotateSeatNumbers = (players: PlayerState[]): PlayerState[] =>
  players.map(p => ({ ...p, seat: (p.seat + 3) % 4 }));

const DEAD_WALL_SIZE = 14;

export type GameLength = 'east1' | 'tonpu' | 'tonnan';
export const maxKyokuForLength = (len: GameLength): number =>
  len === 'tonnan' ? 8 : len === 'tonpu' ? 4 : 1;

type GamePhase = 'init' | 'playing' | 'end';

interface BoardData {
  players: PlayerState[];
  wall: Tile[];
  deadWall: Tile[];
  dora: Tile[];
  turn: number;
  kyoku: number;
  riichiPool: number;
  honba: number;
}

const boardPresets: Record<string, BoardData> = (() => {
  type TileFactory = (_suit: Tile['suit'], _rank: number) => Tile;
  const make = (build: (_t: TileFactory) => BoardData): BoardData => {
    let id = 1;
    const t = (suit: Tile['suit'], rank: number): Tile => ({ suit, rank, id: `p${id++}` });
    return build(t);
  };

  const basic = make(t => {
    const p0 = createInitialPlayerState('自分', false, 0);
    const chi = [t('man', 1), t('man', 2), t('man', 3)];
    p0.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('sou', 1), t('sou', 2), t('sou', 3), t('wind', 1), t('wind', 2), t('dragon', 1), t('dragon', 2), t('man', 7), t('man', 8), t('man', 9)];
    p0.melds = [{ type: 'chi', tiles: chi, fromPlayer: 1, calledTileId: chi[0].id }];

    const p1 = createInitialPlayerState('下家', true, 1);
    const pon = [t('pin', 7), t('pin', 7), t('pin', 7)];
    p1.hand = [t('man', 1), t('man', 2), t('man', 3), t('sou', 4), t('sou', 5), t('sou', 6), t('wind', 3), t('wind', 4), t('dragon', 3), t('man', 5), t('pin', 9), t('pin', 9)];
    p1.melds = [{ type: 'pon', tiles: pon, fromPlayer: 2, calledTileId: pon[1].id }];

    const p2 = createInitialPlayerState('対面', true, 2);
    const kan = [t('sou', 1), t('sou', 1), t('sou', 1), t('sou', 1)];
    p2.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('man', 4), t('man', 5), t('man', 6), t('wind', 1), t('wind', 2), t('dragon', 1)];
    p2.melds = [
      { type: 'kan', tiles: kan, fromPlayer: 3, calledTileId: kan[0].id, kanType: 'daiminkan' },
    ];

    const p3 = createInitialPlayerState('上家', true, 3);
    p3.hand = [t('man', 2), t('pin', 2), t('sou', 2), t('wind', 1), t('wind', 2), t('wind', 3), t('dragon', 1), t('dragon', 2), t('dragon', 3), t('man', 9), t('pin', 9), t('sou', 9), t('man', 1)];

    return { players: [p0, p1, p2, p3], wall: [], deadWall: [], dora: [], turn: 0, kyoku: 1, riichiPool: 0, honba: 0 };
  });

  const multiCalls = make(t => {
    const p0 = createInitialPlayerState('自分', false, 0);
    p0.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('sou', 1), t('sou', 2), t('sou', 3), t('wind', 1), t('wind', 2), t('dragon', 1), t('dragon', 2), t('man', 7), t('man', 8), t('man', 9)];

    const p1 = createInitialPlayerState('下家', true, 1);
    const pon = [t('pin', 7), t('pin', 7), t('pin', 7)];
    const chi = [t('man', 1), t('man', 2), t('man', 3)];
    p1.hand = [t('sou', 4), t('sou', 5), t('sou', 6), t('wind', 3), t('wind', 4), t('dragon', 3), t('man', 5), t('pin', 9), t('pin', 9)];
    p1.melds = [
      { type: 'pon', tiles: pon, fromPlayer: 2, calledTileId: pon[1].id },
      { type: 'chi', tiles: chi, fromPlayer: 0, calledTileId: chi[0].id },
    ];

    const p2 = createInitialPlayerState('対面', true, 2);
    const kan = [t('sou', 1), t('sou', 1), t('sou', 1), t('sou', 1)];
    p2.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('man', 4), t('man', 5), t('man', 6), t('wind', 1), t('wind', 2), t('dragon', 1)];
    p2.melds = [
      { type: 'kan', tiles: kan, fromPlayer: 3, calledTileId: kan[0].id, kanType: 'daiminkan' },
    ];

    const p3 = createInitialPlayerState('上家', true, 3);
    p3.hand = [t('man', 2), t('pin', 2), t('sou', 2), t('wind', 1), t('wind', 2), t('wind', 3), t('dragon', 1), t('dragon', 2), t('dragon', 3), t('man', 9), t('pin', 9), t('sou', 9), t('man', 1)];

    return { players: [p0, p1, p2, p3], wall: [], deadWall: [], dora: [], turn: 0, kyoku: 1, riichiPool: 0, honba: 0 };
  });

  const kanVariants = make(t => {
    const p0 = createInitialPlayerState('自分', false, 0);
    const ankan = [t('man', 5), t('man', 5), t('man', 5), t('man', 5)];
    p0.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('sou', 1), t('sou', 2), t('sou', 3), t('wind', 1), t('wind', 2), t('dragon', 1), t('dragon', 2), t('man', 7), t('man', 8), t('man', 9)];
    p0.melds = [
      { type: 'kan', tiles: ankan, fromPlayer: 0, calledTileId: ankan[0].id, kanType: 'ankan' },
    ];

    const p1 = createInitialPlayerState('下家', true, 1);
    const minkan = [t('pin', 7), t('pin', 7), t('pin', 7), t('pin', 7)];
    p1.hand = [t('man', 1), t('man', 2), t('man', 3), t('sou', 4), t('sou', 5), t('sou', 6), t('wind', 3), t('wind', 4), t('dragon', 3)];
    p1.melds = [
      { type: 'kan', tiles: minkan, fromPlayer: 2, calledTileId: minkan[1].id, kanType: 'daiminkan' },
    ];

    const p2 = createInitialPlayerState('対面', true, 2);
    const kakan = [t('sou', 3), t('sou', 3), t('sou', 3), t('sou', 3)];
    p2.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('man', 4), t('man', 5), t('man', 6), t('wind', 1), t('wind', 2), t('dragon', 1)];
    p2.melds = [
      { type: 'kan', tiles: kakan, fromPlayer: 1, calledTileId: kakan[0].id, kanType: 'kakan' },
    ];

    const p3 = createInitialPlayerState('上家', true, 3);
    p3.hand = [t('man', 2), t('pin', 2), t('sou', 2), t('wind', 1), t('wind', 2), t('wind', 3), t('dragon', 1), t('dragon', 2), t('dragon', 3), t('man', 9), t('pin', 9), t('sou', 9), t('man', 1)];

    return { players: [p0, p1, p2, p3], wall: [], deadWall: [], dora: [], turn: 0, kyoku: 1, riichiPool: 0, honba: 0 };
  });

  const longRiver = make(t => {
    const p0 = createInitialPlayerState('自分', false, 0);
    const chi = [t('man', 1), t('man', 2), t('man', 3)];
    p0.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('sou', 1), t('sou', 2), t('sou', 3), t('wind', 1), t('wind', 2), t('dragon', 1), t('dragon', 2), t('man', 7), t('man', 8), t('man', 9)];
    p0.melds = [{ type: 'chi', tiles: chi, fromPlayer: 1, calledTileId: chi[0].id }];

    const p1 = createInitialPlayerState('下家', true, 1);
    const pon = [t('pin', 7), t('pin', 7), t('pin', 7)];
    p1.hand = [t('man', 1), t('man', 2), t('man', 3), t('sou', 4), t('sou', 5), t('sou', 6), t('wind', 3), t('wind', 4), t('dragon', 3), t('man', 5), t('pin', 9), t('pin', 9)];
    p1.melds = [{ type: 'pon', tiles: pon, fromPlayer: 2, calledTileId: pon[1].id }];

    const p2 = createInitialPlayerState('対面', true, 2);
    const kan = [t('sou', 1), t('sou', 1), t('sou', 1), t('sou', 1)];
    p2.hand = [t('pin', 1), t('pin', 2), t('pin', 3), t('man', 4), t('man', 5), t('man', 6), t('wind', 1), t('wind', 2), t('dragon', 1)];
    p2.melds = [
      { type: 'kan', tiles: kan, fromPlayer: 3, calledTileId: kan[0].id, kanType: 'daiminkan' },
    ];

    const p3 = createInitialPlayerState('上家', true, 3);
    p3.hand = [t('man', 2), t('pin', 2), t('sou', 2), t('wind', 1), t('wind', 2), t('wind', 3), t('dragon', 1), t('dragon', 2), t('dragon', 3), t('man', 9), t('pin', 9), t('sou', 9), t('man', 1)];
    p3.discard = Array.from({ length: 20 }).map((_, i) => t('man', (i % 9) + 1));

    return { players: [p0, p1, p2, p3], wall: [], deadWall: [], dora: [], turn: 0, kyoku: 1, riichiPool: 0, honba: 0 };
  });

  const allFuro = make(t => {
    const p0 = createInitialPlayerState('自分', false, 0);
    const chi0 = [t('man', 1), t('man', 2), t('man', 3)];
    p0.hand = [
      t('pin', 1),
      t('pin', 2),
      t('pin', 3),
      t('sou', 4),
      t('sou', 5),
      t('sou', 6),
      t('wind', 1),
      t('wind', 2),
      t('dragon', 1),
      t('dragon', 2),
    ];
    p0.melds = [{ type: 'chi', tiles: chi0, fromPlayer: 1, calledTileId: chi0[0].id }];

    const p1 = createInitialPlayerState('下家', true, 1);
    const pon1 = [t('pin', 7), t('pin', 7), t('pin', 7)];
    const chi1 = [t('man', 2), t('man', 3), t('man', 4)];
    p1.hand = [
      t('sou', 1),
      t('sou', 2),
      t('sou', 3),
      t('wind', 3),
      t('dragon', 1),
      t('dragon', 2),
      t('man', 5),
    ];
    p1.melds = [
      { type: 'pon', tiles: pon1, fromPlayer: 2, calledTileId: pon1[1].id },
      { type: 'chi', tiles: chi1, fromPlayer: 0, calledTileId: chi1[0].id },
    ];

    const p2 = createInitialPlayerState('対面', true, 2);
    const pon2 = [t('sou', 6), t('sou', 6), t('sou', 6)];
    const chi2 = [t('pin', 3), t('pin', 4), t('pin', 5)];
    const kan2 = [t('man', 9), t('man', 9), t('man', 9), t('man', 9)];
    p2.hand = [t('wind', 1), t('dragon', 3), t('pin', 1)];
    p2.melds = [
      { type: 'pon', tiles: pon2, fromPlayer: 3, calledTileId: pon2[1].id },
      { type: 'chi', tiles: chi2, fromPlayer: 1, calledTileId: chi2[0].id },
      { type: 'kan', tiles: kan2, fromPlayer: 0, calledTileId: kan2[0].id, kanType: 'daiminkan' },
    ];

    const p3 = createInitialPlayerState('上家', true, 3);
    const pon3a = [t('pin', 2), t('pin', 2), t('pin', 2)];
    const pon3b = [t('sou', 8), t('sou', 8), t('sou', 8)];
    const chi3a = [t('man', 4), t('man', 5), t('man', 6)];
    const chi3b = [t('pin', 5), t('pin', 6), t('pin', 7)];
    p3.hand = [t('dragon', 1)];
    p3.melds = [
      { type: 'pon', tiles: pon3a, fromPlayer: 0, calledTileId: pon3a[1].id },
      { type: 'pon', tiles: pon3b, fromPlayer: 2, calledTileId: pon3b[1].id },
      { type: 'chi', tiles: chi3a, fromPlayer: 1, calledTileId: chi3a[0].id },
      { type: 'chi', tiles: chi3b, fromPlayer: 2, calledTileId: chi3b[0].id },
    ];

    const wall = [
      t('man', 7),
      t('man', 8),
      t('man', 9),
      t('pin', 7),
      t('pin', 8),
      t('pin', 9),
      t('sou', 7),
      t('sou', 8),
      t('sou', 9),
      t('wind', 1),
      t('wind', 2),
      t('wind', 3),
    ];

    const deadWall = [
      t('dragon', 1),
      t('dragon', 2),
      t('dragon', 3),
      t('pin', 1),
      t('pin', 2),
      t('pin', 3),
      t('man', 1),
      t('man', 2),
      t('man', 3),
      t('sou', 1),
      t('sou', 2),
      t('sou', 3),
      t('wind', 4),
      t('wind', 4),
    ];

    const dora = [t('man', 5)];

    return { players: [p0, p1, p2, p3], wall, deadWall, dora, turn: 0, kyoku: 1, riichiPool: 0, honba: 0 };
  });

  return { basic, multiCalls, kanVariants, longRiver, allFuro };
})();

export const useGame = (gameLength: GameLength, red = 1) => {
  // ゲーム状態
  const [wall, setWall] = useState<Tile[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [dora, setDora] = useState<Tile[]>([]);
  const [deadWall, setDeadWall] = useState<Tile[]>([]);
  const [playerIsAI, setPlayerIsAI] = useState(false);
  const [advancedAI, setAdvancedAI] = useState(false);
  const [turn, setTurn] = useState(0); // 0:自分, 1-3:AI
  const [phase, setPhase] = useState<GamePhase>('init');
  const [message, setMessage] = useState<string>('');
  const [kyoku, setKyoku] = useState<number>(1); // 東1局など
  const [shanten, setShanten] = useState<{ standard: number; chiitoi: number; kokushi: number }>({ standard: 8, chiitoi: 8, kokushi: 13 });
  const [discardCounts, setDiscardCounts] = useState<Record<string, number>>({});
  const [lastDiscard, setLastDiscard] = useState<{ tile: Tile; player: number; isShonpai: boolean } | null>(null);
  const [callOptions, setCallOptions] = useState<(MeldType | 'pass')[] | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [selfKanOptions, setSelfKanOptions] = useState<Tile[][] | null>(null);
  const [chiTileOptions, setChiTileOptions] = useState<Tile[][] | null>(null);
  const [riichiPool, setRiichiPool] = useState(0);
  const [honba, setHonba] = useState(0);
  const [pendingRiichi, setPendingRiichi] = useState<number | null>(null);
  const [pendingRiichiIndicator, setPendingRiichiIndicator] = useState<number[]>([]);
  const [tsumoOption, setTsumoOption] = useState(false);
  const [ronCandidate, setRonCandidate] = useState<{ tile: Tile; from: number } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [tenhouUrl, setTenhouUrl] = useState<string | null>(null);
  const [boardInput, setBoardInput] = useState('');

  const turnRef = useRef(turn);
  const playersRef = useRef<PlayerState[]>(players);
  const advancedAIRef = useRef(advancedAI);
  const wallRef = useRef<Tile[]>(wall);
  const deadWallRef = useRef<Tile[]>(deadWall);
  const kyokuRef = useRef(kyoku);
  const riichiPoolRef = useRef(riichiPool);
  const honbaRef = useRef(honba);
  const logRef = useRef<LogEntry[]>(log);
  const tsumoOptionRef = useRef(tsumoOption);
  const winResultRef = useRef<WinResult | null>(winResult);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kanDrawRef = useRef<number | null>(null);
  const drawInfoRef = useRef<Record<number, { rinshan: boolean; last: boolean }>>({});
  const pendingRiichiIndicatorRef = useRef<number[]>([]);
  const pendingRiichiRef = useRef<number | null>(null);
  const recordHeadRef = useRef<RecordHead>({
    startTime: 0,
    endTime: 0,
    rule: { gameLength, aka: red },
    players: [],
  });
  const roundStartInfoRef = useRef<RoundStartInfo | null>(null);
  const roundStartHonbaRef = useRef(honba);
  const roundStartKyotakuRef = useRef(riichiPool);
  const startScoresRef = useRef<number[]>([]);
  const endInfoRef = useRef<RoundEndInfo | null>(null);

  const buildTenhouUrl = () => {
    if (!roundStartInfoRef.current || !endInfoRef.current) return null;
    const data = exportTenhouLog(
      roundStartInfoRef.current,
      logRef.current,
      startScoresRef.current,
      endInfoRef.current,
      dora,
      red,
      roundStartHonbaRef.current,
      roundStartKyotakuRef.current,
    );
    return tenhouJsonToUrl(data);
  };

  const clearActionTimer = () => {
    if (actionTimerRef.current !== null) {
      clearTimeout(actionTimerRef.current);
      actionTimerRef.current = null;
    }
  };

  const setActionTimeout = (fn: () => void, delay: number) => {
    clearActionTimer();
    actionTimerRef.current = setTimeout(fn, delay);
  };
  const [preset, setPreset] = useState<keyof typeof boardPresets>('basic');

  useEffect(() => {
    setBoardInput(JSON.stringify(boardPresets[preset], null, 2));
  }, [preset]);

  const togglePlayerAI = () => {
    setPlayerIsAI(prev => {
      const next = !prev;
      setPlayers(ps =>
        ps.map((pl, idx) => (idx === 0 ? { ...pl, isAI: next } : pl)),
      );
      playersRef.current = playersRef.current.map((pl, idx) =>
        idx === 0 ? { ...pl, isAI: next } : pl,
      );
      if (next) {
        if (callOptions && lastDiscard) {
          setActionTimeout(() => {
            const action = chooseAICallOption(
              playersRef.current[0],
              lastDiscard.tile,
              playersRef.current[lastDiscard.player].seat,
            );
            handleCallAction(action);
          }, 500);
        } else if (turnRef.current === 0) {
          setActionTimeout(() => {
            const tile = playersRef.current[0].hand[0];
            handleDiscard(tile.id);
          }, 500);
        }
      }
      return next;
    });
  };

  const toggleAdvancedAI = () => {
    setAdvancedAI(prev => {
      const next = !prev;
      advancedAIRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    advancedAIRef.current = advancedAI;
  }, [advancedAI]);

  useEffect(() => {
    wallRef.current = wall;
  }, [wall]);

  useEffect(() => {
    deadWallRef.current = deadWall;
  }, [deadWall]);

  useEffect(() => {
    kyokuRef.current = kyoku;
  }, [kyoku]);

  useEffect(() => {
    riichiPoolRef.current = riichiPool;
  }, [riichiPool]);

  useEffect(() => {
    honbaRef.current = honba;
  }, [honba]);

  useEffect(() => {
    logRef.current = log;
  }, [log]);

  useEffect(() => {
    tsumoOptionRef.current = tsumoOption;
  }, [tsumoOption]);

  useEffect(() => {
    winResultRef.current = winResult;
  }, [winResult]);

  useEffect(() => {
    pendingRiichiIndicatorRef.current = pendingRiichiIndicator;
  }, [pendingRiichiIndicator]);

  useEffect(() => {
    pendingRiichiRef.current = pendingRiichi;
  }, [pendingRiichi]);

  useEffect(() => {
    playersRef.current = players;
    if (players.length > 0) {
      const s = calcShanten(players[0].hand, players[0].melds.length);
      setShanten(s);
      if (s.standard < 0 && !tsumoOptionRef.current) {
        console.debug('negative shanten without tsumo option', {
          player: players[0],
          hand: players[0].hand,
          melds: players[0].melds,
        });
      }
    }
  }, [players]);

  // ラウンド初期化関数
  const startRound = (
    resetKyoku: boolean,
    roundNumber: number = kyokuRef.current,
  ) => {
    clearActionTimer();
    roundStartHonbaRef.current = honbaRef.current;
    roundStartKyotakuRef.current = riichiPoolRef.current;
    let wallStack = generateTileWall(red);
    let wanpai = wallStack.slice(0, DEAD_WALL_SIZE);
    wallStack = wallStack.slice(DEAD_WALL_SIZE);
    const doraResult = drawDoraIndicator(wanpai, 1);
    const doraTiles = doraResult.dora;
    wanpai = doraResult.wall;
    let p: PlayerState[];
    if (resetKyoku) {
      p = [
        createInitialPlayerState('あなた', playerIsAI, 0),
        createInitialPlayerState('AI下家', true, 1),
        createInitialPlayerState('AI対面', true, 2),
        createInitialPlayerState('AI上家', true, 3),
      ];
    } else {
      p = playersRef.current.map((pl, idx) => ({
        ...pl,
        hand: [],
        discard: [],
        melds: [],
        drawnTile: null,
        isRiichi: false,
        isAI: idx === 0 ? playerIsAI : pl.isAI,
      }));
    }
    for (let i = 0; i < 4; i++) {
      const result = drawTiles(p[i], wallStack, 13);
      p[i] = result.player;
      wallStack = result.wall;
    }
    const dealerIdx = p.findIndex(pl => pl.seat === 0);
    // 親は1枚多く持つ
    const extra = drawTiles(p[dealerIdx], wallStack, 1);
    p[dealerIdx] = extra.player;
    wallStack = extra.wall;
    roundStartInfoRef.current = {
      hands: p.map(pl => [...pl.hand]),
      dealer: dealerIdx,
      doraIndicator: doraTiles[0],
      kyoku: roundNumber,
    };
    setPlayers(p);
    playersRef.current = p;
    startScoresRef.current = p.map(pl => pl.score);
    endInfoRef.current = null;
    setWall(wallStack);
    wallRef.current = wallStack;
    setDeadWall(wanpai);
    deadWallRef.current = wanpai;
    setDora(doraTiles);
    setTurn(dealerIdx);
    setDiscardCounts({});
    setLastDiscard(null);
    setPendingRiichi(null);
    pendingRiichiRef.current = null;
    setTsumoOption(false);
    setRonCandidate(null);
    setRoundResult(null);
    setWinResult(null);
    winResultRef.current = null;
    setTenhouUrl(null);
    if (resetKyoku) {
      setRiichiPool(0);
      setHonba(0);
      honbaRef.current = 0;
      recordHeadRef.current.startTime = Date.now();
      recordHeadRef.current.endTime = 0;
      recordHeadRef.current.rule = { gameLength, aka: red };
      recordHeadRef.current.players = playersRef.current.map(p => ({
        name: p.name,
        seat: p.seat,
        isAI: p.isAI,
      }));
    }
    const firstIsAI = p[dealerIdx].isAI;
    setMessage(
      `配牌が完了しました。${firstIsAI ? 'AIのターンです。' : 'あなたのターンです。'}`,
    );
    setLog([
      { type: 'startRound', kyoku: roundNumber },
      { type: 'draw', player: dealerIdx, tile: extra.player.drawnTile as Tile },
    ]);
    logRef.current = [
      { type: 'startRound', kyoku: roundNumber },
      { type: 'draw', player: dealerIdx, tile: extra.player.drawnTile as Tile },
    ];
    kanDrawRef.current = null;
    drawInfoRef.current = {};
    setPhase('playing');
    turnRef.current = dealerIdx;
    if (firstIsAI) {
      handleAITurn(dealerIdx);
    }
  };

  // 初期化
  useEffect(() => {
    if (phase === 'init') {
      setKyoku(1);
      startRound(true, 1);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'end') {
      recordHeadRef.current.endTime = Date.now();
    }
  }, [phase]);

  const maxKyoku = maxKyokuForLength(gameLength);
  const nextKyoku = (dealerContinues = false) => {
    // If we've reached the final round, always end the game regardless of dealer
    // continuation rules.
    if (kyokuRef.current >= maxKyoku) {
      setPhase('end');
      return;
    }

    if (dealerContinues) {
      setHonba(h => h + 1);
      honbaRef.current += 1;
      startRound(false, kyokuRef.current);
      return;
    }

    setHonba(0);
    honbaRef.current = 0;
    const next = kyokuRef.current + 1;
    if (next > maxKyoku) {
      setPhase('end');
    } else {
      const rotated = rotateSeatNumbers(playersRef.current);
      setPlayers(rotated);
      playersRef.current = rotated;
      setKyoku(next);
      startRound(false, next);
    }
  };

  const handleWallExhaustion = () => {
    const tenpai = playersRef.current.map(p => {
      const s = calcShanten(p.hand, p.melds.length);
      return Math.min(s.standard, s.chiitoi, s.kokushi) === 0;
    });
    const { players: updated, changes } = payoutNoten(playersRef.current, tenpai);
    setPlayers(updated);
    playersRef.current = updated;
    endInfoRef.current = { result: '流局', diffs: changes };
    const results: RoundResult = {
      results: updated.map((p, idx) => ({
        name: p.name,
        score: p.score,
        change: changes[idx],
        isTenpai: tenpai[idx],
      })),
    };
    setRoundResult(results);
    setTenhouUrl(buildTenhouUrl());
    setMessage('牌山が尽きました。流局です。');
  };

  // ツモ処理
  const drawForCurrentPlayer = () => {
    if (wallRef.current.length === 0) {
      handleWallExhaustion();
      return;
    }
    const currentIndex = turnRef.current;
    let p = [...playersRef.current];
    const result = drawTiles(p[currentIndex], wallRef.current, 1);
    p[currentIndex] = result.player;
    setPlayers(p);
    playersRef.current = p;
    setWall(result.wall);
    wallRef.current = result.wall;
    const rinshan = kanDrawRef.current === currentIndex;
    if (rinshan) kanDrawRef.current = null;
    const last = result.wall.length === 0;
    drawInfoRef.current[currentIndex] = { rinshan, last };
    setLog(prev => [...prev, { type: 'draw', player: currentIndex, tile: result.player.drawnTile as Tile }]);
    logRef.current = [...logRef.current, { type: 'draw', player: currentIndex, tile: result.player.drawnTile as Tile }];
    if (last) {
      // postpone exhaustion until after possible win/discard
    }
    const kanOpts = getSelfKanOptions(playersRef.current[currentIndex]);
    if (!playersRef.current[currentIndex].isAI) {
      setSelfKanOptions(kanOpts.length > 0 ? kanOpts : null);
    } else if (kanOpts.length > 0) {
      performSelfKan(currentIndex, kanOpts[0]);
      return;
    }
    if (isWinningHand(p[currentIndex].hand, p[currentIndex].melds)) {
      const seatWind = p[currentIndex].seat + 1;
      const roundWind = kyokuRef.current <= 4 ? 1 : 2;
      const yaku = detectYaku(p[currentIndex].hand, p[currentIndex].melds, {
        isTsumo: true,
        seatWind,
        roundWind,
      });
      const hasBaseYaku = yaku.some(y => y.name !== 'Ura Dora');
      if (hasBaseYaku) {
        if (p[currentIndex].isAI || currentIndex !== 0) {
          performTsumo(currentIndex);
          return;
        } else {
          setTsumoOption(true);
          return;
        }
      }
    }
    if (
      playersRef.current[currentIndex].isRiichi &&
      !playersRef.current[currentIndex].isAI &&
      kanOpts.length === 0
    ) {
      handleDiscard(p[currentIndex].drawnTile!.id);
      return;
    }
    if (last) {
      handleWallExhaustion();
      return;
    }

  };

  // 捨て牌処理（自分／AI共通）
  const handleDiscard = (tileId: string) => {
    const idx = turnRef.current;
    let p = [...playersRef.current];
    const tile = p[idx].hand.find(t => t.id === tileId);
    if (!tile) return;
    const err = validateDiscard(p[idx], tileId, pendingRiichiRef.current === idx);
    if (err) {
      setMessage(err);
      return;
    }
    setSelfKanOptions(null);
    setChiTileOptions(null);
    if (pendingRiichiRef.current !== idx && p[idx].ippatsu) {
      p[idx] = clearIppatsu(p[idx]);
    }
    const result = incrementDiscardCount(discardCounts, tile);
    setDiscardCounts(result.record);
    setLastDiscard({ tile, player: idx, isShonpai: result.isShonpai });
    const shouldMarkRiichi = shouldRotateRiichi(
      idx,
      pendingRiichiRef.current,
      pendingRiichiIndicatorRef.current,
    );
    if (pendingRiichiRef.current === idx) {
      setLog(prev => [...prev, { type: 'riichi', player: idx, tile }]);
      logRef.current = [...logRef.current, { type: 'riichi', player: idx, tile }];
    }
    p[idx] = discardTile(p[idx], tileId, shouldMarkRiichi);
    if (shouldMarkRiichi && pendingRiichiIndicatorRef.current.includes(idx)) {
      setPendingRiichiIndicator(prev => prev.filter(s => s !== idx));
    }
    setPlayers(p);
    playersRef.current = p;
    setLog(prev => appendDiscardLog(prev, idx, tile));
    logRef.current = appendDiscardLog(logRef.current, idx, tile);
    const roundWind = kyokuRef.current <= 4 ? 1 : 2;
    const ronTile = p[idx].drawnTile ?? tile;
    const winIdx = findRonWinner(p, idx, ronTile, roundWind);
    if (winIdx !== null) {
      if (p[winIdx].isAI || winIdx !== 0) {
        performRon(winIdx, idx, tile);
        return;
      } else {
        setRonCandidate({ tile, from: idx });
        return;
      }
    }
    if (pendingRiichiRef.current === idx) {
      p[idx] = { ...p[idx], score: p[idx].score - 1000, ippatsu: true };
      setRiichiPool(prev => prev + 1);
      setPendingRiichi(null);
      pendingRiichiRef.current = null;
      setPlayers(p);
      playersRef.current = p;
    }
    const info = drawInfoRef.current[idx];
    drawInfoRef.current[idx] = { rinshan: false, last: false };
    if (info?.last) {
      handleWallExhaustion();
      return;
    }
    if (idx !== 0 && !playersRef.current[0].isAI) {
      let options = getValidCallOptions(p[0], tile);
      options = filterChiOptions(
        options,
        playersRef.current[0].seat,
        playersRef.current[idx].seat,
      );
      const hasAction = options.some(o => o !== 'pass');
      if (!hasAction) {
        setCallOptions(null);
        setLastDiscard(null);
        nextTurn();
      } else {
        setCallOptions(options);
      }
    } else {
      nextTurn();
    }
  };


const handleCallAction = (action: MeldType | 'pass') => {
  if (!lastDiscard) return;
  if (!canCallMeld(playersRef.current[0])) {
    setCallOptions(null);
    setLastDiscard(null);
    return;
  }
  if (action === 'pass') {
    setCallOptions(null);
    setLastDiscard(null);
    setSelfKanOptions(null);
    setChiTileOptions(null);
    nextTurn();
    return;
  }
  const caller = 0;
  const discarder = lastDiscard.player;
  let p = [...playersRef.current];
  p = p.map(pl => clearIppatsu(pl));
  if (action === 'chi') {
    const options = getChiOptions(p[caller], lastDiscard.tile);
    if (options.length > 1 && !chiTileOptions) {
      setChiTileOptions(options);
      setCallOptions(['pass']);
      return;
    }
  }
  const meldTiles = selectMeldTiles(p[caller], lastDiscard.tile, action);
  if (!meldTiles) {
    setCallOptions(null);
    setLastDiscard(null);
    nextTurn();
    return;
    }
  p[discarder] = removeDiscardTile(p[discarder], lastDiscard.tile.id);
  if (lastDiscard.tile.riichiDiscard) {
    setPendingRiichiIndicator(prev => Array.from(new Set([...prev, discarder])));
  }
  p[caller] = claimMeld(
    p[caller],
    [...meldTiles, lastDiscard.tile],
    action,
    discarder,
    lastDiscard.tile.id,
    action === 'kan' ? 'daiminkan' : undefined,
  );
  setPlayers(p);
  playersRef.current = p;
  setLog(prev => [
    ...prev,
    {
      type: 'meld',
      player: caller,
      tiles: [...meldTiles, lastDiscard.tile],
      meldType: action,
      from: discarder,
      kanType: action === 'kan' ? 'daiminkan' : undefined,
    },
  ]);
  logRef.current = [
    ...logRef.current,
    {
      type: 'meld',
      player: caller,
      tiles: [...meldTiles, lastDiscard.tile],
      meldType: action,
      from: discarder,
    },
  ];

  if (action === 'kan') {
    kanDrawRef.current = caller;
  }

  if (action === 'kan') {
    const doraResult = drawDoraIndicator(deadWallRef.current, 1);
    setDora(prev => [...prev, ...doraResult.dora]);
    setDeadWall(doraResult.wall);
    deadWallRef.current = doraResult.wall;
      turnRef.current = caller;
      drawForCurrentPlayer();
    }

  setCallOptions(null);
  setLastDiscard(null);
  setSelfKanOptions(null);
  setChiTileOptions(null);
  setTurn(caller);
  turnRef.current = caller;
};

  const performSelfKan = (caller: number, tiles: Tile[]) => {
    if (!canCallMeld(playersRef.current[caller])) return;
    let p = playersRef.current.map(pl => clearIppatsu(pl));
    p = [...p];

    let from = caller;
    let calledId = tiles[0].id;
    let kanType: 'ankan' | 'kakan' = 'ankan';

    const suit = tiles[0].suit;
    const rank = tiles[0].rank;
    const ponIndex = p[caller].melds.findIndex(
      m =>
        m.type === 'pon' &&
        m.tiles.every(t => t.suit === suit && t.rank === rank),
    );

    if (ponIndex >= 0) {
      const pon = p[caller].melds[ponIndex];
      from = pon.fromPlayer;
      calledId = pon.calledTileId;
      p[caller] = { ...p[caller], melds: p[caller].melds.filter((_, i) => i !== ponIndex) };
      kanType = 'kakan';
    }

    const ordered = [...tiles];
    const idx = ordered.findIndex(t => t.id === calledId);
    if (idx >= 0) {
      const calledTile = ordered.splice(idx, 1)[0];
      ordered.push(calledTile);
    }
    p[caller] = claimMeld(p[caller], ordered, 'kan', from, calledId, kanType);

    setPlayers(p);
    playersRef.current = p;
    setLog(prev => [
      ...prev,
      { type: 'meld', player: caller, tiles: ordered, meldType: 'kan', from, kanType },
    ]);
    logRef.current = [
      ...logRef.current,
      { type: 'meld', player: caller, tiles: ordered, meldType: 'kan', from, kanType },
    ];

    kanDrawRef.current = caller;

    const doraResult = drawDoraIndicator(deadWallRef.current, 1);
    setDora(prev => [...prev, ...doraResult.dora]);
    setDeadWall(doraResult.wall);
    deadWallRef.current = doraResult.wall;
    turnRef.current = caller;
    drawForCurrentPlayer();
  };

  const performAICall = (caller: number, action: MeldType) => {
    if (!lastDiscard) return;
    if (!canCallMeld(playersRef.current[caller])) return;
    const discarder = lastDiscard.player;
    let p = playersRef.current.map(pl => clearIppatsu(pl));
    p = [...p];
    const meldTiles = selectMeldTiles(p[caller], lastDiscard.tile, action);
    if (!meldTiles) return;
    p[discarder] = removeDiscardTile(p[discarder], lastDiscard.tile.id);
    if (lastDiscard.tile.riichiDiscard) {
      setPendingRiichiIndicator(prev => Array.from(new Set([...prev, discarder])));
    }
    p[caller] = claimMeld(
      p[caller],
      [...meldTiles, lastDiscard.tile],
      action,
      discarder,
      lastDiscard.tile.id,
      action === 'kan' ? 'daiminkan' : undefined,
    );
    setPlayers(p);
    playersRef.current = p;
    setLog(prev => [
      ...prev,
      {
        type: 'meld',
        player: caller,
        tiles: [...meldTiles, lastDiscard.tile],
        meldType: action,
        from: discarder,
        kanType: action === 'kan' ? 'daiminkan' : undefined,
      },
    ]);
    logRef.current = [
      ...logRef.current,
      {
        type: 'meld',
        player: caller,
        tiles: [...meldTiles, lastDiscard.tile],
        meldType: action,
        from: discarder,
        kanType: action === 'kan' ? 'daiminkan' : undefined,
      },
    ];
    setMessage(`${p[caller].name} が ${action}しました。`);

    if (action === 'kan') {
      const doraResult = drawDoraIndicator(deadWallRef.current, 1);
      setDora(prev => [...prev, ...doraResult.dora]);
      setDeadWall(doraResult.wall);
      deadWallRef.current = doraResult.wall;
      turnRef.current = caller;
      drawForCurrentPlayer();
    }

    setLastDiscard(null);
    setTurn(caller);
    turnRef.current = caller;
    setActionTimeout(() => {
      const tile = playersRef.current[caller].hand[0];
      handleDiscard(tile.id);
    }, 500);
  };

  const performTsumo = (idx: number) => {
    clearActionTimer();
    const p = [...playersRef.current];
    let ura: Tile[] = [];
    if (p[idx].isRiichi) {
      const uraRes = drawDoraIndicator(deadWallRef.current, dora.length);
      ura = uraRes.dora;
      setDeadWall(uraRes.wall);
      deadWallRef.current = uraRes.wall;
    }
    const info = drawInfoRef.current[idx];
    drawInfoRef.current[idx] = { rinshan: false, last: false };
    const seatWind = p[idx].seat + 1;
    const roundWind = kyokuRef.current <= 4 ? 1 : 2;
    const yaku = detectYaku(p[idx].hand, p[idx].melds, {
      isTsumo: true,
      isRiichi: p[idx].isRiichi,
      doubleRiichi: p[idx].doubleRiichi,
      ippatsu: p[idx].ippatsu,
      rinshan: info?.rinshan,
      haitei: info?.last,
      seatWind,
      roundWind,
      uraDoraIndicators: ura,
    });
    const baseYaku = yaku.filter(y => y.name !== 'Ura Dora');
    if (baseYaku.length === 0) {
      if (idx === 0) setMessage('役なし');
      return;
    }
    const { han, fu } = calculateScore(
      p[idx].hand,
      p[idx].melds,
      yaku,
      dora,
      { seatWind, roundWind, winType: 'tsumo' },
    );
    const points = calcRoundedScore(han, fu, seatWind === 1, 'tsumo');
    const childPts = calcRoundedScore(han, fu, seatWind === 1, 'tsumo');
    const dealerPts = calcRoundedScore(han, fu, true, 'tsumo');
    const dealerIdx = p.findIndex(pl => pl.seat === 0);
    let newPlayers = payoutTsumo(
      p,
      idx,
      childPts,
      dealerPts,
      dealerIdx,
      honbaRef.current,
    ).map((pl, i) =>
      i === idx ? { ...pl, ippatsu: false } : pl,
    );
    if (riichiPoolRef.current > 0) {
      newPlayers = newPlayers.map((pl, i) =>
        i === idx ? { ...pl, score: pl.score + riichiPoolRef.current * 1000 } : pl,
      );
      setRiichiPool(0);
      riichiPoolRef.current = 0;
    }
    setPlayers(newPlayers);
    playersRef.current = newPlayers;
    endInfoRef.current = {
      result: '和了',
      diffs: newPlayers.map((pl, i) => pl.score - startScoresRef.current[i]),
      winner: idx,
      loser: idx,
      uraDora: ura,
      han,
      fu,
      seatWind,
      winType: 'tsumo',
      yakuList: yaku,
    };
    setLog(prev => [...prev, { type: 'tsumo', player: idx, tile: p[idx].drawnTile as Tile }]);
    logRef.current = [...logRef.current, { type: 'tsumo', player: idx, tile: p[idx].drawnTile as Tile }];
    setMessage(`${p[idx].name} の和了！`);
    setTsumoOption(false);
    setWinResult({
      players: newPlayers,
      winner: idx,
      winType: 'tsumo',
      hand: p[idx].hand,
      melds: p[idx].melds,
      winTile: p[idx].drawnTile as Tile,
      yaku: yaku.map(y => y.name),
      han,
      fu,
      points,
      dora,
      uraDora: ura,
    });
    setTenhouUrl(buildTenhouUrl());
  };

  const performRon = (winner: number, from: number, tile: Tile) => {
    clearActionTimer();
    const p = [...playersRef.current];
    let ura: Tile[] = [];
    if (p[winner].isRiichi) {
      const uraRes = drawDoraIndicator(deadWallRef.current, dora.length);
      ura = uraRes.dora;
      setDeadWall(uraRes.wall);
      deadWallRef.current = uraRes.wall;
    }
    const fromInfo = drawInfoRef.current[from];
    drawInfoRef.current[from] = { rinshan: false, last: false };
    const prev = logRef.current[logRef.current.length - 1];
    const chankan = isChankan(prev, from, tile);
    const seatWind = p[winner].seat + 1;
    const roundWind = kyokuRef.current <= 4 ? 1 : 2;
    const yaku = detectYaku([...p[winner].hand, tile], p[winner].melds, {
      isTsumo: false,
      isRiichi: p[winner].isRiichi,
      doubleRiichi: p[winner].doubleRiichi,
      ippatsu: p[winner].ippatsu,
      chankan,
      houtei: fromInfo?.last,
      seatWind,
      roundWind,
      uraDoraIndicators: ura,
    });
    const baseYaku = yaku.filter(y => y.name !== 'Ura Dora');
    if (baseYaku.length === 0) {
      if (winner === 0) setMessage('役なし');
      return;
    }
    const { han, fu, points } = calculateScore(
      [...p[winner].hand, tile],
      p[winner].melds,
      yaku,
      dora,
      { seatWind, roundWind, winType: 'ron' },
    );
    let updated = payoutRon(p, winner, from, points, honbaRef.current).map((pl, i) =>
      i === winner ? { ...pl, ippatsu: false } : pl,
    );
    if (riichiPoolRef.current > 0) {
      updated = updated.map((pl, i) =>
        i === winner ? { ...pl, score: pl.score + riichiPoolRef.current * 1000 } : pl,
      );
      setRiichiPool(0);
      riichiPoolRef.current = 0;
    }
    setPlayers(updated);
    playersRef.current = updated;
    endInfoRef.current = {
      result: '和了',
      diffs: updated.map((pl, i) => pl.score - startScoresRef.current[i]),
      winner,
      loser: from,
      uraDora: ura,
      han,
      fu,
      seatWind,
      winType: 'ron',
      yakuList: yaku,
    };
    setLog(prev => [...prev, { type: 'ron', player: winner, tile, from }]);
    logRef.current = [...logRef.current, { type: 'ron', player: winner, tile, from }];
    setMessage(`${p[winner].name} のロン！`);
    setWinResult({
      players: updated,
      winner,
      winType: 'ron',
      hand: p[winner].hand,
      melds: p[winner].melds,
      winTile: tile,
      yaku: yaku.map(y => y.name),
      han,
      fu,
      points,
      dora,
      uraDora: ura,
    });
    setTenhouUrl(buildTenhouUrl());
  };

  const performRiichi = (idx: number) => {
    let p = [...playersRef.current];
    const isDouble = playersRef.current.every(pl => pl.discard.length === 0);
    p[idx] = declareRiichi(p[idx], isDouble);
    setPlayers(p);
    playersRef.current = p;
    setPendingRiichi(idx);
    pendingRiichiRef.current = idx;
  };

  const handleRiichi = () => {
    performRiichi(0);
    setMessage('リーチする牌を選んでください');
  };

  const handleSelfKan = (tiles: Tile[]) => {
    if (!canCallMeld(playersRef.current[0])) return;
    setSelfKanOptions(null);
    performSelfKan(0, tiles);
  };

  const handleChiSelect = (tiles: Tile[]) => {
    if (!lastDiscard) return;
    if (!canCallMeld(playersRef.current[0])) return;
    const caller = 0;
    const discarder = lastDiscard.player;
    let p = [...playersRef.current];
  p[discarder] = removeDiscardTile(p[discarder], lastDiscard.tile.id);
  if (lastDiscard.tile.riichiDiscard) {
    setPendingRiichiIndicator(prev => Array.from(new Set([...prev, discarder])));
  }
  p[caller] = claimMeld(
    p[caller],
    [...tiles, lastDiscard.tile],
    'chi',
    discarder,
    lastDiscard.tile.id,
  );
  setPlayers(p);
  playersRef.current = p;
  setLog(prev => [
    ...prev,
    { type: 'meld', player: caller, tiles: [...tiles, lastDiscard.tile], meldType: 'chi', from: discarder },
  ]);
  logRef.current = [
    ...logRef.current,
    { type: 'meld', player: caller, tiles: [...tiles, lastDiscard.tile], meldType: 'chi', from: discarder },
  ];
    setCallOptions(null);
    setLastDiscard(null);
    setChiTileOptions(null);
    setSelfKanOptions(null);
    setTurn(caller);
    turnRef.current = caller;
  };

  const handleTsumo = () => {
    performTsumo(0);
  };

  const handleTsumoPass = () => {
    setTsumoOption(false);
  };

  const handleRon = () => {
    if (!ronCandidate) return;
    const { tile, from } = ronCandidate;
    setRonCandidate(null);
    performRon(0, from, tile);
  };

  const handleRonPass = () => {
    if (!ronCandidate) return;
    const { tile, from } = ronCandidate;
    setRonCandidate(null);
    if (turnRef.current !== from) return; // safety
    if (!playersRef.current[0].isAI) {
      let options = getValidCallOptions(playersRef.current[0], tile);
      options = filterChiOptions(
        options,
        playersRef.current[0].seat,
        playersRef.current[from].seat,
      );
      const hasAction = options.some(o => o !== 'pass');
      if (!hasAction) {
        setCallOptions(null);
        setLastDiscard(null);
        nextTurn();
      } else {
        setCallOptions(options);
      }
    } else {
      nextTurn();
    }
  };

  // ターン進行
  const handleAITurn = (ai: number) => {
    if (winResultRef.current) return;
    if (lastDiscard && lastDiscard.player !== ai) {
      const action = chooseAICallOption(
        playersRef.current[ai],
        lastDiscard.tile,
        playersRef.current[lastDiscard.player].seat,
      );
      if (action !== 'pass') {
        performAICall(ai, action);
        return;
      }
      setLastDiscard(null);
    }
    drawForCurrentPlayer();
    if (winResultRef.current) return;
    if (wallRef.current.length === 0) return;
    if (canDeclareRiichi(playersRef.current[ai])) {
      performRiichi(ai);
      setMessage(`${playersRef.current[ai].name} がリーチしました。`);
    }
    setActionTimeout(() => {
      const tile = chooseAIDiscardTile(
        playersRef.current[ai],
        pendingRiichiRef.current === ai,
        { advanced: advancedAIRef.current },
      );
      handleDiscard(tile.id);
    }, 500);
  };

  const nextTurn = () => {
    setTsumoOption(false);
    setRonCandidate(null);
    let next = (turnRef.current + 1) % 4;
    setTurn(next);
    setActionTimeout(() => {
      if (playersRef.current[next].isAI) {
        handleAITurn(next);
      } else {
        drawForCurrentPlayer();
      }
    }, 500);
  };

  // リセット
  const handleRestart = () => {
    // Start a completely new game with fresh scores
    clearActionTimer();
    setKyoku(1);
    startRound(true, 1);
  };

  const handleDownloadLog = () => {
    const record = exportLqRecord(logRef.current, recordHeadRef.current);
    const data = JSON.stringify(record, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.lq.GameDetailRecords';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMjaiLog = () => {
    if (!roundStartInfoRef.current) return;
    const lines = exportMjaiRecord(
      logRef.current,
      roundStartInfoRef.current,
      playersRef.current.map(p => p.score),
    );
    const blob = new Blob([lines.join('\n')], { type: 'application/jsonl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.mjai.jsonl';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTenhouLog = () => {
    if (!roundStartInfoRef.current || !endInfoRef.current) return;
    const data = exportTenhouLog(
      roundStartInfoRef.current,
      logRef.current,
      startScoresRef.current,
      endInfoRef.current,
      dora,
      red,
      roundStartHonbaRef.current,
      roundStartKyotakuRef.current,
    );
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'log.tenhou.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTenhouLog = async () => {
    if (!roundStartInfoRef.current || !endInfoRef.current) return;
    const data = exportTenhouLog(
      roundStartInfoRef.current,
      logRef.current,
      startScoresRef.current,
      endInfoRef.current,
      dora,
      red,
      roundStartHonbaRef.current,
      roundStartKyotakuRef.current,
    );
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setMessage('Tenhouログをコピーしました');
    toast.success('Tenhouログをコピーしました');
  };

  const handleLoadBoard = () => {
    try {
      clearActionTimer();
      const data: BoardData = JSON.parse(boardInput);
      setPlayers(data.players);
      playersRef.current = data.players;
      setWall(data.wall);
      wallRef.current = data.wall;
      setDeadWall(data.deadWall);
      deadWallRef.current = data.deadWall;
      setDora(data.dora);
      setTurn(data.turn);
      turnRef.current = data.turn;
      setKyoku(data.kyoku);
      kyokuRef.current = data.kyoku;
      setRiichiPool(data.riichiPool);
      riichiPoolRef.current = data.riichiPool;
      roundStartKyotakuRef.current = data.riichiPool;
      setHonba(data.honba);
      honbaRef.current = data.honba;
      roundStartHonbaRef.current = data.honba;
      setCallOptions(null);
      setLastDiscard(null);
      setSelfKanOptions(null);
      setChiTileOptions(null);
      setPendingRiichi(null);
      pendingRiichiRef.current = null;
      setTsumoOption(false);
      setRonCandidate(null);
      setRoundResult(null);
      setWinResult(null);
      setLog([]);
      logRef.current = [];
      setPhase('playing');
      setMessage('盤面を読み込みました');
    } catch (e) {
      setMessage('盤面の読み込みに失敗しました');
    }
  };

  return {
    wall,
    players,
    dora,
    deadWall,
    playerIsAI,
    turn,
    phase,
    message,
    kyoku,
    shanten,
    discardCounts,
    lastDiscard,
    callOptions,
    roundResult,
    winResult,
    selfKanOptions,
    chiTileOptions,
    riichiPool,
    honba,
    pendingRiichi,
    pendingRiichiIndicator,
    tsumoOption,
    ronCandidate,
    log,
    tenhouUrl,
    preset,
    boardInput,
    advancedAI,
    setWinResult,
    setRoundResult,
    setPreset,
    setBoardInput,
    togglePlayerAI,
    toggleAdvancedAI,
    handleDiscard,
    handleCallAction,
    handleRiichi,
    handleSelfKan,
    handleChiSelect,
    handleTsumo,
    handleTsumoPass,
    handleRon,
    handleRonPass,
    handleAITurn,
    nextTurn,
    nextKyoku,
    handleRestart,
    handleDownloadLog,
    handleDownloadMjaiLog,
    handleDownloadTenhouLog,
    handleCopyTenhouLog,
    handleLoadBoard,
  };
};
