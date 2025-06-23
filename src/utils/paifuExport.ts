import { LogEntry } from '../types/mahjong';

export function logToJSON(log: LogEntry[]): string {
  return JSON.stringify(log, null, 2);
}
