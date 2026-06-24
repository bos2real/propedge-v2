import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// AI-generated picks (auto-created by backend engine)
export const aiPicks = sqliteTable("ai_picks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sport: text("sport").notNull(), // MLB | NBA | NHL | Tennis
  player: text("player").notNull(),
  team: text("team").notNull(),
  opponent: text("opponent").notNull(),
  market: text("market").notNull(), // e.g. "Strikeouts", "Points", "Assists"
  category: text("category").notNull().default("General"), // e.g. "Batting", "Pitching", "Scoring"
  line: real("line").notNull(),
  side: text("side").notNull(), // Over | Under
  confidence: real("confidence").notNull(), // 0-100
  ev: real("ev").notNull(), // Expected Value %
  edge: text("edge").notNull(), // elite | high | mid | low
  reasoning: text("reasoning").notNull(),
  gameTime: text("game_time").notNull(),
  status: text("status").notNull().default("pending"), // pending | won | lost | push
  createdAt: integer("created_at").notNull(),
});

export const insertAiPickSchema = createInsertSchema(aiPicks).omit({ id: true });
export type InsertAiPick = z.infer<typeof insertAiPickSchema>;
export type AiPick = typeof aiPicks.$inferSelect;

// Live feed events (streamed to clients)
export const feedEvents = sqliteTable("feed_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // new_pick | result | line_move | injury | hot_streak
  sport: text("sport").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  meta: text("meta").notNull().default("{}"), // JSON
  urgent: integer("urgent").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const insertFeedEventSchema = createInsertSchema(feedEvents).omit({ id: true });
export type InsertFeedEvent = z.infer<typeof insertFeedEventSchema>;
export type FeedEvent = typeof feedEvents.$inferSelect;

// Upcoming games
export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sport: text("sport").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  gameTime: text("game_time").notNull(),
  homeOdds: text("home_odds").notNull().default("-110"),
  awayOdds: text("away_odds").notNull().default("-110"),
  overUnder: real("over_under"),
  status: text("status").notNull().default("scheduled"), // scheduled | live | final
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  inning: text("inning"),
});

export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// User's saved picks (tap to save any AI pick)
export const savedPicks = sqliteTable("saved_picks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pickId: integer("pick_id").notNull(),
  savedAt: integer("saved_at").notNull(),
});

export const insertSavedPickSchema = createInsertSchema(savedPicks).omit({ id: true });
export type InsertSavedPick = z.infer<typeof insertSavedPickSchema>;
export type SavedPick = typeof savedPicks.$inferSelect;

// Sport stats cache (for AI reasoning context)
export const playerStats = sqliteTable("player_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sport: text("sport").notNull(),
  player: text("player").notNull(),
  team: text("team").notNull(),
  stat: text("stat").notNull(), // stat name
  average: real("average").notNull(),
  last5: real("last_5").notNull(),
  last10: real("last_10").notNull(),
  trend: text("trend").notNull(), // up | down | flat
  updatedAt: integer("updated_at").notNull(),
});

export const insertPlayerStatSchema = createInsertSchema(playerStats).omit({ id: true });
export type InsertPlayerStat = z.infer<typeof insertPlayerStatSchema>;
export type PlayerStat = typeof playerStats.$inferSelect;
