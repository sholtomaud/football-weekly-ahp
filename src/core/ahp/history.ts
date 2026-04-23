/**
 * Session History — localStorage manager
 *
 * Persists each completed AHP analysis as a session record.
 * Max 50 sessions stored; oldest are pruned.
 */

import type { AHPResult } from './ahp.ts';

export interface SessionRecord {
  id: string;
  timestamp: number;
  sliderValues: number[];
  matchCount: number;
  result: AHPResult;
}

const STORAGE_KEY = 'fwahp_sessions';
const MAX_SESSIONS = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function saveSession(sliderValues: number[], result: AHPResult): SessionRecord {
  const record: SessionRecord = {
    id: generateId(),
    timestamp: Date.now(),
    sliderValues: [...sliderValues],
    matchCount: sliderValues.length,
    result,
  };

  const sessions = loadSessions();
  sessions.unshift(record);

  // Prune oldest if over limit
  const pruned = sessions.slice(0, MAX_SESSIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  } catch {
    // localStorage may be unavailable (private mode, storage full)
    console.warn('[fwahp] Could not save session to localStorage');
  }

  return record;
}

export function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export function clearSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function deleteSession(id: string): void {
  const sessions = loadSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 30)  return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
