import { LogEntry, RoundStartInfo, Tile } from '../types/mahjong';

function tileToMjai(tile: Tile): string {
  switch (tile.suit) {
    case 'man':
      return `${tile.rank}m`;
    case 'pin':
      return `${tile.rank}p`;
    case 'sou':
      return `${tile.rank}s`;
    case 'wind':
      return ['E', 'S', 'W', 'N'][tile.rank - 1];
    case 'dragon':
      return ['P', 'F', 'C'][tile.rank - 1];
    default:
      return '';
  }
}

export function exportMjaiRecord(
  log: LogEntry[],
  round: RoundStartInfo,
  scores: number[],
): string[] {
  const events: any[] = [];
  events.push({ type: 'start_game' });
  events.push({
    type: 'start_kyoku',
    bakaze: 'E',
    dora_marker: tileToMjai(round.doraIndicator),
    kyoku: round.kyoku,
    honba: 0,
    kyotaku: 0,
    oya: round.dealer,
    scores,
    tehais: round.hands.map(h => h.map(tileToMjai)),
  });

  for (const entry of log) {
    switch (entry.type) {
      case 'draw':
        events.push({
          type: 'tsumo',
          actor: entry.player,
          pai: tileToMjai(entry.tile),
        });
        break;
      case 'discard':
        events.push({
          type: 'dahai',
          actor: entry.player,
          pai: tileToMjai(entry.tile),
          tsumogiri: false,
        });
        break;
      case 'meld': {
        const called = tileToMjai(entry.tiles[entry.tiles.length - 1]);
        const consumed = entry.tiles
          .slice(0, entry.tiles.length - 1)
          .map(tileToMjai);
        if (entry.meldType === 'chi') {
          events.push({
            type: 'chi',
            actor: entry.player,
            target: entry.from,
            pai: called,
            consumed,
          });
        } else if (entry.meldType === 'pon') {
          events.push({
            type: 'pon',
            actor: entry.player,
            target: entry.from,
            pai: called,
            consumed,
          });
        } else {
          events.push({
            type: entry.kanType ?? 'ankan',
            actor: entry.player,
            target: entry.from,
            pai: called,
            consumed,
          });
        }
        break;
      }
      case 'riichi':
        events.push({ type: 'reach', actor: entry.player });
        events.push({
          type: 'dahai',
          actor: entry.player,
          pai: tileToMjai(entry.tile),
          tsumogiri: true,
        });
        events.push({ type: 'reach_accepted', actor: entry.player });
        break;
      case 'tsumo':
        events.push({
          type: 'hora',
          actor: entry.player,
          target: entry.player,
          pai: tileToMjai(entry.tile),
        });
        break;
      case 'ron':
        events.push({
          type: 'hora',
          actor: entry.player,
          target: entry.from,
          pai: tileToMjai(entry.tile),
        });
        break;
    }
  }
  return events.map(e => JSON.stringify(e));
}
