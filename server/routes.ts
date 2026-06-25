import type { Express } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { seedInitialData, startAutoPickEngine } from "./aiEngine";
import { getPlayerProfile } from "./playerData";
import {
  injuryReports, fantasyPlayers, analyzeTrade,
  leaderboard, exchangeProps, userPicks,
  type UserPickRecord,
} from "./fantasyEngine";

// SSE clients registry
const sseClients: Set<any> = new Set();

function broadcastSSE(data: object) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => {
    try { res.write(payload); } catch {}
  });
}

export async function registerRoutes(httpServer: Server, app: Express) {
  // Seed initial data
  seedInitialData();

  // Start auto-pick engine — broadcasts new picks via SSE
  startAutoPickEngine((pick, event) => {
    broadcastSSE({ type: "feed", event, pick });
  });

  // ── SSE live feed ──────────────────────────────────────────────────────────
  app.get("/api/feed/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Send heartbeat every 15s
    const heartbeat = setInterval(() => {
      try { res.write(": heartbeat\n\n"); } catch {}
    }, 15000);

    sseClients.add(res);

    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // ── Feed events (polling fallback) ────────────────────────────────────────
  app.get("/api/feed", (req, res) => {
    const since = req.query.since ? Number(req.query.since) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const events = storage.getFeedEvents(limit, since);
    res.json(events);
  });

  // ── AI Picks ──────────────────────────────────────────────────────────────
  app.get("/api/picks", (req, res) => {
    const { sport, limit } = req.query;
    const picks = storage.getAiPicks(
      sport as string | undefined,
      limit ? Number(limit) : 50
    );
    res.json(picks);
  });

  app.get("/api/picks/top", (req, res) => {
    const sports = ["MLB", "NBA", "NHL", "Tennis"];
    const result: Record<string, any[]> = {};
    sports.forEach(sport => {
      result[sport] = storage.getTopPicksBySport(sport, 6);
    });
    res.json(result);
  });

  app.get("/api/picks/:id", (req, res) => {
    const pick = storage.getAiPickById(Number(req.params.id));
    if (!pick) return res.status(404).json({ error: "Not found" });
    res.json(pick);
  });

  // ── Games ────────────────────────────────────────────────────────────────
  app.get("/api/games", (req, res) => {
    const { sport } = req.query;
    const allGames = storage.getGames(sport as string | undefined);
    res.json(allGames);
  });

  // ── Saved picks ───────────────────────────────────────────────────────────
  app.get("/api/saved", (req, res) => {
    res.json(storage.getSavedPicks());
  });

  app.post("/api/saved/:pickId", (req, res) => {
    const pickId = Number(req.params.pickId);
    if (storage.isPickSaved(pickId)) {
      return res.json({ saved: true, message: "Already saved" });
    }
    const saved = storage.savePick(pickId);
    res.json({ saved: true, data: saved });
  });

  app.delete("/api/saved/:pickId", (req, res) => {
    storage.unsavePick(Number(req.params.pickId));
    res.json({ saved: false });
  });

  app.get("/api/saved/:pickId/status", (req, res) => {
    res.json({ saved: storage.isPickSaved(Number(req.params.pickId)) });
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  app.get("/api/stats", (req, res) => {
    const { sport } = req.query;
    res.json(storage.getPlayerStats(sport as string | undefined));
  });

  // ── Player profile (photo + stats) ─────────────────────────────────────────
  app.get("/api/player/:name", (req, res) => {
    const name = decodeURIComponent(req.params.name);
    const profile = getPlayerProfile(name);
    if (!profile) return res.status(404).json({ error: "Player not found" });
    res.json(profile);
  });

  // ── Dashboard summary ─────────────────────────────────────────────────────
  app.get("/api/summary", (req, res) => {
    const allPicks = storage.getAiPicks(undefined, 200);
    const won = allPicks.filter(p => p.status === "won").length;
    const lost = allPicks.filter(p => p.status === "lost").length;
    const pending = allPicks.filter(p => p.status === "pending").length;
    const total = won + lost;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const elitePicks = allPicks.filter(p => p.edge === "elite" && p.status === "pending");
    const avgEv = allPicks.filter(p => p.status === "pending").reduce((a, b) => a + b.ev, 0) / (pending || 1);

    res.json({
      totalPicks: allPicks.length,
      won, lost, pending,
      winRate,
      eliteCount: elitePicks.length,
      avgEv: Math.round(avgEv * 10) / 10,
    });
  });

  // ── Fantasy AI Assistant ─────────────────────────────────────────────────
  app.get("/api/fantasy/injuries", (req, res) => {
    const { sport } = req.query;
    const data = sport ? injuryReports.filter(r => r.sport === sport) : injuryReports;
    res.json(data);
  });

  app.get("/api/fantasy/players", (req, res) => {
    const { sport } = req.query;
    const data = sport ? fantasyPlayers.filter(p => p.sport === sport) : fantasyPlayers;
    res.json(data);
  });

  app.post("/api/fantasy/trade", (req, res) => {
    const { playerA, playerB } = req.body;
    if (!playerA || !playerB) {
      return res.status(400).json({ error: "playerA and playerB required" });
    }
    const analysis = analyzeTrade(playerA, playerB);
    res.json(analysis);
  });

  // ── Social Leaderboard ───────────────────────────────────────────────────
  app.get("/api/leaderboard", (req, res) => {
    const { sport } = req.query;
    const data = sport ? leaderboard.filter(u => u.sport === sport || u.sport === "All") : leaderboard;
    res.json(data);
  });

  // ── Prop Exchange ────────────────────────────────────────────────────────
  app.get("/api/exchange/props", (req, res) => {
    const { sport, status } = req.query;
    let data = [...exchangeProps];
    if (sport) data = data.filter(p => p.sport === sport);
    if (status) data = data.filter(p => p.status === status);
    res.json(data);
  });

  // In-memory exchange pick store
  const exchangeUserPicks: UserPickRecord[] = [...userPicks];

  app.get("/api/exchange/record", (req, res) => {
    const wins = exchangeUserPicks.filter(p => p.result === "win").length;
    const losses = exchangeUserPicks.filter(p => p.result === "loss").length;
    const pending = exchangeUserPicks.filter(p => p.result === "pending").length;
    res.json({ wins, losses, pending, total: exchangeUserPicks.length, picks: exchangeUserPicks });
  });

  app.post("/api/exchange/pick", (req, res) => {
    const { propId, side } = req.body;
    if (!propId || !side) return res.status(400).json({ error: "propId and side required" });
    // Prevent duplicate picks on same prop
    const existing = exchangeUserPicks.find(p => p.propId === Number(propId));
    if (existing) return res.json({ success: false, message: "Already picked", pick: existing });
    const normalizedSide = (side as string).charAt(0).toUpperCase() + (side as string).slice(1).toLowerCase();
    const pick: UserPickRecord = {
      propId: Number(propId),
      side: normalizedSide as "Over" | "Under",
      timestamp: Date.now(),
      result: "pending",
      points: 0,
    };
    exchangeUserPicks.push(pick);
    // Update community vote counts on the prop
    const prop = exchangeProps.find(p => p.id === Number(propId));
    if (prop) {
      if (normalizedSide === "Over") prop.overCount++;
      else prop.underCount++;
    }
    res.json({ success: true, pick });
  });
}
