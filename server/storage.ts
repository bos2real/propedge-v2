import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and, gte } from "drizzle-orm";
import {
  aiPicks, feedEvents, games, savedPicks, playerStats,
  InsertAiPick, InsertFeedEvent, InsertGame, InsertSavedPick, InsertPlayerStat,
  AiPick, FeedEvent, Game, SavedPick, PlayerStat,
} from "@shared/schema";

const sqlite = new Database("propedge.db");
const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS ai_picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sport TEXT NOT NULL,
    player TEXT NOT NULL,
    team TEXT NOT NULL,
    opponent TEXT NOT NULL,
    market TEXT NOT NULL,
    line REAL NOT NULL,
    side TEXT NOT NULL,
    confidence REAL NOT NULL,
    ev REAL NOT NULL,
    edge TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    game_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS feed_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    sport TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    meta TEXT NOT NULL DEFAULT '{}',
    urgent INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sport TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    game_time TEXT NOT NULL,
    home_odds TEXT NOT NULL DEFAULT '-110',
    away_odds TEXT NOT NULL DEFAULT '-110',
    over_under REAL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    home_score INTEGER,
    away_score INTEGER,
    inning TEXT
  );
  CREATE TABLE IF NOT EXISTS saved_picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pick_id INTEGER NOT NULL,
    saved_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sport TEXT NOT NULL,
    player TEXT NOT NULL,
    team TEXT NOT NULL,
    stat TEXT NOT NULL,
    average REAL NOT NULL,
    last_5 REAL NOT NULL,
    last_10 REAL NOT NULL,
    trend TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

export interface IStorage {
  // AI Picks
  getAiPicks(sport?: string, limit?: number): AiPick[];
  getAiPickById(id: number): AiPick | undefined;
  createAiPick(pick: InsertAiPick): AiPick;
  updatePickStatus(id: number, status: string): void;
  getTopPicksBySport(sport: string, limit: number): AiPick[];

  // Feed Events
  getFeedEvents(limit?: number, since?: number): FeedEvent[];
  createFeedEvent(event: InsertFeedEvent): FeedEvent;

  // Games
  getGames(sport?: string): Game[];
  createGame(game: InsertGame): Game;
  updateGameScore(id: number, homeScore: number, awayScore: number, status: string, inning?: string): void;

  // Saved Picks
  getSavedPicks(): (AiPick & { savedAt: number })[];
  savePick(pickId: number): SavedPick;
  unsavePick(pickId: number): void;
  isPickSaved(pickId: number): boolean;

  // Player Stats
  getPlayerStats(sport?: string): PlayerStat[];
  upsertPlayerStat(stat: InsertPlayerStat): void;
}

export class Storage implements IStorage {
  getAiPicks(sport?: string, limit = 50): AiPick[] {
    if (sport) {
      return db.select().from(aiPicks).where(eq(aiPicks.sport, sport)).orderBy(desc(aiPicks.createdAt)).limit(limit).all();
    }
    return db.select().from(aiPicks).orderBy(desc(aiPicks.createdAt)).limit(limit).all();
  }

  getAiPickById(id: number): AiPick | undefined {
    return db.select().from(aiPicks).where(eq(aiPicks.id, id)).get();
  }

  createAiPick(pick: InsertAiPick): AiPick {
    return db.insert(aiPicks).values(pick).returning().get();
  }

  updatePickStatus(id: number, status: string): void {
    db.update(aiPicks).set({ status }).where(eq(aiPicks.id, id)).run();
  }

  getTopPicksBySport(sport: string, limit: number): AiPick[] {
    return db.select().from(aiPicks)
      .where(and(eq(aiPicks.sport, sport), eq(aiPicks.status, "pending")))
      .orderBy(desc(aiPicks.confidence))
      .limit(limit).all();
  }

  getFeedEvents(limit = 50, since?: number): FeedEvent[] {
    if (since) {
      return db.select().from(feedEvents)
        .where(gte(feedEvents.createdAt, since))
        .orderBy(desc(feedEvents.createdAt)).limit(limit).all();
    }
    return db.select().from(feedEvents).orderBy(desc(feedEvents.createdAt)).limit(limit).all();
  }

  createFeedEvent(event: InsertFeedEvent): FeedEvent {
    return db.insert(feedEvents).values(event).returning().get();
  }

  getGames(sport?: string): Game[] {
    if (sport) {
      return db.select().from(games).where(eq(games.sport, sport)).all();
    }
    return db.select().from(games).all();
  }

  createGame(game: InsertGame): Game {
    return db.insert(games).values(game).returning().get();
  }

  updateGameScore(id: number, homeScore: number, awayScore: number, status: string, inning?: string): void {
    db.update(games).set({ homeScore, awayScore, status, inning: inning ?? null }).where(eq(games.id, id)).run();
  }

  getSavedPicks(): (AiPick & { savedAt: number })[] {
    const saved = db.select().from(savedPicks).all();
    return saved.map(s => {
      const pick = this.getAiPickById(s.pickId);
      if (!pick) return null;
      return { ...pick, savedAt: s.savedAt };
    }).filter(Boolean) as (AiPick & { savedAt: number })[];
  }

  savePick(pickId: number): SavedPick {
    return db.insert(savedPicks).values({ pickId, savedAt: Date.now() }).returning().get();
  }

  unsavePick(pickId: number): void {
    db.delete(savedPicks).where(eq(savedPicks.pickId, pickId)).run();
  }

  isPickSaved(pickId: number): boolean {
    return !!db.select().from(savedPicks).where(eq(savedPicks.pickId, pickId)).get();
  }

  getPlayerStats(sport?: string): PlayerStat[] {
    if (sport) {
      return db.select().from(playerStats).where(eq(playerStats.sport, sport)).all();
    }
    return db.select().from(playerStats).all();
  }

  upsertPlayerStat(stat: InsertPlayerStat): void {
    const existing = db.select().from(playerStats)
      .where(and(eq(playerStats.player, stat.player), eq(playerStats.stat, stat.stat)))
      .get();
    if (existing) {
      db.update(playerStats).set(stat).where(eq(playerStats.id, existing.id)).run();
    } else {
      db.insert(playerStats).values(stat).run();
    }
  }
}

export const storage = new Storage();
