import type { Express } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { seedInitialData, startAutoPickEngine } from "./aiEngine";

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
}
