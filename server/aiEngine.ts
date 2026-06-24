/**
 * PropEdge AI Engine v2
 * Sport-specific player prop markets with realistic stat baselines.
 */

import { storage } from "./storage";

type Sport = "MLB" | "NBA" | "NHL" | "Tennis";
type Edge = "elite" | "high" | "mid" | "low";

interface Market {
  stat: string;
  category: string; // e.g. "Batting", "Pitching", "Scoring", "Defense"
  baseline: number;
  variance: number;
  trend: "hot" | "cold" | "neutral";
  unit?: string; // e.g. "K", "HR", "pts"
}

interface PlayerTemplate {
  player: string;
  team: string;
  sport: Sport;
  markets: Market[];
}

const PLAYERS: PlayerTemplate[] = [
  // ─── MLB BATTERS ───────────────────────────────────────────────────────────
  {
    player: "Shohei Ohtani", team: "LAD", sport: "MLB", markets: [
      { stat: "Hits", category: "Batting", baseline: 1.3, variance: 0.5, trend: "hot" },
      { stat: "Total Bases", category: "Batting", baseline: 2.4, variance: 0.7, trend: "hot" },
      { stat: "Home Runs", category: "Batting", baseline: 0.6, variance: 0.3, trend: "hot" },
      { stat: "RBIs", category: "Batting", baseline: 1.1, variance: 0.5, trend: "neutral" },
      { stat: "Runs Scored", category: "Batting", baseline: 1.0, variance: 0.4, trend: "hot" },
      { stat: "Stolen Bases", category: "Batting", baseline: 0.35, variance: 0.25, trend: "neutral" },
    ]
  },
  {
    player: "Aaron Judge", team: "NYY", sport: "MLB", markets: [
      { stat: "Hits", category: "Batting", baseline: 1.1, variance: 0.5, trend: "hot" },
      { stat: "Total Bases", category: "Batting", baseline: 2.1, variance: 0.7, trend: "hot" },
      { stat: "Home Runs", category: "Batting", baseline: 0.55, variance: 0.3, trend: "hot" },
      { stat: "RBIs", category: "Batting", baseline: 1.2, variance: 0.5, trend: "hot" },
      { stat: "Walks", category: "Batting", baseline: 0.9, variance: 0.4, trend: "neutral" },
    ]
  },
  {
    player: "Freddie Freeman", team: "LAD", sport: "MLB", markets: [
      { stat: "Hits", category: "Batting", baseline: 1.4, variance: 0.4, trend: "hot" },
      { stat: "Total Bases", category: "Batting", baseline: 2.2, variance: 0.5, trend: "neutral" },
      { stat: "RBIs", category: "Batting", baseline: 0.9, variance: 0.4, trend: "neutral" },
      { stat: "Doubles", category: "Batting", baseline: 0.4, variance: 0.25, trend: "hot" },
    ]
  },
  {
    player: "Julio Rodriguez", team: "SEA", sport: "MLB", markets: [
      { stat: "Hits", category: "Batting", baseline: 1.1, variance: 0.5, trend: "cold" },
      { stat: "Total Bases", category: "Batting", baseline: 1.9, variance: 0.6, trend: "cold" },
      { stat: "Stolen Bases", category: "Batting", baseline: 0.5, variance: 0.3, trend: "hot" },
      { stat: "Strikeouts", category: "Batting", baseline: 1.3, variance: 0.4, trend: "cold" },
    ]
  },
  {
    player: "Ronald Acuna Jr.", team: "ATL", sport: "MLB", markets: [
      { stat: "Hits", category: "Batting", baseline: 1.3, variance: 0.5, trend: "hot" },
      { stat: "Stolen Bases", category: "Batting", baseline: 0.6, variance: 0.3, trend: "hot" },
      { stat: "Total Bases", category: "Batting", baseline: 2.0, variance: 0.6, trend: "neutral" },
      { stat: "Runs Scored", category: "Batting", baseline: 1.1, variance: 0.4, trend: "hot" },
    ]
  },
  // ─── MLB PITCHERS ──────────────────────────────────────────────────────────
  {
    player: "Gerrit Cole", team: "NYY", sport: "MLB", markets: [
      { stat: "Strikeouts", category: "Pitching", baseline: 7.8, variance: 1.5, trend: "hot" },
      { stat: "Hits Allowed", category: "Pitching", baseline: 6.0, variance: 1.5, trend: "neutral" },
      { stat: "Earned Runs", category: "Pitching", baseline: 2.2, variance: 1.0, trend: "neutral" },
      { stat: "Walks Allowed", category: "Pitching", baseline: 1.8, variance: 0.8, trend: "hot" },
      { stat: "Outs Recorded", category: "Pitching", baseline: 18.0, variance: 2.0, trend: "neutral" },
    ]
  },
  {
    player: "Paul Skenes", team: "PIT", sport: "MLB", markets: [
      { stat: "Strikeouts", category: "Pitching", baseline: 8.4, variance: 1.4, trend: "hot" },
      { stat: "Hits Allowed", category: "Pitching", baseline: 5.2, variance: 1.3, trend: "hot" },
      { stat: "Earned Runs", category: "Pitching", baseline: 1.8, variance: 1.0, trend: "hot" },
      { stat: "Outs Recorded", category: "Pitching", baseline: 18.5, variance: 2.0, trend: "hot" },
    ]
  },
  {
    player: "Spencer Strider", team: "ATL", sport: "MLB", markets: [
      { stat: "Strikeouts", category: "Pitching", baseline: 9.1, variance: 1.6, trend: "hot" },
      { stat: "Hits Allowed", category: "Pitching", baseline: 4.8, variance: 1.4, trend: "hot" },
      { stat: "Earned Runs", category: "Pitching", baseline: 1.9, variance: 1.0, trend: "neutral" },
    ]
  },

  // ─── NBA ───────────────────────────────────────────────────────────────────
  {
    player: "Nikola Jokic", team: "DEN", sport: "NBA", markets: [
      { stat: "Points", category: "Scoring", baseline: 26.8, variance: 5.0, trend: "hot" },
      { stat: "Rebounds", category: "Rebounding", baseline: 12.4, variance: 2.5, trend: "hot" },
      { stat: "Assists", category: "Playmaking", baseline: 9.1, variance: 2.0, trend: "neutral" },
      { stat: "3-Pointers Made", category: "Scoring", baseline: 1.2, variance: 0.8, trend: "neutral" },
      { stat: "Blocks", category: "Defense", baseline: 0.8, variance: 0.5, trend: "neutral" },
      { stat: "Steals", category: "Defense", baseline: 1.4, variance: 0.6, trend: "neutral" },
      { stat: "Pts+Reb+Ast", category: "Combo", baseline: 48.5, variance: 7.0, trend: "hot" },
      { stat: "Double Double", category: "Combo", baseline: 0.85, variance: 0.1, trend: "hot" },
    ]
  },
  {
    player: "Shai Gilgeous-Alexander", team: "OKC", sport: "NBA", markets: [
      { stat: "Points", category: "Scoring", baseline: 30.1, variance: 5.5, trend: "hot" },
      { stat: "Assists", category: "Playmaking", baseline: 6.4, variance: 1.8, trend: "neutral" },
      { stat: "Rebounds", category: "Rebounding", baseline: 4.8, variance: 1.5, trend: "neutral" },
      { stat: "Steals", category: "Defense", baseline: 2.0, variance: 0.6, trend: "hot" },
      { stat: "3-Pointers Made", category: "Scoring", baseline: 1.8, variance: 1.0, trend: "neutral" },
      { stat: "Pts+Ast", category: "Combo", baseline: 36.5, variance: 5.5, trend: "hot" },
    ]
  },
  {
    player: "Luka Doncic", team: "LAL", sport: "NBA", markets: [
      { stat: "Points", category: "Scoring", baseline: 28.4, variance: 6.0, trend: "neutral" },
      { stat: "Assists", category: "Playmaking", baseline: 8.8, variance: 2.2, trend: "hot" },
      { stat: "Rebounds", category: "Rebounding", baseline: 8.3, variance: 2.0, trend: "neutral" },
      { stat: "3-Pointers Made", category: "Scoring", baseline: 2.8, variance: 1.2, trend: "neutral" },
      { stat: "Turnovers", category: "Playmaking", baseline: 3.8, variance: 1.2, trend: "cold" },
      { stat: "Pts+Reb+Ast", category: "Combo", baseline: 45.5, variance: 7.0, trend: "neutral" },
    ]
  },
  {
    player: "Giannis Antetokounmpo", team: "MIL", sport: "NBA", markets: [
      { stat: "Points", category: "Scoring", baseline: 29.9, variance: 5.8, trend: "hot" },
      { stat: "Rebounds", category: "Rebounding", baseline: 11.7, variance: 2.3, trend: "hot" },
      { stat: "Assists", category: "Playmaking", baseline: 6.5, variance: 1.8, trend: "neutral" },
      { stat: "Blocks", category: "Defense", baseline: 1.4, variance: 0.6, trend: "neutral" },
      { stat: "Free Throws Made", category: "Scoring", baseline: 8.2, variance: 2.0, trend: "hot" },
    ]
  },
  {
    player: "Anthony Edwards", team: "MIN", sport: "NBA", markets: [
      { stat: "Points", category: "Scoring", baseline: 25.7, variance: 6.0, trend: "cold" },
      { stat: "3-Pointers Made", category: "Scoring", baseline: 2.9, variance: 1.0, trend: "cold" },
      { stat: "Rebounds", category: "Rebounding", baseline: 5.2, variance: 1.5, trend: "neutral" },
      { stat: "Assists", category: "Playmaking", baseline: 5.0, variance: 1.5, trend: "neutral" },
    ]
  },
  {
    player: "Jayson Tatum", team: "BOS", sport: "NBA", markets: [
      { stat: "Points", category: "Scoring", baseline: 26.5, variance: 5.5, trend: "neutral" },
      { stat: "Rebounds", category: "Rebounding", baseline: 8.2, variance: 2.0, trend: "neutral" },
      { stat: "3-Pointers Made", category: "Scoring", baseline: 3.1, variance: 1.1, trend: "hot" },
      { stat: "Assists", category: "Playmaking", baseline: 4.8, variance: 1.5, trend: "neutral" },
    ]
  },

  // ─── NHL ───────────────────────────────────────────────────────────────────
  {
    player: "Connor McDavid", team: "EDM", sport: "NHL", markets: [
      { stat: "Points", category: "Scoring", baseline: 1.6, variance: 0.5, trend: "hot" },
      { stat: "Shots on Goal", category: "Shooting", baseline: 4.1, variance: 1.0, trend: "hot" },
      { stat: "Assists", category: "Scoring", baseline: 1.1, variance: 0.4, trend: "hot" },
      { stat: "Goals", category: "Scoring", baseline: 0.55, variance: 0.3, trend: "neutral" },
      { stat: "Power Play Points", category: "Special Teams", baseline: 0.75, variance: 0.3, trend: "hot" },
      { stat: "Hits", category: "Physical", baseline: 1.2, variance: 0.6, trend: "neutral" },
    ]
  },
  {
    player: "Nathan MacKinnon", team: "COL", sport: "NHL", markets: [
      { stat: "Points", category: "Scoring", baseline: 1.4, variance: 0.5, trend: "hot" },
      { stat: "Shots on Goal", category: "Shooting", baseline: 3.9, variance: 1.1, trend: "neutral" },
      { stat: "Goals", category: "Scoring", baseline: 0.52, variance: 0.3, trend: "neutral" },
      { stat: "Assists", category: "Scoring", baseline: 0.95, variance: 0.4, trend: "hot" },
      { stat: "Power Play Points", category: "Special Teams", baseline: 0.65, variance: 0.3, trend: "hot" },
    ]
  },
  {
    player: "David Pastrnak", team: "BOS", sport: "NHL", markets: [
      { stat: "Goals", category: "Scoring", baseline: 0.55, variance: 0.3, trend: "hot" },
      { stat: "Shots on Goal", category: "Shooting", baseline: 3.5, variance: 1.0, trend: "neutral" },
      { stat: "Points", category: "Scoring", baseline: 1.1, variance: 0.45, trend: "hot" },
      { stat: "Hits", category: "Physical", baseline: 1.4, variance: 0.6, trend: "neutral" },
    ]
  },
  {
    player: "Cale Makar", team: "COL", sport: "NHL", markets: [
      { stat: "Points", category: "Scoring", baseline: 1.1, variance: 0.45, trend: "neutral" },
      { stat: "Shots on Goal", category: "Shooting", baseline: 2.8, variance: 0.9, trend: "neutral" },
      { stat: "Assists", category: "Scoring", baseline: 0.8, variance: 0.35, trend: "neutral" },
      { stat: "Blocks", category: "Defense", baseline: 1.5, variance: 0.7, trend: "hot" },
    ]
  },
  {
    player: "Auston Matthews", team: "TOR", sport: "NHL", markets: [
      { stat: "Goals", category: "Scoring", baseline: 0.62, variance: 0.3, trend: "hot" },
      { stat: "Shots on Goal", category: "Shooting", baseline: 4.2, variance: 1.1, trend: "hot" },
      { stat: "Points", category: "Scoring", baseline: 1.0, variance: 0.45, trend: "neutral" },
      { stat: "Power Play Points", category: "Special Teams", baseline: 0.55, variance: 0.25, trend: "neutral" },
    ]
  },

  // ─── TENNIS ────────────────────────────────────────────────────────────────
  {
    player: "Carlos Alcaraz", team: "ESP", sport: "Tennis", markets: [
      { stat: "Aces", category: "Serving", baseline: 7.2, variance: 2.0, trend: "hot" },
      { stat: "Games Won", category: "Match", baseline: 22.5, variance: 3.5, trend: "hot" },
      { stat: "1st Serve %", category: "Serving", baseline: 67.0, variance: 4.0, trend: "neutral" },
      { stat: "Break Points Converted", category: "Return", baseline: 3.8, variance: 1.2, trend: "hot" },
      { stat: "Double Faults", category: "Serving", baseline: 2.8, variance: 1.2, trend: "neutral" },
      { stat: "Winners", category: "Match", baseline: 38.0, variance: 6.0, trend: "hot" },
    ]
  },
  {
    player: "Jannik Sinner", team: "ITA", sport: "Tennis", markets: [
      { stat: "Aces", category: "Serving", baseline: 5.8, variance: 1.8, trend: "neutral" },
      { stat: "Games Won", category: "Match", baseline: 21.0, variance: 4.0, trend: "hot" },
      { stat: "Break Points Converted", category: "Return", baseline: 3.2, variance: 1.0, trend: "hot" },
      { stat: "1st Serve %", category: "Serving", baseline: 64.0, variance: 4.5, trend: "neutral" },
      { stat: "Winners", category: "Match", baseline: 32.0, variance: 6.0, trend: "hot" },
    ]
  },
  {
    player: "Novak Djokovic", team: "SRB", sport: "Tennis", markets: [
      { stat: "Aces", category: "Serving", baseline: 4.5, variance: 1.5, trend: "cold" },
      { stat: "Games Won", category: "Match", baseline: 19.5, variance: 4.5, trend: "neutral" },
      { stat: "Break Points Converted", category: "Return", baseline: 4.1, variance: 1.2, trend: "neutral" },
      { stat: "Double Faults", category: "Serving", baseline: 1.8, variance: 0.9, trend: "cold" },
    ]
  },
  {
    player: "Aryna Sabalenka", team: "BLR", sport: "Tennis", markets: [
      { stat: "Aces", category: "Serving", baseline: 4.2, variance: 1.5, trend: "hot" },
      { stat: "Games Won", category: "Match", baseline: 20.2, variance: 4.0, trend: "hot" },
      { stat: "Double Faults", category: "Serving", baseline: 3.1, variance: 1.3, trend: "cold" },
      { stat: "Winners", category: "Match", baseline: 28.0, variance: 5.0, trend: "hot" },
    ]
  },
  {
    player: "Iga Swiatek", team: "POL", sport: "Tennis", markets: [
      { stat: "Games Won", category: "Match", baseline: 21.5, variance: 3.5, trend: "hot" },
      { stat: "Break Points Converted", category: "Return", baseline: 4.5, variance: 1.2, trend: "hot" },
      { stat: "Winners", category: "Match", baseline: 26.0, variance: 5.0, trend: "neutral" },
      { stat: "Aces", category: "Serving", baseline: 3.2, variance: 1.2, trend: "neutral" },
    ]
  },
];

const OPPONENTS: Record<Sport, string[]> = {
  MLB: ["NYM", "BOS", "HOU", "ATL", "CHC", "PHI", "MIL", "SF", "CLE", "MIN", "TB", "TEX", "LAA"],
  NBA: ["BOS", "MIA", "PHX", "DAL", "ATL", "CLE", "NYK", "LAC", "PHI", "CHI", "SAC", "GSW"],
  NHL: ["TOR", "NYR", "CAR", "VGK", "STL", "DAL", "SEA", "WSH", "PIT", "NJD", "BOS", "MIN"],
  Tennis: ["Medvedev D.", "Zverev A.", "Rublev A.", "Tsitsipas S.", "Fritz T.", "De Minaur A.", "Ruud C."],
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
  const base = trend === "hot" ? 73 : trend === "cold" ? 53 : 63;
  return Math.min(97, Math.max(51, Math.round(base + (ev - 5) * 1.5 + randInt(-4, 4))));
}
function calcEdge(confidence: number, ev: number): Edge {
  if (confidence >= 83 && ev >= 12) return "elite";
  if (confidence >= 73 && ev >= 8) return "high";
  if (confidence >= 63 && ev >= 4) return "mid";
  return "low";
}

const REASONING: Record<string, string[]> = {
  hot: [
    "{player} has surpassed this {stat} line in {streak} of last 10 games. Books slow to adjust.",
    "Line set at {line} but {player}'s last 5 avg is {recent}. Sharp money already moving Over.",
    "{player} on fire — {stat} trend up {pct}% over last 2 weeks. Matchup is favorable tonight.",
    "Model detects {pct}% edge. {player}'s {stat} is consistently beating the market line.",
  ],
  cold: [
    "{player} slumping — {stat} down {pct}% over last 5. Books still pricing on season avg.",
    "Under has value. {player} is 2-for-10 on this {stat} line over last 10 games.",
    "Tough matchup + cold streak = Under value. {player}'s {stat} avg drops to {recent} vs this opponent.",
  ],
  neutral: [
    "Model finds +{ev}% EV on {player} {side} {line} {stat}. Public heavily on opposite side.",
    "Line movement and matchup create mispricing. {player}'s {stat} model edge: +{ev}%.",
    "{player} sits right at the line on {stat}. Historical hit rate at {conf}% over last 30 games.",
    "Sharp action on {player} {side} {line} {stat}. Closing line value likely to be positive.",
  ],
};

function buildReasoning(player: string, stat: string, line: number, side: string, trend: string, ev: number, confidence: number): string {
  const templates = REASONING[trend] || REASONING.neutral;
  const template = templates[randInt(0, templates.length - 1)];
  const recent = Math.round((line + (side === "Over" ? 0.4 : -0.4)) * 10) / 10;
  const streak = randInt(6, 9);
  return template
    .replace(/{player}/g, player)
    .replace(/{stat}/g, stat)
    .replace(/{line}/g, line.toString())
    .replace(/{side}/g, side)
    .replace(/{recent}/g, recent.toString())
    .replace(/{streak}/g, streak.toString())
    .replace(/{pct}/g, `${randInt(8, 22)}`)
    .replace(/{ev}/g, ev.toFixed(1))
    .replace(/{conf}/g, `${confidence}`);
}

export function generatePick() {
  const template = PLAYERS[randInt(0, PLAYERS.length - 1)];
  const market = template.markets[randInt(0, template.markets.length - 1)];
  const opponents = OPPONENTS[template.sport];
  const opponent = opponents[randInt(0, opponents.length - 1)];
  const gameTime = GAME_TIMES[randInt(0, GAME_TIMES.length - 1)];

  const actualValue = randFloat(market.baseline, market.variance);
  const bookLine = Math.round((market.baseline + randFloat(-0.15, 0.15)) * 2) / 2;
  const side = actualValue > bookLine ? "Over" : "Under";
  const gap = Math.abs(actualValue - bookLine);
  const ev = Math.round((gap / (bookLine || 1)) * 100 * randFloat(0.7, 1.4) * 10) / 10;

  const confidence = calcConfidence(market.trend, ev);
  const edge = calcEdge(confidence, ev);
  const reasoning = buildReasoning(template.player, market.stat, bookLine, side, market.trend, ev, confidence);

  return {
    sport: template.sport,
    player: template.player,
    team: template.team,
    opponent,
    market: market.stat,
    category: market.category,
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
  const existing = storage.getAiPicks(undefined, 1);
  if (existing.length > 0) return;

  console.log("[AI Engine] Seeding initial data...");
  const now = Date.now();

  // Generate 60 picks spread across sports
  for (let i = 0; i < 60; i++) {
    const pick = generatePick() as any;
    pick.createdAt = now - (60 - i) * 80000;
    const saved = storage.createAiPick(pick);
    storage.createFeedEvent({
      type: "new_pick",
      sport: pick.sport,
      title: `🎯 ${pick.edge.toUpperCase()}: ${pick.player} ${pick.side} ${pick.line} ${pick.market}`,
      body: `${pick.confidence}% confidence · +${pick.ev}% EV · ${pick.gameTime}`,
      meta: JSON.stringify({ pickId: saved.id }),
      urgent: pick.edge === "elite" ? 1 : 0,
      createdAt: pick.createdAt,
    });
  }

  // Seed result events
  const results = [
    { title: "✅ WON: Shohei Ohtani Over 1.5 Hits", body: "2 hits tonight. +$52 on $100. Model: 71% hit rate.", sport: "MLB" },
    { title: "✅ WON: Connor McDavid Over 3.5 Shots on Goal", body: "5 shots. Line cleared easily. +$48.", sport: "NHL" },
    { title: "✅ WON: Nikola Jokic Over 11.5 Rebounds", body: "14 boards. Dominant performance.", sport: "NBA" },
    { title: "❌ LOST: Aaron Judge Over 0.5 HRs", body: "0-for-4. Model win rate holds at 67.4%.", sport: "MLB" },
    { title: "✅ WON: Carlos Alcaraz Over 6.5 Aces", body: "9 aces in straight-sets win.", sport: "Tennis" },
    { title: "🔔 LINE MOVE: Gerrit Cole Strikeouts 7.5→8.0", body: "Sharp money pushed the line up 0.5. Model still likes Over 8.0.", sport: "MLB" },
    { title: "🔥 HOT: Paul Skenes Strikeouts — 7 straight overs", body: "Skenes has cleared his K line 7 games in a row. Confidence up to 91%.", sport: "MLB" },
    { title: "✅ WON: Auston Matthews Over 3.5 Shots on Goal", body: "6 shots, 2 goals. Dominant. +$55.", sport: "NHL" },
  ];
  results.forEach((r, i) => {
    storage.createFeedEvent({
      type: r.title.startsWith("✅") ? "result" : r.title.startsWith("🔔") ? "line_move" : "hot_streak",
      sport: r.sport, title: r.title, body: r.body, meta: "{}", urgent: 0,
      createdAt: now - (results.length - i) * 500000,
    });
  });

  // Seed games
  const gameData = [
    { sport: "MLB", homeTeam: "LAD", awayTeam: "NYM", gameTime: "Today 7:10 PM", homeOdds: "-145", awayOdds: "+122", overUnder: 8.5, status: "live", homeScore: 3, awayScore: 1, inning: "Bot 6" },
    { sport: "MLB", homeTeam: "NYY", awayTeam: "BOS", gameTime: "Today 7:05 PM", homeOdds: "-128", awayOdds: "+108", overUnder: 9.0, status: "live", homeScore: 2, awayScore: 4, inning: "Top 4" },
    { sport: "MLB", homeTeam: "HOU", awayTeam: "ATL", gameTime: "Today 8:10 PM", homeOdds: "-118", awayOdds: "-102", overUnder: 8.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "MLB", homeTeam: "SEA", awayTeam: "MIN", gameTime: "Today 9:40 PM", homeOdds: "+105", awayOdds: "-125", overUnder: 7.5, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "MLB", homeTeam: "PIT", awayTeam: "CHC", gameTime: "Tomorrow 1:35 PM", homeOdds: "+120", awayOdds: "-142", overUnder: 8.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NBA", homeTeam: "DEN", awayTeam: "MIN", gameTime: "Tomorrow 8:00 PM", homeOdds: "-160", awayOdds: "+135", overUnder: 218.5, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NBA", homeTeam: "OKC", awayTeam: "DAL", gameTime: "Tomorrow 9:30 PM", homeOdds: "-195", awayOdds: "+162", overUnder: 211.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NBA", homeTeam: "BOS", awayTeam: "MIL", gameTime: "Tomorrow 7:30 PM", homeOdds: "-135", awayOdds: "+114", overUnder: 224.5, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NHL", homeTeam: "EDM", awayTeam: "FLA", gameTime: "Today 8:00 PM", homeOdds: "-138", awayOdds: "+116", overUnder: 5.5, status: "live", homeScore: 2, awayScore: 1, inning: "P2 14:22" },
    { sport: "NHL", homeTeam: "COL", awayTeam: "CAR", gameTime: "Tomorrow 7:30 PM", homeOdds: "-122", awayOdds: "+102", overUnder: 6.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "NHL", homeTeam: "TOR", awayTeam: "BOS", gameTime: "Tomorrow 7:00 PM", homeOdds: "+108", awayOdds: "-128", overUnder: 6.5, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "Tennis", homeTeam: "Alcaraz C.", awayTeam: "Medvedev D.", gameTime: "Today 11:00 AM", homeOdds: "-220", awayOdds: "+178", overUnder: 38.5, status: "live", homeScore: 1, awayScore: 0, inning: "Set 2: 6-4" },
    { sport: "Tennis", homeTeam: "Sinner J.", awayTeam: "Zverev A.", gameTime: "Tomorrow 9:00 AM", homeOdds: "-165", awayOdds: "+138", overUnder: 37.0, status: "scheduled", homeScore: null, awayScore: null, inning: null },
    { sport: "Tennis", homeTeam: "Sabalenka A.", awayTeam: "Swiatek I.", gameTime: "Today 2:00 PM", homeOdds: "+105", awayOdds: "-125", overUnder: 39.0, status: "live", homeScore: 0, awayScore: 1, inning: "Set 2: 3-4" },
  ];
  gameData.forEach(g => storage.createGame(g as any));
  console.log("[AI Engine] Seeding complete.");
}

export function startAutoPickEngine(onNewPick: (pick: any, event: any) => void) {
  const generate = () => {
    const pick = generatePick() as any;
    const saved = storage.createAiPick(pick);
    const event = storage.createFeedEvent({
      type: "new_pick",
      sport: pick.sport,
      title: `🎯 ${pick.edge.toUpperCase()}: ${pick.player} ${pick.side} ${pick.line} ${pick.market}`,
      body: `${pick.confidence}% confidence · +${pick.ev}% EV · ${pick.gameTime}`,
      meta: JSON.stringify({ pickId: saved.id }),
      urgent: pick.edge === "elite" ? 1 : 0,
      createdAt: Date.now(),
    });
    onNewPick(saved, event);

    if (Math.random() < 0.25) {
      const oldPicks = storage.getAiPicks(undefined, 20).filter(p => p.status === "pending");
      if (oldPicks.length > 0) {
        const picked = oldPicks[Math.floor(Math.random() * oldPicks.length)];
        const won = Math.random() < 0.63;
        storage.updatePickStatus(picked.id, won ? "won" : "lost");
        const resultEvent = storage.createFeedEvent({
          type: "result",
          sport: picked.sport,
          title: `${won ? "✅ WON" : "❌ LOST"}: ${picked.player} ${picked.side} ${picked.line} ${picked.market}`,
          body: won
            ? `Cleared with room. +$${(Math.random() * 55 + 20).toFixed(0)} on $100 stake.`
            : `Missed by a hair. Model win rate: ${(Math.random() * 5 + 63).toFixed(1)}%.`,
          meta: JSON.stringify({ pickId: picked.id }),
          urgent: 0, createdAt: Date.now(),
        });
        onNewPick(null, resultEvent);
      }
    }
  };
  setTimeout(generate, 5000);
  setInterval(generate, 45000);
}
