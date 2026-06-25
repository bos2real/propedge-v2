// ─────────────────────────────────────────────────────────────────────────────
// Fantasy & Exchange Engine — in-memory data for Fantasy AI, Leaderboard, Exchange
// ─────────────────────────────────────────────────────────────────────────────

// ── INJURY REPORTS ──────────────────────────────────────────────────────────
export interface InjuryReport {
  player: string;
  team: string;
  sport: string;
  status: "Out" | "Doubtful" | "Questionable" | "Day-to-Day" | "Active";
  injury: string;
  lastUpdate: string;
  impactScore: number; // 1-10, how much this affects prop value
  recommendation: string;
}

export const injuryReports: InjuryReport[] = [
  { player: "Shohei Ohtani",       team: "LAD", sport: "MLB",    status: "Active",       injury: "Elbow monitoring",   lastUpdate: "Jun 24",  impactScore: 2,  recommendation: "Safe to play — minor precaution only" },
  { player: "Freddie Freeman",      team: "LAD", sport: "MLB",    status: "Active",       injury: "Ankle discomfort",   lastUpdate: "Jun 23",  impactScore: 3,  recommendation: "Trending up — start with normal projection" },
  { player: "Aaron Judge",          team: "NYY", sport: "MLB",    status: "Day-to-Day",   injury: "Left knee soreness", lastUpdate: "Jun 24",  impactScore: 6,  recommendation: "Wait for pregame confirmation before playing" },
  { player: "Juan Soto",            team: "NYY", sport: "MLB",    status: "Active",       injury: "None",               lastUpdate: "Jun 24",  impactScore: 0,  recommendation: "Full go — one of your best targets" },
  { player: "Gerrit Cole",          team: "NYY", sport: "MLB",    status: "Active",       injury: "None",               lastUpdate: "Jun 24",  impactScore: 0,  recommendation: "Strong K upside vs weak lineup" },
  { player: "Blake Snell",          team: "LAD", sport: "MLB",    status: "Questionable", injury: "Lower back tightness",lastUpdate: "Jun 24", impactScore: 7,  recommendation: "Risky — have a backup pitcher ready" },
  { player: "Ronald Acuña Jr.",     team: "ATL", sport: "MLB",    status: "Day-to-Day",   injury: "Knee inflammation",  lastUpdate: "Jun 24",  impactScore: 5,  recommendation: "Check 30 min before lock — may sit" },
  { player: "Fernando Tatis Jr.",   team: "SD",  sport: "MLB",    status: "Active",       injury: "None",               lastUpdate: "Jun 24",  impactScore: 0,  recommendation: "Prime target — hot streak, 4-game HR streak" },
  { player: "Jannik Sinner",        team: "ITA", sport: "Tennis", status: "Active",       injury: "None",               lastUpdate: "Jun 24",  impactScore: 0,  recommendation: "Top pick for Wimbledon aces/games markets" },
  { player: "Carlos Alcaraz",       team: "ESP", sport: "Tennis", status: "Active",       injury: "Wrist check",        lastUpdate: "Jun 23",  impactScore: 2,  recommendation: "Cleared for Wimbledon — play with confidence" },
  { player: "Julio Rodriguez",      team: "SEA", sport: "MLB",    status: "Active",       injury: "None",               lastUpdate: "Jun 24",  impactScore: 0,  recommendation: "Stolen base machine — SB Over is a lock" },
  { player: "Vladimir Guerrero Jr.",team: "TOR", sport: "MLB",    status: "Active",       injury: "None",               lastUpdate: "Jun 24",  impactScore: 0,  recommendation: "Hot bat — hits Over has hit 9 of last 10" },
];

// ── FANTASY LINEUP SLOTS ────────────────────────────────────────────────────
export interface FantasyPlayer {
  id: number;
  name: string;
  team: string;
  sport: string;
  position: string;
  salary: number;      // DFS salary ($)
  projPoints: number;  // projected fantasy points
  value: number;       // points per $1k (efficiency)
  ownership: number;   // % owned in contests
  edge: "elite" | "high" | "mid" | "low";
  aiRec: "Must Start" | "Start" | "Flex" | "Sit" | "Avoid";
  reasoning: string;
  trend: "up" | "down" | "flat";
  matchup: string;
  matchupGrade: "A" | "B" | "C" | "D" | "F";
  injuryStatus: string;
  recentForm: number[];  // last 5 game fantasy scores
}

let fpId = 1;

function fp(d: Omit<FantasyPlayer, "id">): FantasyPlayer {
  return { id: fpId++, ...d };
}

export const fantasyPlayers: FantasyPlayer[] = [
  fp({ name: "Shohei Ohtani",     team: "LAD", sport: "MLB", position: "OF", salary: 10200, projPoints: 42.8, value: 4.2, ownership: 34, edge: "elite", aiRec: "Must Start", reasoning: "Facing weak pitching, 1.124 OPS in June, Dodger Stadium boost", trend: "up",   matchup: "vs COL RHP",  matchupGrade: "A", injuryStatus: "Active",  recentForm: [38,45,52,41,48] }),
  fp({ name: "Fernando Tatis Jr.",team: "SD",  sport: "MLB", position: "SS", salary: 9400,  projPoints: 39.2, value: 4.2, ownership: 28, edge: "elite", aiRec: "Must Start", reasoning: "4-game HR streak, .342 avg in June, favorable righty vs lefty",  trend: "up",   matchup: "vs MIA LHP",  matchupGrade: "A", injuryStatus: "Active",  recentForm: [42,36,48,41,55] }),
  fp({ name: "Julio Rodriguez",   team: "SEA", sport: "MLB", position: "OF", salary: 8800,  projPoints: 36.1, value: 4.1, ownership: 22, edge: "high",  aiRec: "Must Start", reasoning: "12 SB in last 20 games, batting .318, top SB value in slate",     trend: "up",   matchup: "vs TEX RHP",  matchupGrade: "B", injuryStatus: "Active",  recentForm: [34,38,42,31,46] }),
  fp({ name: "Aaron Judge",       team: "NYY", sport: "MLB", position: "OF", salary: 9800,  projPoints: 28.4, value: 2.9, ownership: 19, edge: "mid",   aiRec: "Sit",        reasoning: "Knee soreness — wait for game-day confirmation before rostering",  trend: "down", matchup: "vs BOS RHP",  matchupGrade: "B", injuryStatus: "D2D",   recentForm: [41,37,0,29,33] }),
  fp({ name: "Gerrit Cole",       team: "NYY", sport: "MLB", position: "SP", salary: 9600,  projPoints: 38.5, value: 4.0, ownership: 31, edge: "elite", aiRec: "Must Start", reasoning: "9.4 K/9, facing Oakland who strike out 27%, elite floor ceiling", trend: "up",   matchup: "vs OAK",      matchupGrade: "A", injuryStatus: "Active",  recentForm: [44,38,41,36,50] }),
  fp({ name: "Blake Snell",       team: "LAD", sport: "MLB", position: "SP", salary: 8200,  projPoints: 22.0, value: 2.7, ownership: 12, edge: "low",   aiRec: "Avoid",      reasoning: "Back tightness — high risk of being scratched pre-game",          trend: "down", matchup: "vs SF",       matchupGrade: "B", injuryStatus: "Quest", recentForm: [36,42,0,38,31] }),
  fp({ name: "Vladimir Guerrero", team: "TOR", sport: "MLB", position: "1B", salary: 8600,  projPoints: 34.8, value: 4.0, ownership: 18, edge: "high",  aiRec: "Start",      reasoning: "9/10 on Hits Over, .334 avg vs RHP this month, prime target",    trend: "up",   matchup: "vs BAL RHP",  matchupGrade: "B", injuryStatus: "Active",  recentForm: [32,35,41,38,44] }),
  fp({ name: "Mookie Betts",      team: "LAD", sport: "MLB", position: "OF", salary: 9100,  projPoints: 35.6, value: 3.9, ownership: 24, edge: "high",  aiRec: "Start",      reasoning: "Multi-hit in 6 of last 8, leadoff spot maximizes PA count",      trend: "up",   matchup: "vs SF LHP",   matchupGrade: "B", injuryStatus: "Active",  recentForm: [38,33,42,36,40] }),
  fp({ name: "Jannik Sinner",     team: "ITA", sport: "Tennis", position: "TOP",salary: 9900, projPoints: 44.2,value: 4.5, ownership: 42, edge: "elite", aiRec: "Must Start", reasoning: "World #1 at Wimbledon, 8 aces/match avg on grass, elite ceiling", trend: "up",   matchup: "vs R1 seed",  matchupGrade: "A", injuryStatus: "Active",  recentForm: [48,44,51,46,52] }),
  fp({ name: "Carlos Alcaraz",    team: "ESP", sport: "Tennis", position: "TOP",salary: 9700, projPoints: 43.1,value: 4.4, ownership: 38, edge: "elite", aiRec: "Must Start", reasoning: "Reigning Wimbledon champion, grass specialist, cleared from wrist", trend: "up",  matchup: "vs R1 seed",  matchupGrade: "A", injuryStatus: "Active",  recentForm: [46,50,44,48,53] }),
  fp({ name: "Bryce Harper",      team: "PHI", sport: "MLB", position: "1B", salary: 8900,  projPoints: 33.2, value: 3.7, ownership: 21, edge: "high",  aiRec: "Start",      reasoning: "xwOBA .398 in June, Philly's most consistent bat, good matchup", trend: "flat", matchup: "vs NYM RHP",  matchupGrade: "B", injuryStatus: "Active",  recentForm: [35,31,38,36,34] }),
  fp({ name: "Ronald Acuña Jr.",  team: "ATL", sport: "MLB", position: "OF", salary: 9200,  projPoints: 24.5, value: 2.7, ownership: 14, edge: "mid",   aiRec: "Flex",       reasoning: "Knee monitoring — reduced load possible, check lineup at lock",   trend: "down", matchup: "vs WSH",      matchupGrade: "B", injuryStatus: "D2D",   recentForm: [40,36,28,24,22] }),
];

// ── TRADE ANALYZER ──────────────────────────────────────────────────────────
export interface TradeAnalysis {
  playerA: string;
  playerB: string;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  recommendation: "Accept" | "Decline" | "Counter";
  explanation: string;
  winnerBy: number; // % edge in favor of accepting
}

export function analyzeTrade(playerA: string, playerB: string): TradeAnalysis {
  const a = fantasyPlayers.find(p => p.name.toLowerCase().includes(playerA.toLowerCase()));
  const b = fantasyPlayers.find(p => p.name.toLowerCase().includes(playerB.toLowerCase()));

  if (!a || !b) {
    return {
      playerA, playerB,
      grade: "C", recommendation: "Counter",
      explanation: "Not enough data to analyze this trade. Gather more season context.",
      winnerBy: 0,
    };
  }

  const diff = a.projPoints - b.projPoints;
  const rec = diff > 5 ? "Accept" : diff < -5 ? "Decline" : "Counter";
  const grade = diff > 8 ? "A+" : diff > 5 ? "A" : diff > 2 ? "B+" : diff > 0 ? "B" : diff > -3 ? "C" : "D";
  const explanation = diff > 0
    ? `${a.name} projects ${diff.toFixed(1)} more pts. ${a.aiRec === "Must Start" ? "Must-start value wins the trade." : "Slightly favors you."} ${a.matchup} matchup grades ${a.matchupGrade}.`
    : `${b.name} has the edge by ${Math.abs(diff).toFixed(1)} pts. ${b.aiRec} status, ${b.matchup} matchup is ${b.matchupGrade}.`;

  return { playerA: a.name, playerB: b.name, grade, recommendation: rec, explanation, winnerBy: Math.abs(diff) };
}

// ── LEADERBOARD ──────────────────────────────────────────────────────────────
export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  streak: number;
  winRate: number;
  totalPicks: number;
  badge: string;
  tier: "Legend" | "Diamond" | "Gold" | "Silver" | "Bronze";
  sport: string;
  change: number; // rank change today
  isYou?: boolean;
}

export const leaderboard: LeaderboardUser[] = [
  { rank: 1,  username: "SharpEdge_Kyle",   avatar: "SK", points: 9840, streak: 14, winRate: 78, totalPicks: 312, badge: "🏆 Legend",      tier: "Legend",  sport: "MLB",    change: 0  },
  { rank: 2,  username: "PropsKing_V",       avatar: "PK", points: 9220, streak: 11, winRate: 74, totalPicks: 280, badge: "💎 Diamond Ace",  tier: "Diamond", sport: "All",    change: +1 },
  { rank: 3,  username: "OverUnderGuru",     avatar: "OG", points: 8790, streak: 9,  winRate: 72, totalPicks: 265, badge: "🔥 Hot Streak",   tier: "Diamond", sport: "NBA",    change: -1 },
  { rank: 4,  username: "LineMoverMax",      avatar: "LM", points: 8140, streak: 7,  winRate: 70, totalPicks: 248, badge: "📈 EV Hunter",    tier: "Gold",    sport: "MLB",    change: +2 },
  { rank: 5,  username: "StatBoyRichie",     avatar: "SR", points: 7680, streak: 6,  winRate: 68, totalPicks: 231, badge: "🎯 Sniper",       tier: "Gold",    sport: "Tennis", change: -1 },
  { rank: 6,  username: "WimbledonWatcher",  avatar: "WW", points: 7210, streak: 5,  winRate: 67, totalPicks: 210, badge: "🎾 Grass Court",  tier: "Gold",    sport: "Tennis", change: +3 },
  { rank: 7,  username: "PropEdge_OG",       avatar: "PE", points: 6890, streak: 4,  winRate: 65, totalPicks: 198, badge: "⚡ Rising Star",  tier: "Gold",    sport: "All",    change: 0  },
  { rank: 8,  username: "IceCapPicks",       avatar: "IC", points: 6340, streak: 3,  winRate: 64, totalPicks: 185, badge: "🏒 Puck Wizard",  tier: "Silver",  sport: "NHL",    change: +1 },
  { rank: 9,  username: "DailyGrinder99",    avatar: "DG", points: 5920, streak: 8,  winRate: 63, totalPicks: 172, badge: "💪 Consistent",   tier: "Silver",  sport: "MLB",    change: -2 },
  { rank: 10, username: "PropsNotBombs",     avatar: "PB", points: 5540, streak: 2,  winRate: 62, totalPicks: 164, badge: "🧠 Big Brain",    tier: "Silver",  sport: "All",    change: +4 },
  { rank: 11, username: "BaselineBreaker",   avatar: "BB", points: 5180, streak: 5,  winRate: 61, totalPicks: 158, badge: "🎾 Ace Machine",  tier: "Silver",  sport: "Tennis", change: -1 },
  { rank: 12, username: "NightOwlSharp",     avatar: "NO", points: 4820, streak: 3,  winRate: 60, totalPicks: 149, badge: "🦉 Late Night",   tier: "Silver",  sport: "NBA",    change: 0  },
  { rank: 13, username: "You",               avatar: "ME", points: 4210, streak: 2,  winRate: 58, totalPicks: 88,  badge: "⚡ Climbing",     tier: "Bronze",  sport: "All",    change: +5, isYou: true },
  { rank: 14, username: "TheLineStealer",    avatar: "LS", points: 3980, streak: 1,  winRate: 57, totalPicks: 134, badge: "📊 Analyst",      tier: "Bronze",  sport: "MLB",    change: -3 },
  { rank: 15, username: "AceServeAlpha",     avatar: "AA", points: 3740, streak: 4,  winRate: 56, totalPicks: 120, badge: "🎯 Sharp",        tier: "Bronze",  sport: "Tennis", change: +2 },
];

// ── PROP EXCHANGE ────────────────────────────────────────────────────────────
export interface ExchangeProp {
  id: number;
  player: string;
  team: string;
  sport: string;
  market: string;
  line: number;
  overOdds: number;   // implied % (e.g., 54%)
  underOdds: number;  // implied % (e.g., 46%)
  overCount: number;  // community votes
  underCount: number;
  aiSide: "Over" | "Under";
  aiConfidence: number;
  totalVolume: number;
  closes: string; // game time
  status: "open" | "live" | "settled";
  result?: "Over" | "Under";
  trending: boolean;
}

let exchId = 1;
function ex(d: Omit<ExchangeProp, "id">): ExchangeProp { return { id: exchId++, ...d }; }

export const exchangeProps: ExchangeProp[] = [
  ex({ player: "Shohei Ohtani",       team: "LAD", sport: "MLB",    market: "Total Bases", line: 2.5, overOdds: 58, underOdds: 42, overCount: 342, underCount: 218, aiSide: "Over", aiConfidence: 82, totalVolume: 560, closes: "7:10 PM ET", status: "open",   trending: true  }),
  ex({ player: "Fernando Tatis Jr.",   team: "SD",  sport: "MLB",    market: "Hits",        line: 1.5, overOdds: 62, underOdds: 38, overCount: 287, underCount: 143, aiSide: "Over", aiConfidence: 79, totalVolume: 430, closes: "9:40 PM ET", status: "open",   trending: true  }),
  ex({ player: "Gerrit Cole",          team: "NYY", sport: "MLB",    market: "Strikeouts",  line: 7.5, overOdds: 55, underOdds: 45, overCount: 198, underCount: 167, aiSide: "Over", aiConfidence: 74, totalVolume: 365, closes: "7:05 PM ET", status: "live",   trending: false }),
  ex({ player: "Julio Rodriguez",      team: "SEA", sport: "MLB",    market: "Stolen Bases",line: 0.5, overOdds: 68, underOdds: 32, overCount: 412, underCount: 88,  aiSide: "Over", aiConfidence: 88, totalVolume: 500, closes: "9:40 PM ET", status: "open",   trending: true  }),
  ex({ player: "Vladimir Guerrero Jr.",team: "TOR", sport: "MLB",    market: "Hits",        line: 1.5, overOdds: 64, underOdds: 36, overCount: 256, underCount: 114, aiSide: "Over", aiConfidence: 81, totalVolume: 370, closes: "7:07 PM ET", status: "open",   trending: false }),
  ex({ player: "Jannik Sinner",        team: "ITA", sport: "Tennis", market: "Aces",        line: 6.5, overOdds: 60, underOdds: 40, overCount: 198, underCount: 132, aiSide: "Over", aiConfidence: 76, totalVolume: 330, closes: "Wimbledon",  status: "open",   trending: true  }),
  ex({ player: "Carlos Alcaraz",       team: "ESP", sport: "Tennis", market: "Games Won",   line: 9.5, overOdds: 57, underOdds: 43, overCount: 176, underCount: 144, aiSide: "Over", aiConfidence: 71, totalVolume: 320, closes: "Wimbledon",  status: "open",   trending: false }),
  ex({ player: "Aaron Judge",          team: "NYY", sport: "MLB",    market: "Home Runs",   line: 0.5, overOdds: 38, underOdds: 62, overCount: 112, underCount: 224, aiSide: "Under",aiConfidence: 67, totalVolume: 336, closes: "7:05 PM ET", status: "open",   trending: false }),
  ex({ player: "Mookie Betts",         team: "LAD", sport: "MLB",    market: "Hits",        line: 1.5, overOdds: 61, underOdds: 39, overCount: 221, underCount: 139, aiSide: "Over", aiConfidence: 77, totalVolume: 360, closes: "7:10 PM ET", status: "open",   trending: false }),
  ex({ player: "Bryce Harper",         team: "PHI", sport: "MLB",    market: "Total Bases", line: 1.5, overOdds: 59, underOdds: 41, overCount: 188, underCount: 132, aiSide: "Over", aiConfidence: 73, totalVolume: 320, closes: "7:05 PM ET", status: "open",   trending: false }),
  ex({ player: "Freddie Freeman",      team: "LAD", sport: "MLB",    market: "RBI",         line: 0.5, overOdds: 65, underOdds: 35, overCount: 310, underCount: 130, aiSide: "Over", aiConfidence: 84, totalVolume: 440, closes: "7:10 PM ET", status: "live",   trending: true  }),
  ex({ player: "Corey Seager",         team: "TEX", sport: "MLB",    market: "Total Bases", line: 2.5, overOdds: 52, underOdds: 48, overCount: 145, underCount: 155, aiSide: "Under",aiConfidence: 62, totalVolume: 300, closes: "8:05 PM ET", status: "open",   trending: false }),
];

// ── USER PICK RECORD (simulated "You") ───────────────────────────────────────
export interface UserPickRecord {
  propId: number;
  side: "Over" | "Under";
  timestamp: number;
  result?: "win" | "loss" | "pending";
  points: number;
}

export const userPicks: UserPickRecord[] = [];
