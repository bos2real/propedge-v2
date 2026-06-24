import { db } from "./db";
import {
  AiPick, FeedEvent, Game, SavedPick, PlayerStat,
  InsertAiPick, InsertFeedEvent, InsertGame, InsertSavedPick, InsertPlayerStat,
} from "@shared/schema";

export interface IStorage {
  getAiPicks(sport?: string, limit?: number): AiPick[];
  getAiPickById(id: number): AiPick | undefined;
  createAiPick(pick: InsertAiPick): AiPick;
  updatePickStatus(id: number, status: string): void;
  getTopPicksBySport(sport: string, limit: number): AiPick[];
  getFeedEvents(limit?: number, since?: number): FeedEvent[];
  createFeedEvent(event: InsertFeedEvent): FeedEvent;
  getGames(sport?: string): Game[];
  createGame(game: InsertGame): Game;
  updateGameScore(id: number, homeScore: number, awayScore: number, status: string, inning?: string): void;
  getSavedPicks(): (AiPick & { savedAt: number })[];
  savePick(pickId: number): SavedPick;
  unsavePick(pickId: number): void;
  isPickSaved(pickId: number): boolean;
  getPlayerStats(sport?: string): PlayerStat[];
  upsertPlayerStat(stat: InsertPlayerStat): void;
}

export class Storage implements IStorage {
  getAiPicks(sport?: string, limit = 50) { return db.getPicks(sport, limit); }
  getAiPickById(id: number) { return db.getPick(id); }
  createAiPick(pick: InsertAiPick) { return db.insertPick(pick); }
  updatePickStatus(id: number, status: string) { db.updatePickStatus(id, status); }
  getTopPicksBySport(sport: string, limit: number) { return db.getTopPicksBySport(sport, limit); }
  getFeedEvents(limit = 50, since?: number) { return db.getFeed(limit, since); }
  createFeedEvent(event: InsertFeedEvent) { return db.insertFeed(event); }
  getGames(sport?: string) { return db.getGames(sport); }
  createGame(game: InsertGame) { return db.insertGame(game); }
  updateGameScore(id: number, homeScore: number, awayScore: number, status: string, inning?: string) {
    db.updateGame(id, homeScore, awayScore, status, inning);
  }
  getSavedPicks() { return db.getSaved(); }
  savePick(pickId: number) { return db.insertSaved(pickId); }
  unsavePick(pickId: number) { db.unsave(pickId); }
  isPickSaved(pickId: number) { return db.isSaved(pickId); }
  getPlayerStats(sport?: string) { return db.getStats(sport); }
  upsertPlayerStat(stat: InsertPlayerStat) { db.upsertStat(stat); }
}

export const storage = new Storage();
