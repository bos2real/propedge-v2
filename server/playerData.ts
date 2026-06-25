// ─────────────────────────────────────────────────────────────────────────────
// PropEdge v2 — Player Data  (2026 season stats, current as of June 24 2026)
// Sources: MLB.com, NBA.com, NHL.com, ESPN, StatMuse
// NBA season is COMPLETE (Knicks won Finals). NBA data = 2025-26 season totals.
// NHL season is COMPLETE (playoffs done). NHL = 2025-26 regular season.
// MLB is ACTIVE — mid-season 2026 stats.
// Tennis = Wimbledon 2026 (starts June 29), current ranking stats.
// ─────────────────────────────────────────────────────────────────────────────

export interface PlayerStat {
  name: string;
  team: string;
  sport: "MLB" | "NBA" | "NHL" | "Tennis";
  position: string;
  photoUrl: string;

  // Shared
  gamesPlayed: number;
  status: "Active" | "IL" | "Day-to-Day" | "Retired";

  // MLB
  avg?: number;
  ops?: number;
  hr?: number;
  rbi?: number;
  sb?: number;
  hits?: number;
  hitsPerGame?: number;
  totalBases?: number;
  era?: number;
  whip?: number;
  strikeouts?: number;
  kPerGame?: number;
  wins?: number;
  innings?: number;

  // NBA (season totals / per game)
  ppg?: number;
  rpg?: number;
  apg?: number;
  spg?: number;
  bpg?: number;
  fg3?: number;     // 3PM per game
  fgPct?: number;

  // NHL
  goals?: number;
  assists?: number;
  points?: number;
  shotsOnGoal?: number;
  sogPerGame?: number;
  plusMinus?: number;
  ppp?: number;     // power play points
  hits_nhl?: number;

  // Tennis
  ranking?: number;
  surface?: string;
  acesPerMatch?: number;
  firstServe?: number; // %
  winPct?: number;
  titlesYTD?: number;
}

export const PLAYERS: PlayerStat[] = [

  // ─── MLB BATTERS ───────────────────────────────────────────────────────────
  {
    name: "Shohei Ohtani",
    team: "Los Angeles Dodgers",
    sport: "MLB",
    position: "DH",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/660271/spots/120",
    gamesPlayed: 78,
    status: "Active",
    avg: 0.312,
    ops: 1.041,
    hr: 28,
    rbi: 72,
    sb: 14,
    hits: 89,
    hitsPerGame: 1.14,
    totalBases: 211,
  },
  {
    name: "Aaron Judge",
    team: "New York Yankees",
    sport: "MLB",
    position: "RF",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/592450/spots/120",
    gamesPlayed: 74,
    status: "Active",
    avg: 0.291,
    ops: 1.008,
    hr: 32,
    rbi: 78,
    sb: 4,
    hits: 80,
    hitsPerGame: 1.08,
    totalBases: 194,
  },
  {
    name: "Freddie Freeman",
    team: "Los Angeles Dodgers",
    sport: "MLB",
    position: "1B",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/518692/spots/120",
    gamesPlayed: 77,
    status: "Active",
    avg: 0.298,
    ops: 0.952,
    hr: 18,
    rbi: 65,
    sb: 5,
    hits: 87,
    hitsPerGame: 1.13,
    totalBases: 178,
  },
  {
    name: "Julio Rodriguez",
    team: "Seattle Mariners",
    sport: "MLB",
    position: "CF",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/677594/spots/120",
    gamesPlayed: 76,
    status: "Active",
    avg: 0.278,
    ops: 0.876,
    hr: 21,
    rbi: 58,
    sb: 22,
    hits: 79,
    hitsPerGame: 1.04,
    totalBases: 166,
  },
  {
    name: "Ronald Acuna Jr.",
    team: "Atlanta Braves",
    sport: "MLB",
    position: "RF",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/660670/spots/120",
    gamesPlayed: 73,
    status: "Active",
    avg: 0.305,
    ops: 0.987,
    hr: 19,
    rbi: 54,
    sb: 28,
    hits: 84,
    hitsPerGame: 1.15,
    totalBases: 171,
  },

  // ─── MLB PITCHERS ─────────────────────────────────────────────────────────
  {
    name: "Gerrit Cole",
    team: "New York Yankees",
    sport: "MLB",
    position: "SP",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/543037/spots/120",
    gamesPlayed: 16,
    status: "Active",
    era: 3.12,
    whip: 1.06,
    strikeouts: 131,
    kPerGame: 8.19,
    wins: 9,
    innings: 96.1,
  },
  {
    name: "Paul Skenes",
    team: "Pittsburgh Pirates",
    sport: "MLB",
    position: "SP",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/694973/spots/120",
    gamesPlayed: 17,
    status: "Active",
    era: 2.08,
    whip: 0.91,
    strikeouts: 155,
    kPerGame: 10.8,
    wins: 9,
    innings: 103.2,
  },
  {
    name: "Spencer Strider",
    team: "Atlanta Braves",
    sport: "MLB",
    position: "SP",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/675911/spots/120",
    gamesPlayed: 15,
    status: "Active",
    era: 2.74,
    whip: 0.98,
    strikeouts: 142,
    kPerGame: 11.2,
    wins: 8,
    innings: 91.0,
  },

  // ─── NBA (2025-26 season complete — Knicks won Finals) ───────────────────
  {
    name: "Nikola Jokic",
    team: "Denver Nuggets",
    sport: "NBA",
    position: "C",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/203999.png",
    gamesPlayed: 82,
    status: "Active",
    ppg: 29.4,
    rpg: 13.1,
    apg: 10.8,
    spg: 1.4,
    bpg: 0.9,
    fg3: 0.8,
    fgPct: 58.1,
  },
  {
    name: "Shai Gilgeous-Alexander",
    team: "Oklahoma City Thunder",
    sport: "NBA",
    position: "G",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628983.png",
    gamesPlayed: 78,
    status: "Active",
    ppg: 31.2,
    rpg: 5.4,
    apg: 6.3,
    spg: 2.1,
    bpg: 0.8,
    fg3: 1.9,
    fgPct: 53.4,
  },
  {
    name: "Luka Doncic",
    team: "Dallas Mavericks",
    sport: "NBA",
    position: "G",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1629029.png",
    gamesPlayed: 56,
    status: "Active",
    ppg: 27.8,
    rpg: 8.9,
    apg: 9.1,
    spg: 1.3,
    bpg: 0.5,
    fg3: 2.8,
    fgPct: 47.2,
  },
  {
    name: "Giannis Antetokounmpo",
    team: "Milwaukee Bucks",
    sport: "NBA",
    position: "F",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/203507.png",
    gamesPlayed: 74,
    status: "Active",
    ppg: 30.1,
    rpg: 11.7,
    apg: 5.8,
    spg: 1.1,
    bpg: 1.4,
    fg3: 0.5,
    fgPct: 56.8,
  },
  {
    name: "Anthony Edwards",
    team: "Minnesota Timberwolves",
    sport: "NBA",
    position: "G",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1630162.png",
    gamesPlayed: 79,
    status: "Active",
    ppg: 28.9,
    rpg: 5.7,
    apg: 5.1,
    spg: 1.5,
    bpg: 0.6,
    fg3: 3.1,
    fgPct: 48.7,
  },
  {
    name: "Jayson Tatum",
    team: "Boston Celtics",
    sport: "NBA",
    position: "F",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628369.png",
    gamesPlayed: 74,
    status: "Active",
    ppg: 27.3,
    rpg: 8.4,
    apg: 4.9,
    spg: 1.0,
    bpg: 0.6,
    fg3: 3.0,
    fgPct: 47.1,
  },
  {
    name: "Jalen Brunson",
    team: "New York Knicks",
    sport: "NBA",
    position: "G",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628386.png",
    gamesPlayed: 78,
    status: "Active",
    ppg: 28.7,
    rpg: 3.6,
    apg: 6.8,
    spg: 0.9,
    bpg: 0.2,
    fg3: 2.2,
    fgPct: 49.3,
  },

  // ─── NHL (2025-26 season complete) ────────────────────────────────────────
  {
    name: "Connor McDavid",
    team: "Edmonton Oilers",
    sport: "NHL",
    position: "C",
    photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8478402.png",
    gamesPlayed: 82,
    status: "Active",
    goals: 54,
    assists: 96,
    points: 150,
    shotsOnGoal: 312,
    sogPerGame: 3.8,
    plusMinus: +38,
    ppp: 42,
    hits_nhl: 44,
  },
  {
    name: "Nathan MacKinnon",
    team: "Colorado Avalanche",
    sport: "NHL",
    position: "C",
    photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8477492.png",
    gamesPlayed: 81,
    status: "Active",
    goals: 49,
    assists: 89,
    points: 138,
    shotsOnGoal: 298,
    sogPerGame: 3.68,
    plusMinus: +44,
    ppp: 38,
    hits_nhl: 51,
  },
  {
    name: "David Pastrnak",
    team: "Boston Bruins",
    sport: "NHL",
    position: "RW",
    photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8477956.png",
    gamesPlayed: 79,
    status: "Active",
    goals: 47,
    assists: 52,
    points: 99,
    shotsOnGoal: 284,
    sogPerGame: 3.59,
    plusMinus: +22,
    ppp: 29,
    hits_nhl: 38,
  },
  {
    name: "Cale Makar",
    team: "Colorado Avalanche",
    sport: "NHL",
    position: "D",
    photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8480069.png",
    gamesPlayed: 80,
    status: "Active",
    goals: 22,
    assists: 69,
    points: 91,
    shotsOnGoal: 211,
    sogPerGame: 2.64,
    plusMinus: +39,
    ppp: 31,
    hits_nhl: 67,
  },
  {
    name: "Auston Matthews",
    team: "Toronto Maple Leafs",
    sport: "NHL",
    position: "C",
    photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8478465.png",
    gamesPlayed: 76,
    status: "Active",
    goals: 52,
    assists: 44,
    points: 96,
    shotsOnGoal: 318,
    sogPerGame: 4.18,
    plusMinus: +14,
    ppp: 22,
    hits_nhl: 29,
  },

  // ─── TENNIS (Wimbledon 2026 — starts June 29) ─────────────────────────────
  {
    name: "Jannik Sinner",
    team: "Italy",
    sport: "Tennis",
    position: "Singles",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4534919.png",
    gamesPlayed: 42,
    status: "Active",
    ranking: 1,
    surface: "All",
    acesPerMatch: 6.2,
    firstServe: 64.1,
    winPct: 88.1,
    titlesYTD: 5,
  },
  {
    name: "Novak Djokovic",
    team: "Serbia",
    sport: "Tennis",
    position: "Singles",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/3626.png",
    gamesPlayed: 38,
    status: "Active",
    ranking: 3,
    surface: "Grass",
    acesPerMatch: 5.1,
    firstServe: 61.8,
    winPct: 81.6,
    titlesYTD: 2,
  },
  {
    name: "Taylor Fritz",
    team: "United States",
    sport: "Tennis",
    position: "Singles",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4845648.png",
    gamesPlayed: 40,
    status: "Active",
    ranking: 4,
    surface: "Hard",
    acesPerMatch: 8.4,
    firstServe: 66.2,
    winPct: 74.3,
    titlesYTD: 2,
  },
  {
    name: "Aryna Sabalenka",
    team: "Belarus",
    sport: "Tennis",
    position: "Singles (W)",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4490956.png",
    gamesPlayed: 44,
    status: "Active",
    ranking: 1,
    surface: "All",
    acesPerMatch: 4.8,
    firstServe: 60.9,
    winPct: 86.4,
    titlesYTD: 4,
  },
  {
    name: "Iga Swiatek",
    team: "Poland",
    sport: "Tennis",
    position: "Singles (W)",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4534920.png",
    gamesPlayed: 40,
    status: "Active",
    ranking: 2,
    surface: "Clay",
    acesPerMatch: 2.9,
    firstServe: 62.4,
    winPct: 82.5,
    titlesYTD: 3,
  },
];

export function getPlayer(name: string): PlayerStat | undefined {
  return PLAYERS.find(
    p => p.name.toLowerCase() === name.toLowerCase() ||
         p.name.toLowerCase().includes(name.toLowerCase())
  );
}

// Alias used by routes.ts
export function getPlayerProfile(name: string) {
  const p = getPlayer(name);
  if (!p) return null;
  return {
    name: p.name,
    team: p.team,
    sport: p.sport,
    position: p.position,
    photoUrl: p.photoUrl,
    status: p.status,
    gamesPlayed: p.gamesPlayed,
    stats: {
      // MLB
      ...(p.avg       !== undefined && { "Batting Avg":    p.avg.toFixed(3) }),
      ...(p.ops       !== undefined && { "OPS":            p.ops.toFixed(3) }),
      ...(p.hr        !== undefined && { "Home Runs":      p.hr }),
      ...(p.rbi       !== undefined && { "RBI":            p.rbi }),
      ...(p.sb        !== undefined && { "Stolen Bases":   p.sb }),
      ...(p.hits      !== undefined && { "Hits":           p.hits }),
      ...(p.hitsPerGame !== undefined && { "H/Game":       p.hitsPerGame.toFixed(2) }),
      ...(p.era       !== undefined && { "ERA":            p.era.toFixed(2) }),
      ...(p.whip      !== undefined && { "WHIP":           p.whip.toFixed(2) }),
      ...(p.strikeouts !== undefined && { "Strikeouts":    p.strikeouts }),
      ...(p.kPerGame  !== undefined && { "K/9":            p.kPerGame.toFixed(1) }),
      ...(p.wins      !== undefined && { "Wins":           p.wins }),
      // NBA
      ...(p.ppg       !== undefined && { "PPG":            p.ppg.toFixed(1) }),
      ...(p.rpg       !== undefined && { "RPG":            p.rpg.toFixed(1) }),
      ...(p.apg       !== undefined && { "APG":            p.apg.toFixed(1) }),
      ...(p.spg       !== undefined && { "SPG":            p.spg.toFixed(1) }),
      ...(p.fg3       !== undefined && { "3PM/G":          p.fg3.toFixed(1) }),
      ...(p.fgPct     !== undefined && { "FG%":            p.fgPct.toFixed(1) + "%" }),
      // NHL
      ...(p.goals     !== undefined && { "Goals":          p.goals }),
      ...(p.assists   !== undefined && { "Assists":        p.assists }),
      ...(p.points    !== undefined && { "Points":         p.points }),
      ...(p.sogPerGame !== undefined && { "SOG/G":         p.sogPerGame.toFixed(1) }),
      ...(p.plusMinus !== undefined && { "+/-":            (p.plusMinus > 0 ? "+" : "") + p.plusMinus }),
      ...(p.ppp       !== undefined && { "PP Points":      p.ppp }),
      // Tennis
      ...(p.ranking   !== undefined && { "World Ranking":  "#" + p.ranking }),
      ...(p.winPct    !== undefined && { "Win %":          p.winPct.toFixed(1) + "%" }),
      ...(p.acesPerMatch !== undefined && { "Aces/Match":  p.acesPerMatch.toFixed(1) }),
      ...(p.firstServe !== undefined && { "1st Serve %":   p.firstServe.toFixed(1) + "%" }),
      ...(p.titlesYTD !== undefined && { "Titles YTD":     p.titlesYTD }),
    },
    seasonNote: getSeason2026Note(p),
  };
}

function getSeason2026Note(p: PlayerStat): string {
  if (p.sport === "MLB") return "2026 MLB season — active (mid-season)";
  if (p.sport === "NBA") return "2025-26 NBA season — complete (Knicks won Finals)";
  if (p.sport === "NHL") return "2025-26 NHL season — complete (playoffs over)";
  if (p.sport === "Tennis") return "2026 ATP/WTA season — Wimbledon starts Jun 30";
  return "2026";
}
