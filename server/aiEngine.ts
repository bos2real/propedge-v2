/**
 * PropEdge AI Engine
 * Automatically generates player prop picks based on simulated real-world stat patterns.
 * In production, replace the data sources with The Odds API + BallDontLie + SportRadar.
 */

import { storage } from "./storage";

type Sport = "MLB" | "NBA" | "NHL" | "Tennis";
type Edge = "elite" | "high" | "mid" | "low";

interface PlayerTemplate {
  player: string;
  team: string;
  sport: Sport;
  markets: {
    stat: string;
    baseline: number;
    variance: number;
    trend: "hot" | "cold" | "neutral";
  }[];
}

const PLAYERS: PlayerTemplate[] = [
  // MLB
  { player: "Shohei Ohtani", team: "LAD", sport: "MLB", markets: [
    { stat: "Total Bases", baseline: 2.4, variance: 0.6, trend: "hot" },
    { stat: "Home Runs", baseline: 0.6, variance: 0.3, trend: "hot" },
    { stat: "Hits", baseline: 1.3, variance: 0.4, trend: "neutral" },
  ]},
  { player: "Aaron Judge", team: "NYY", sport: "MLB", markets: [
    { stat: "Total Bases", baseline: 2.1, variance: 0.7, trend: "hot" },
    { stat: "RBIs", baseline: 0.9, variance: 0.4, trend: "neutral" },
    { stat: "Home Runs", baseline: 0.55, variance: 0.3, trend: "hot" },
  ]},
  { player: "Freddie Freeman", team: "LAD", sport: "MLB", markets: [
    { stat: "Hits", baseline: 1.4, variance: 0.35, trend: "hot" },
    { stat: "Total Bases", baseline: 2.2, variance: 0.5, trend: "neutral" },
  ]},
  { player: "Gerrit Cole", team: "NYY", sport: "MLB", markets: [
    { stat: "Strikeouts", baseline: 7.8, variance: 1.5, trend: "hot" },
    { stat: "Outs Recorded", baseline: 18.2, variance: 2.0, trend: "neutral" },
  ]},
  { player: "Julio Rodriguez", team: "SEA", sport: "MLB", markets: [
    { stat: "Total Bases", baseline: 1.9, variance: 0.6, trend: "cold" },
    { stat: "Hits", baseline: 1.1, variance: 0.4, trend: "cold" },
    { stat: "Stolen Bases", baseline: 0.45, variance: 0.3, trend: "hot" },
  ]},
  { player: "Paul Skenes", team: "PIT", sport: "MLB", markets: [
    { stat: "Strikeouts", baseline: 8.2, variance: 1.4, trend: "hot" },
    { stat: "Hits Allowed", baseline: 5.5, variance: 1.2, trend: "hot" },
  ]},
  // NBA
  { player: "Nikola Jokic", team: "DEN", sport: "NBA", markets: [
    { stat: "Points", baseline: 26.8, variance: 5.0, trend: "hot" },
    { stat: "Rebounds", baseline: 12.4, variance: 2.5, trend: "hot" },
    { stat: "Assists", baseline: 9.1, variance: 2.0, trend: "neutral" },
    { stat: "Fantasy Score", baseline: 65.2, variance: 8.0, trend: "hot" },
  ]},
  { player: "Shai Gilgeous-Alexander", team: "OKC", sport: "NBA", markets: [
    { stat: "Points", baseline: 30.1, variance: 5.5, trend: "hot" },
    { stat: "Assists", baseline: 6.4, variance: 1.8, trend: "neutral" },
    { stat: "Steals", baseline: 2.0, variance: 0.6, trend: "hot" },
  ]},
  { player: "Luka Doncic", team: "LAL", sport: "NBA", markets: [
    { stat: "Points", baseline: 28.4, variance: 6.0, trend: "neutral" },
    { stat: "Assists", baseline: 8.8, variance: 2.2, trend: "hot" },
    { stat: "Rebounds", baseline: 8.3, variance: 2.0, trend: "neutral" },
  ]},
  { player: "Giannis Antetokounmpo", team: "MIL", sport: "NBA", markets: [
    { stat: "Points", baseline: 29.9, variance: 5.8, trend: "hot" },
    { stat: "Rebounds", baseline: 11.7, variance: 2.3, trend: "hot" },
    { stat: "Blocks", baseline: 1.4, variance: 0.6, trend: "neutral" },
  ]},
  { player: "Anthony Edwards", team: "MIN", sport: "NBA", markets: [
    { stat: "Points", baseline: 25.7, variance: 6.0, trend: "cold" },
    { stat: "3-Pointers Made", baseline: 2.9, variance: 1.0, trend: "cold" },
  ]},
  // NHL
  { player: "Connor McDavid", team: "EDM", sport: "NHL", markets: [
    { stat: "Points", baseline: 1.6, variance: 0.5, trend: "hot" },
    { stat: "Shots on Goal", baseline: 4.1, variance: 1.0, trend: "hot" },
    { stat: "Assists", baseline: 1.1, variance: 0.4, trend: "hot" },
  ]},
  { player: "Nathan MacKinnon", team: "COL", sport: "NHL", markets: [
    { stat: "Points", baseline: 1.4, variance: 0.5, trend: "hot" },
    { stat: "Shots on Goal", baseline: 3.9, variance: 1.1, trend: "neutral" },
  ]},
  { player: "David Pastrnak", team: "BOS", sport: "NHL", markets: [
    { stat: "Goals", baseline: 0.55, variance: 0.3, trend: "hot" },
    { stat: "Shots on Goal", baseline: 3.5, variance: 1.0, trend: "neutral" },
  ]},
  { player: "Cale Makar", team: "COL", sport: "NHL", markets: [
    { stat: "Points", baseline: 1.1, variance: 0.45, trend: "neutral" },
    { stat: "Shots on Goal", baseline: 2.8, variance: 0.9, trend: "neutral" },
  ]},
  // Tennis
  { player: "Carlos Alcaraz", team: "ESP", sport: "Tennis", markets: [
    { stat: "Aces", baseline: 7.2, variance: 2.0, trend: "hot" },
    { stat: "Games Won", baseline: 22.5, variance: 3.5, trend: "hot" },
    { stat: "1st Serve %", baseline: 67.0, variance: 4.0, trend: "neutral" },
  ]},
  { player: "Jannik Sinner", team: "ITA", sport: "Tennis", markets: [
    { stat: "Aces", baseline: 5.8, variance: 1.8, trend: "neutral" },
    { stat: "Games Won", baseline: 21.0, variance: 4.0, trend: "hot" },
    { stat: "Break Points Converted", baseline: 3.2, variance: 1.0, trend: "hot" },
  ]},
  { player: "Novak Djokovic", team: "SRB", sport: "Tennis", markets: [
    { stat: "Aces", baseline: 4.5, variance: 1.5, trend: "cold" },
    { stat: "Games Won", baseline: 19.5, variance: 4.5, trend: "neutral" },
  ]},
  { player: "Aryna Sabalenka", team: "BLR", sport: "Tennis", markets: [
    { stat: "Aces", baseline: 4.2, variance: 1.5, trend: "hot" },
    { stat: "Games Won", baseline: 20.2, variance: 4.0, trend: "hot" },
  ]},
];

const OPPONENTS: Record<Sport, string[]> = {
  MLB: ["NYM", "BOS", "HOU", "ATL", "CHC", "PHI", "MIL", "SF", "CLE", "MIN", "TB"],
  NBA: ["BOS", "MIA", "PHX", "DAL", "ATL", "CLE", "NYK", "LAC", "PHI", "CHI"],
  NHL: ["TOR", "NYR", "CAR", "VGK", "STL", "DAL", "SEA", "WSH", "PIT", "NJD"],
  Tennis: ["Medvedev D.", "Zverev A.", "Rublev A.", "Tsitsipas S.", "Fritz T.", "De Minaur A."],
};

const GAME_TIMES = [
  "Today 1:05 PM", "Today 4:10 PM", "Today 7:08 PM", "Today 7:40 PM",
  "Today 9:40 PM", "Tomorrow 12:30 PM", "Tomorrow 7:05 PM", "Tomorrow 8:00 PM",
];

function randFloat(base: number, variance: number): number {
  return Math.round((base + (Math.random() * variance * 2 - variance)) * 10) / 10;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcConfidence(trend: string, ev: number): number {
  const base = trend === "hot" ? 72 : trend === "cold" ? 52 : 62;
  return Math.min(97, Math.max(51, Math.round(base + (ev - 5) * 1.5 + randInt(-4, 4))));
}

function calcEdge(confidence: number, ev: number): Edge {
  if (confidence >= 82 && ev >= 12) return "elite";
  if (confidence >= 72 && ev >= 8) return "high";
  if (confidence >= 62 && ev >= 4) return "mid";
  return "low";
}

const REASONING_TEMPLATES = {
  hot: [
    "{player} is on a 5-game hot streak, averaging {stat} over the last 5. Line is soft at {line}.",
    "Books haven't adjusted for {player}'s recent {stat} surge — last 5 avg: {recent}. Value on the Over.",
    "{player} has exceeded this line in 7 of last 10 matchups. Favorable park/surface factors amplify edge.",
    "Sharp money moved this line down 0.5 overnight. {player}'s recent {stat} form makes Over compelling.",
  ],
  cold: [
    "{player} is slumping — {stat} down {pct}% over last 5 games. Books overpricing based on season avg.",
    "Under is strong value. {player} is 2-for-9 on this line over last 10, and faces a tough matchup tonight.",
    "Cold spell + tough opponent = Under value. {player}'s {stat} average drops to {recent} vs this opponent.",
  ],
  neutral: [
    "Model finds {pct}% edge on {player} {side} {line} {stat}. Public on opposite side — fade the crowd.",
    "Line movement and injury report create mispricing on {player}'s {stat}. Model edge: +{ev}% EV.",
    "{player} sits just under books' projection. Historical hit rate at {conf}% over past 30 games.",
  ],
};

function buildReasoning(
  player: string, stat: string, line: number, side: string, trend: string, ev: number, confidence: number
): string {
  const templates = REASONING_TEMPLATES[trend as keyof typeof REASONING_TEMPLATES];
  const template = templates[randInt(0, templates.length - 1)];
  const recent = Math.round((line + (side === "Over" ? 0.4 : -0.4)) * 10) / 10;
  return template
    .replace(/{player}/g, player)
    .replace(/{stat}/g, stat)
    .replace(/{line}/g, line.toString())
    .replace(/{side}/g, side)
    .replace(/{recent}/g, recent.toString())
    .replace(/{pct}/g, `${randInt(8, 22)}`)
    .replace(/{ev}/g, ev.toFixed(1))
    .replace(/{conf}/g, `${confidence}`);
}

export function generatePick(): {
  sport: Sport; player: string; team: string; opponent: string;
  market: string; line: number; side: string; confidence: number;
  ev: number; edge: Edge; reasoning: string; gameTime: string;
  status: string; createdAt: number;
} {
  const template = PLAYERS[randInt(0, PLAYERS.length - 1)];
  const market = template.markets[randInt(0, template.markets.length - 1)];
  const opponents = OPPONENTS[template.sport];
  const opponent = opponents[randInt(0, opponents.length - 1)];
  const gameTime = GAME_TIMES[randInt(0, GAME_TIMES.length - 1)];

  const actualValue = randFloat(market.baseline, market.variance);
  const bookLine = Math.round((market.baseline + randFloat(-0.2, 0.2)) * 2) / 2;
  const side = actualValue > bookLine ? "Over" : "Under";
  const gap = Math.abs(actualValue - bookLine);
  const ev = Math.round((gap / bookLine) * 100 * randFloat(0.8, 1.3) * 10) / 10;

  const confidence = calcConfidence(market.trend, ev);
  const edge = calcEdge(confidence, ev);
  const reasoning = buildReasoning(template.player, market.stat, bookLine, side, market.trend, ev, confidence);

  return {
    sport: template.sport,
    player: template.player,
    team: template.team,
    opponent,
    market: market.stat,
    line: bookLine,
    side,
    confidence,
    ev,
    edge,
    reasoning,
    gameTime,
    status: "pending",
    createdAt: Date.now(),
  };
}

export function seedInitialData() {
  const now = Date.now();

  // Check if already seeded
  const existing = storage.getAiPicks(undefined, 1);
  if (existing.length > 0) return;

  console.log("[AI Engine] Seeding initial data...");

  // Generate 40 picks spread across sports
  for (let i = 0; i < 40; i++) {
    const pick = generatePick();
    // Vary created times for natural-looking feed
    pick.createdAt = now - (40 - i) * 90000;
    const saved = storage.createAiPick(pick);

    // Create feed event for each pick
    storage.createFeedEvent({
      type: "new_pick",
      sport: pick.sport,
      title: `🎯 New ${pick.edge.toUpperCase()} Pick: ${pick.player}`,
      body: `${pick.side} ${pick.line} ${pick.market} — ${pick.confidence}% confidence, +${pick.ev}% EV`,
      meta: JSON.stringify({ pickId: saved.id }),
      urgent: pick.edge === "elite" ? 1 : 0,
      createdAt: pick.createdAt,
    });
  }

  // Seed some result events
  const results = [
    { title: "✅ WON: Shohei Ohtani Over 2.5 Total Bases", body: "Hit 3 total bases in tonight's game. +$47 profit at -110 odds.", sport: "MLB" },
    { title: "✅ WON: Connor McDavid Over 1.5 Points", body: "1G + 2A = 3 points. Line crushed. +$65 at -115.", sport: "NHL" },
    { title: "❌ LOST: Aaron Judge Over 0.5 HRs", body: "0-for-4 night. Line missed. Model accuracy: 68% over last 30.", sport: "MLB" },
    { title: "✅ WON: Shai Gilgeous-Alexander Over 29.5 Pts", body: "34 points. Covered by 4.5. +$52 at -110.", sport: "NBA" },
    { title: "🔔 LINE MOVE: Nikola Jokic Points line moved 2.5→3.0", body: "Sharp action pushed the line. Model still likes Over 3.0 at current price.", sport: "NBA" },
    { title: "🔥 HOT STREAK: Carlos Alcaraz Aces", body: "Alcaraz has gone Over his ace line in 5 straight matches. Model confidence up to 89%.", sport: "Tennis" },
  ];

  results.forEach((r, i) => {
    storage.createFeedEvent({
      type: r.title.startsWith("✅") ? "result" : r.title.startsWith("🔔") ? "line_move" : "hot_streak",
      sport: r.sport,
      title: r.title,
      body: r.body,
      meta: "{}",
      urgent: 0,
      createdAt: now - (results.length - i) * 600000,
    });
  });

  // Seed games
  const gameData = [
    { sport: "MLB", homeTeam: "LAD", awayTeam: "NYM", gameTime: "Today 7:10 PM", homeOdds: "-145", awayOdds: "+122", overUnder: 8.5, status: "live", homeScore: 3, awayScore: 1, inning: "Bot 6" },
    { sport: "MLB", homeTeam: "NYY", awayTeam: "BOS", gameTime: "Today 7:05 PM", homeOdds: "-128", awayOdds: "+108", overUnder: 9.0, status: "live", homeScore: 2, awayScore: 4, inning: "Top 4" },
    { sport: "MLB", homeTeam: "HOU", awayTeam: "ATL", gameTime: "Today 8:10 PM", homeOdds: "-118", awayOdds: "-102", overUnder: 8.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "MLB", homeTeam: "SEA", awayTeam: "MIN", gameTime: "Today 9:40 PM", homeOdds: "+105", awayOdds: "-125", overUnder: 7.5, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NBA", homeTeam: "DEN", awayTeam: "MIN", gameTime: "Tomorrow 8:00 PM", homeOdds: "-160", awayOdds: "+135", overUnder: 218.5, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NBA", homeTeam: "OKC", awayTeam: "DAL", gameTime: "Tomorrow 9:30 PM", homeOdds: "-195", awayOdds: "+162", overUnder: 211.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NHL", homeTeam: "EDM", awayTeam: "FLA", gameTime: "Today 8:00 PM", homeOdds: "-138", awayOdds: "+116", overUnder: 5.5, status: "live", homeScore: 2, awayScore: 1, inning: "P2 14:22" },
    { sport: "NHL", homeTeam: "COL", awayTeam: "CAR", gameTime: "Tomorrow 7:30 PM", homeOdds: "-122", awayOdds: "+102", overUnder: 6.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "Tennis", homeTeam: "Alcaraz C.", awayTeam: "Medvedev D.", gameTime: "Today 11:00 AM", homeOdds: "-220", awayOdds: "+178", overUnder: 38.5, status: "live", homeScore: 1, awayScore: 0, inning: "Set 2: 6-4" },
    { sport: "Tennis", homeTeam: "Sinner J.", awayTeam: "Zverev A.", gameTime: "Tomorrow 9:00 AM", homeOdds: "-165", awayOdds: "+138", overUnder: 37.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
  ];

  gameData.forEach(g => storage.createGame(g as any));

  console.log("[AI Engine] Seeding complete.");
}

// Auto-generate new picks every 45 seconds
export function startAutoPickEngine(onNewPick: (pick: any, event: any) => void) {
  const generate = () => {
    const pick = generatePick();
    const saved = storage.createAiPick(pick);

    const event = storage.createFeedEvent({
      type: "new_pick",
      sport: pick.sport,
      title: `🎯 New ${pick.edge.toUpperCase()} Pick: ${pick.player}`,
      body: `${pick.side} ${pick.line} ${pick.market} — ${pick.confidence}% confidence, +${pick.ev}% EV`,
      meta: JSON.stringify({ pickId: saved.id }),
      urgent: pick.edge === "elite" ? 1 : 0,
      createdAt: Date.now(),
    });

    onNewPick(saved, event);

    // Occasionally generate "result" events
    if (Math.random() < 0.2) {
      const outcomes = ["WON", "LOST"];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      const oldPicks = storage.getAiPicks(undefined, 20).filter(p => p.status === "pending");
      if (oldPicks.length > 0) {
        const picked = oldPicks[Math.floor(Math.random() * oldPicks.length)];
        const status = outcome === "WON" ? "won" : "lost";
        storage.updatePickStatus(picked.id, status);

        const resultEvent = storage.createFeedEvent({
          type: "result",
          sport: picked.sport,
          title: `${outcome === "WON" ? "✅" : "❌"} ${outcome}: ${picked.player} ${picked.side} ${picked.line} ${picked.market}`,
          body: outcome === "WON"
            ? `Line cleared with room to spare. +${(Math.random() * 50 + 20).toFixed(0)} profit on $100 stake.`
            : `Tough beat — fell just short. Model win rate holds at ${(Math.random() * 5 + 64).toFixed(1)}% overall.`,
          meta: JSON.stringify({ pickId: picked.id }),
          urgent: 0,
          createdAt: Date.now(),
        });
        onNewPick(null, resultEvent);
      }
    }
  };

  // Generate immediately then every 45s
  setTimeout(generate, 5000);
  setInterval(generate, 45000);
}
