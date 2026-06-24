/**
 * Pure in-memory database using simple JS objects.
 * Works on any platform — no native compilation needed.
 * Data resets on server restart (acceptable for demo/free tier).
 */

import {
  AiPick, FeedEvent, Game, SavedPick, PlayerStat,
  InsertAiPick, InsertFeedEvent, InsertGame, InsertSavedPick, InsertPlayerStat,
} from "@shared/schema";

let pickId = 1;
let feedId = 1;
let gameId = 1;
let savedId = 1;
let statId = 1;

const picks: AiPick[] = [];
const feed: FeedEvent[] = [];
const gameList: Game[] = [];
const savedList: SavedPick[] = [];
const statList: PlayerStat[] = [];

export const db = {
  // AI Picks
  insertPick(p: InsertAiPick): AiPick {
    const row: AiPick = { id: pickId++, ...p } as AiPick;
    picks.unshift(row);
    return row;
  },
  getPick(id: number): AiPick | undefined {
    return picks.find(p => p.id === id);
  },
  getPicks(sport?: string, limit = 50): AiPick[] {
    const filtered = sport ? picks.filter(p => p.sport === sport) : picks;
    return filtered.slice(0, limit);
  },
  getTopPicksBySport(sport: string, limit: number): AiPick[] {
    return picks
      .filter(p => p.sport === sport && p.status === "pending")
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  },
  updatePickStatus(id: number, status: string): void {
    const p = picks.find(p => p.id === id);
    if (p) p.status = status;
  },

  // Feed
  insertFeed(e: InsertFeedEvent): FeedEvent {
    const row: FeedEvent = { id: feedId++, ...e } as FeedEvent;
    feed.unshift(row);
    return row;
  },
  getFeed(limit = 50, since?: number): FeedEvent[] {
    const filtered = since ? feed.filter(e => e.createdAt >= since) : feed;
    return filtered.slice(0, limit);
  },

  // Games
  insertGame(g: InsertGame): Game {
    const row: Game = { id: gameId++, ...g } as Game;
    gameList.push(row);
    return row;
  },
  getGames(sport?: string): Game[] {
    return sport ? gameList.filter(g => g.sport === sport) : [...gameList];
  },
  updateGame(id: number, homeScore: number, awayScore: number, status: string, inning?: string): void {
    const g = gameList.find(g => g.id === id);
    if (g) { g.homeScore = homeScore; g.awayScore = awayScore; g.status = status; g.inning = inning ?? null; }
  },

  // Saved
  insertSaved(pickId: number): SavedPick {
    const row: SavedPick = { id: savedId++, pickId, savedAt: Date.now() };
    savedList.push(row);
    return row;
  },
  isSaved(pickId: number): boolean {
    return !!savedList.find(s => s.pickId === pickId);
  },
  unsave(pickId: number): void {
    const i = savedList.findIndex(s => s.pickId === pickId);
    if (i >= 0) savedList.splice(i, 1);
  },
  getSaved(): (AiPick & { savedAt: number })[] {
    return savedList.map(s => {
      const p = picks.find(p => p.id === s.pickId);
      return p ? { ...p, savedAt: s.savedAt } : null;
    }).filter(Boolean) as (AiPick & { savedAt: number })[];
  },

  // Stats
  upsertStat(stat: InsertPlayerStat): void {
    const existing = statList.find(s => s.player === stat.player && s.stat === stat.stat);
    if (existing) {
      Object.assign(existing, stat);
    } else {
      statList.push({ id: statId++, ...stat } as PlayerStat);
    }
  },
  getStats(sport?: string): PlayerStat[] {
    return sport ? statList.filter(s => s.sport === sport) : [...statList];
  },
};
