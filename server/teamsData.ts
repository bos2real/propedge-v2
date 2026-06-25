// ─────────────────────────────────────────────────────────────────────────────
// PropEdge v4.0 — Teams Data Engine
// All 4 sports: MLB, NBA, NHL, Tennis
// Data current as of June 24, 2026
// ─────────────────────────────────────────────────────────────────────────────

export interface TeamRecord {
  wins: number;
  losses: number;
  pct?: number;  // win %
  gb?: string;   // games behind
  streak?: string;
  lastTen?: string;
  divRank?: number;
}

export interface TeamPlayer {
  name: string;
  position: string;
  number: string;
  age: number;
  photoUrl: string;
  keyStats: Record<string, string>;
  role: "Star" | "Starter" | "Role Player" | "Bench";
  injuryStatus?: string;
  propTip?: string;  // betting tip for this player
}

export interface UpcomingGame {
  date: string;
  time: string;
  opponent: string;
  opponentLogo?: string;
  home: boolean;
  venue: string;
  tvNetwork: string;
  gameType: "Regular" | "Playoff" | "Preseason";
  propOdds?: string;  // quick prop note
}

export interface TeamStats {
  offenseRank?: number;
  defenseRank?: number;
  label1: string; val1: string;
  label2: string; val2: string;
  label3: string; val3: string;
  label4: string; val4: string;
  label5?: string; val5?: string;
  label6?: string; val6?: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  sport: "MLB" | "NBA" | "NHL" | "Tennis";
  division: string;
  conference?: string;
  primaryColor: string;
  secondaryColor: string;
  logoEmoji: string;
  logoUrl?: string;
  stadium: string;
  established: number;
  record: TeamRecord;
  standing: string;
  teamStats: TeamStats;
  roster: TeamPlayer[];
  upcomingGames: UpcomingGame[];
  aiNote: string;        // AI summary of team form
  propHotspot: string;   // best prop market for this team
  bettingTrend: "Hot" | "Cold" | "Neutral";
}

// ── MLB TEAMS ────────────────────────────────────────────────────────────────
const mlbTeams: Team[] = [
  {
    id: "lad",
    name: "Dodgers", city: "Los Angeles", abbreviation: "LAD",
    sport: "MLB", division: "NL West",
    primaryColor: "hsl(213 100% 40%)", secondaryColor: "hsl(0 0% 95%)",
    logoEmoji: "⚾", stadium: "Dodger Stadium",
    established: 1883,
    record: { wins: 52, losses: 26, pct: 0.667, gb: "—", streak: "W5", lastTen: "8-2", divRank: 1 },
    standing: "1st NL West · Best record in NL",
    teamStats: {
      offenseRank: 1, defenseRank: 4,
      label1: "Team AVG", val1: ".274", label2: "Team HR", val2: "118",
      label3: "Team ERA", val3: "3.24", label4: "Runs/Game", val4: "5.6",
      label5: "WHIP", val5: "1.11", label6: "OPS", val6: ".821",
    },
    roster: [
      { name: "Shohei Ohtani", position: "DH", number: "17", age: 32, photoUrl: "https://midfield.mlbstatic.com/v1/people/660271/spots/120", keyStats: { AVG: ".312", HR: "28", RBI: "72", OPS: "1.041" }, role: "Star", propTip: "Total Bases Over 1.5 — hits hard and often" },
      { name: "Freddie Freeman", position: "1B", number: "5", age: 37, photoUrl: "https://midfield.mlbstatic.com/v1/people/518692/spots/120", keyStats: { AVG: ".298", HR: "18", RBI: "65", OPS: ".952" }, role: "Star", propTip: "Hits Over 1.5 — 9/10 streak this month" },
      { name: "Mookie Betts", position: "CF/SS", number: "50", age: 34, photoUrl: "https://midfield.mlbstatic.com/v1/people/605141/spots/120", keyStats: { AVG: ".291", HR: "16", RBI: "54", OPS: ".921" }, role: "Star", propTip: "Runs Scored Over 0.5 — leads off and gets on base" },
      { name: "Blake Snell", position: "SP", number: "4", age: 33, photoUrl: "https://midfield.mlbstatic.com/v1/people/605483/spots/120", keyStats: { ERA: "3.18", K: "102", WHIP: "1.14", W: "7" }, role: "Starter", injuryStatus: "Questionable", propTip: "Avoid — back tightness, scratch risk" },
      { name: "Will Smith", position: "C", number: "16", age: 30, photoUrl: "https://midfield.mlbstatic.com/v1/people/669257/spots/120", keyStats: { AVG: ".271", HR: "12", RBI: "42", OPS: ".848" }, role: "Starter", propTip: "RBI Over 0.5 — bats in the thick of the order" },
    ],
    upcomingGames: [
      { date: "Jun 25", time: "7:10 PM ET", opponent: "San Francisco Giants", home: true, venue: "Dodger Stadium", tvNetwork: "SportsNet LA", gameType: "Regular", propOdds: "Ohtani TB Over 1.5 favored" },
      { date: "Jun 26", time: "7:10 PM ET", opponent: "San Francisco Giants", home: true, venue: "Dodger Stadium", tvNetwork: "SportsNet LA", gameType: "Regular" },
      { date: "Jun 27", time: "4:05 PM ET", opponent: "San Francisco Giants", home: true, venue: "Dodger Stadium", tvNetwork: "ESPN", gameType: "Regular" },
      { date: "Jun 28", time: "6:05 PM ET", opponent: "Colorado Rockies", home: false, venue: "Coors Field", tvNetwork: "SportsNet LA", gameType: "Regular", propOdds: "High scoring — total bases props hit well at Coors" },
      { date: "Jun 29", time: "3:10 PM ET", opponent: "Colorado Rockies", home: false, venue: "Coors Field", tvNetwork: "ESPN+", gameType: "Regular" },
    ],
    aiNote: "Best rotation depth in NL. Ohtani is the centerpiece — 5-game hitting streak entering tonight. Betts/Freeman/Ohtani 1-2-3 is the best top-3 in baseball. Watch the SP slot closely if Snell misses.",
    propHotspot: "Ohtani Total Bases + Freeman Hits",
    bettingTrend: "Hot",
  },
  {
    id: "nyy",
    name: "Yankees", city: "New York", abbreviation: "NYY",
    sport: "MLB", division: "AL East",
    primaryColor: "hsl(214 100% 20%)", secondaryColor: "hsl(0 0% 95%)",
    logoEmoji: "⚾", stadium: "Yankee Stadium",
    established: 1901,
    record: { wins: 48, losses: 30, pct: 0.615, gb: "—", streak: "W3", lastTen: "7-3", divRank: 1 },
    standing: "1st AL East",
    teamStats: {
      offenseRank: 2, defenseRank: 6,
      label1: "Team AVG", val1: ".262", label2: "Team HR", val2: "131",
      label3: "Team ERA", val3: "3.61", label4: "Runs/Game", val4: "5.4",
      label5: "WHIP", val5: "1.19", label6: "OPS", val6: ".798",
    },
    roster: [
      { name: "Aaron Judge", position: "RF", number: "99", age: 34, photoUrl: "https://midfield.mlbstatic.com/v1/people/592450/spots/120", keyStats: { AVG: ".291", HR: "32", RBI: "78", OPS: "1.008" }, role: "Star", injuryStatus: "Day-to-Day", propTip: "Monitor — knee soreness, confirm lineup before picking" },
      { name: "Gerrit Cole", position: "SP", number: "45", age: 36, photoUrl: "https://midfield.mlbstatic.com/v1/people/543037/spots/120", keyStats: { ERA: "3.12", K: "131", WHIP: "1.06", W: "9" }, role: "Star", propTip: "Strikeouts Over 7.5 — elite K rate vs weak lineups" },
      { name: "Juan Soto", position: "LF", number: "22", age: 28, photoUrl: "https://midfield.mlbstatic.com/v1/people/665742/spots/120", keyStats: { AVG: ".305", HR: "22", RBI: "71", OPS: "1.012" }, role: "Star", propTip: "Hits Over 1.5 — .305 avg and excellent plate vision" },
      { name: "Giancarlo Stanton", position: "DH", number: "27", age: 37, photoUrl: "https://midfield.mlbstatic.com/v1/people/519317/spots/120", keyStats: { AVG: ".241", HR: "24", RBI: "63", OPS: ".882" }, role: "Starter", propTip: "HR Over 0.5 — power hitter in a big ballpark" },
      { name: "Jazz Chisholm Jr.", position: "2B", number: "13", age: 28, photoUrl: "https://midfield.mlbstatic.com/v1/people/665750/spots/120", keyStats: { AVG: ".268", HR: "18", SB: "19", OPS: ".861" }, role: "Starter", propTip: "Stolen Bases — active on the basepaths" },
    ],
    upcomingGames: [
      { date: "Jun 25", time: "7:05 PM ET", opponent: "Boston Red Sox", home: false, venue: "Fenway Park", tvNetwork: "YES/NESN", gameType: "Regular", propOdds: "Cole K Over 7.5 value" },
      { date: "Jun 26", time: "7:10 PM ET", opponent: "Boston Red Sox", home: false, venue: "Fenway Park", tvNetwork: "MLB Network", gameType: "Regular" },
      { date: "Jun 27", time: "4:05 PM ET", opponent: "Boston Red Sox", home: false, venue: "Fenway Park", tvNetwork: "ESPN", gameType: "Regular" },
      { date: "Jun 28", time: "1:05 PM ET", opponent: "Tampa Bay Rays", home: true, venue: "Yankee Stadium", tvNetwork: "YES", gameType: "Regular" },
      { date: "Jun 29", time: "7:05 PM ET", opponent: "Tampa Bay Rays", home: true, venue: "Yankee Stadium", tvNetwork: "YES", gameType: "Regular" },
    ],
    aiNote: "Judge's knee is the X-factor. When he plays, the NYY offense is elite — when he sits, they're vulnerable. Cole is a lock start every 5 days. Soto/Judge/Stanton is a terrifying 2-3-4 when healthy.",
    propHotspot: "Cole Strikeouts + Judge HR",
    bettingTrend: "Neutral",
  },
  {
    id: "atl",
    name: "Braves", city: "Atlanta", abbreviation: "ATL",
    sport: "MLB", division: "NL East",
    primaryColor: "hsl(5 90% 40%)", secondaryColor: "hsl(45 100% 55%)",
    logoEmoji: "⚾", stadium: "Truist Park",
    established: 1871,
    record: { wins: 46, losses: 31, pct: 0.597, gb: "2.0", streak: "W2", lastTen: "6-4", divRank: 2 },
    standing: "2nd NL East · 2.0 GB Phillies",
    teamStats: {
      offenseRank: 3, defenseRank: 8,
      label1: "Team AVG", val1: ".267", label2: "Team HR", val2: "109",
      label3: "Team ERA", val3: "3.88", label4: "Runs/Game", val4: "5.1",
      label5: "WHIP", val5: "1.22", label6: "OPS", val6: ".792",
    },
    roster: [
      { name: "Ronald Acuña Jr.", position: "RF", number: "13", age: 26, photoUrl: "https://midfield.mlbstatic.com/v1/people/660670/spots/120", keyStats: { AVG: ".305", HR: "19", SB: "28", OPS: ".987" }, role: "Star", injuryStatus: "Day-to-Day", propTip: "SB Over 0.5 — stolen base machine when healthy" },
      { name: "Spencer Strider", position: "SP", number: "99", age: 26, photoUrl: "https://midfield.mlbstatic.com/v1/people/675911/spots/120", keyStats: { ERA: "2.74", K: "142", WHIP: ".98", W: "8" }, role: "Star", propTip: "K Over 8.5 — elite strikeout rate, 11.2 K/9" },
      { name: "Matt Olson", position: "1B", number: "28", age: 32, photoUrl: "https://midfield.mlbstatic.com/v1/people/621566/spots/120", keyStats: { AVG: ".249", HR: "26", RBI: "72", OPS: ".891" }, role: "Star", propTip: "HR Over 0.5 — premium power bat, good park for HR" },
      { name: "Ozzie Albies", position: "2B", number: "1", age: 30, photoUrl: "https://midfield.mlbstatic.com/v1/people/645277/spots/120", keyStats: { AVG: ".274", HR: "14", RBI: "52", OPS: ".821" }, role: "Starter", propTip: "Hits Over 1.5 — consistent contact hitter" },
      { name: "Michael Harris II", position: "CF", number: "23", age: 24, photoUrl: "https://midfield.mlbstatic.com/v1/people/694196/spots/120", keyStats: { AVG: ".261", HR: "11", SB: "16", OPS: ".791" }, role: "Starter", propTip: "Stolen Bases — speedy young outfielder" },
    ],
    upcomingGames: [
      { date: "Jun 25", time: "7:20 PM ET", opponent: "Washington Nationals", home: true, venue: "Truist Park", tvNetwork: "Bally Sports SE", gameType: "Regular", propOdds: "Strider K Over 8.5 recommended" },
      { date: "Jun 26", time: "7:20 PM ET", opponent: "Washington Nationals", home: true, venue: "Truist Park", tvNetwork: "Bally Sports SE", gameType: "Regular" },
      { date: "Jun 27", time: "7:20 PM ET", opponent: "Washington Nationals", home: true, venue: "Truist Park", tvNetwork: "ESPN", gameType: "Regular" },
      { date: "Jun 28", time: "7:05 PM ET", opponent: "New York Mets", home: false, venue: "Citi Field", tvNetwork: "Bally/SNY", gameType: "Regular" },
      { date: "Jun 29", time: "1:40 PM ET", opponent: "New York Mets", home: false, venue: "Citi Field", tvNetwork: "ESPN", gameType: "Regular" },
    ],
    aiNote: "Acuña's health is the biggest variable. Strider is one of the most dominant SPs in baseball right now. Olson/Strider make this team dangerous. Monitor Acuña status daily before placing props.",
    propHotspot: "Strider Strikeouts",
    bettingTrend: "Hot",
  },
  {
    id: "sea",
    name: "Mariners", city: "Seattle", abbreviation: "SEA",
    sport: "MLB", division: "AL West",
    primaryColor: "hsl(193 100% 30%)", secondaryColor: "hsl(216 60% 30%)",
    logoEmoji: "⚾", stadium: "T-Mobile Park",
    established: 1977,
    record: { wins: 44, losses: 33, pct: 0.571, gb: "3.5", streak: "L1", lastTen: "5-5", divRank: 2 },
    standing: "2nd AL West · 3.5 GB Houston",
    teamStats: {
      offenseRank: 9, defenseRank: 3,
      label1: "Team AVG", val1: ".248", label2: "Team HR", val2: "98",
      label3: "Team ERA", val3: "3.12", label4: "Runs/Game", val4: "4.4",
      label5: "WHIP", val5: "1.08", label6: "OPS", val6: ".741",
    },
    roster: [
      { name: "Julio Rodriguez", position: "CF", number: "44", age: 23, photoUrl: "https://midfield.mlbstatic.com/v1/people/677594/spots/120", keyStats: { AVG: ".278", HR: "21", SB: "22", OPS: ".876" }, role: "Star", propTip: "Stolen Bases Over 0.5 — leads AL in SB, 12 in last 20 games" },
      { name: "Cal Raleigh", position: "C", number: "29", age: 28, photoUrl: "https://midfield.mlbstatic.com/v1/people/663728/spots/120", keyStats: { AVG: ".239", HR: "22", RBI: "61", OPS: ".841" }, role: "Star", propTip: "HR Over 0.5 — power hitting catcher" },
      { name: "Luis Castillo", position: "SP", number: "58", age: 32, photoUrl: "https://midfield.mlbstatic.com/v1/people/622491/spots/120", keyStats: { ERA: "3.28", K: "118", WHIP: "1.12", W: "7" }, role: "Star", propTip: "K Over 7.5 — reliable K rate vs most lineups" },
      { name: "Eugenio Suárez", position: "3B", number: "28", age: 35, photoUrl: "https://midfield.mlbstatic.com/v1/people/553993/spots/120", keyStats: { AVG: ".231", HR: "17", RBI: "49", OPS: ".779" }, role: "Starter", propTip: "HR value in smaller windows" },
      { name: "JP Crawford", position: "SS", number: "3", age: 31, photoUrl: "https://midfield.mlbstatic.com/v1/people/641487/spots/120", keyStats: { AVG: ".261", HR: "8", RBI: "38", OPS: ".764" }, role: "Starter", propTip: "Hits Over 0.5 — consistent contact" },
    ],
    upcomingGames: [
      { date: "Jun 25", time: "9:40 PM ET", opponent: "Texas Rangers", home: false, venue: "Globe Life Field", tvNetwork: "Root Sports", gameType: "Regular", propOdds: "Julio SB Over 0.5 — prime target" },
      { date: "Jun 26", time: "9:05 PM ET", opponent: "Texas Rangers", home: false, venue: "Globe Life Field", tvNetwork: "Root Sports", gameType: "Regular" },
      { date: "Jun 27", time: "8:05 PM ET", opponent: "Texas Rangers", home: false, venue: "Globe Life Field", tvNetwork: "ESPN", gameType: "Regular" },
      { date: "Jun 28", time: "4:05 PM ET", opponent: "Houston Astros", home: true, venue: "T-Mobile Park", tvNetwork: "Root Sports", gameType: "Regular" },
      { date: "Jun 29", time: "4:05 PM ET", opponent: "Houston Astros", home: true, venue: "T-Mobile Park", tvNetwork: "Root Sports", gameType: "Regular" },
    ],
    aiNote: "Elite pitching, below-average offense. J-Rod is the engine — his stolen base pace is historic for his age. Castillo vs right-handed lineups is a strong strikeout prop spot.",
    propHotspot: "Julio Rodriguez Stolen Bases",
    bettingTrend: "Hot",
  },
];

// ── NBA TEAMS ────────────────────────────────────────────────────────────────
const nbaTeams: Team[] = [
  {
    id: "nyk",
    name: "Knicks", city: "New York", abbreviation: "NYK",
    sport: "NBA", division: "Atlantic", conference: "East",
    primaryColor: "hsl(25 100% 50%)", secondaryColor: "hsl(214 100% 25%)",
    logoEmoji: "🏀", stadium: "Madison Square Garden",
    established: 1946,
    record: { wins: 58, losses: 24, pct: 0.707, streak: "Season Complete" },
    standing: "2025-26 NBA CHAMPIONS 🏆",
    teamStats: {
      offenseRank: 4, defenseRank: 2,
      label1: "PPG", val1: "116.4", label2: "Opp PPG", val2: "108.1",
      label3: "eFG%", val3: "55.8%", label4: "3P%", val4: "38.2%",
      label5: "Reb/G", val5: "45.2", label6: "Ast/G", val6: "26.1",
    },
    roster: [
      { name: "Jalen Brunson", position: "PG", number: "11", age: 30, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628386.png", keyStats: { PPG: "28.7", APG: "6.8", RPG: "3.6", FG: "49.3%" }, role: "Star", propTip: "Points Over 28.5 — Finals MVP, dominant in pressure games" },
      { name: "OG Anunoby", position: "SF", number: "8", age: 28, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628384.png", keyStats: { PPG: "18.4", RPG: "5.1", SPG: "1.8", FG: "51.2%" }, role: "Star", propTip: "Steals Over 1.5 — elite perimeter defender" },
      { name: "Karl-Anthony Towns", position: "C", number: "32", age: 31, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1626157.png", keyStats: { PPG: "22.6", RPG: "12.4", APG: "3.1", FG: "55.4%" }, role: "Star", propTip: "Rebounds Over 11.5 — double-double machine" },
      { name: "Josh Hart", position: "SG", number: "3", age: 30, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628404.png", keyStats: { PPG: "12.1", RPG: "8.4", APG: "4.2", "3P%": "34.1%" }, role: "Starter", propTip: "Rebounds Over 7.5 — undersized guard who crashes boards" },
      { name: "Mikal Bridges", position: "SF", number: "25", age: 28, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628969.png", keyStats: { PPG: "20.2", RPG: "4.4", SPG: "1.6", FG: "50.1%" }, role: "Star", propTip: "Points Over 19.5 — consistent scorer, underrated" },
    ],
    upcomingGames: [
      { date: "Oct 2026", time: "Season Opens", opponent: "TBD", home: true, venue: "Madison Square Garden", tvNetwork: "ABC/ESPN", gameType: "Regular", propOdds: "Brunson early-season props will be prime value" },
    ],
    aiNote: "2025-26 CHAMPIONS. Brunson is the premier PG in basketball right now. KAT/Brunson/Bridges makes this the scariest offense in the East going into 2026-27. Championship window is wide open.",
    propHotspot: "Brunson Points + KAT Rebounds",
    bettingTrend: "Hot",
  },
  {
    id: "den",
    name: "Nuggets", city: "Denver", abbreviation: "DEN",
    sport: "NBA", division: "Northwest", conference: "West",
    primaryColor: "hsl(33 100% 45%)", secondaryColor: "hsl(214 55% 30%)",
    logoEmoji: "🏀", stadium: "Ball Arena",
    established: 1967,
    record: { wins: 51, losses: 31, pct: 0.622, streak: "Season Complete" },
    standing: "2025-26 Season: 2nd seed West",
    teamStats: {
      offenseRank: 1, defenseRank: 11,
      label1: "PPG", val1: "122.8", label2: "Opp PPG", val2: "114.2",
      label3: "eFG%", val3: "57.1%", label4: "3P%", val4: "36.8%",
      label5: "Reb/G", val5: "47.1", label6: "Ast/G", val6: "30.4",
    },
    roster: [
      { name: "Nikola Jokic", position: "C", number: "15", age: 31, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/203999.png", keyStats: { PPG: "29.4", RPG: "13.1", APG: "10.8", FG: "58.1%" }, role: "Star", propTip: "Triple-double prop — 10+ assists/rebounds in any game is realistic" },
      { name: "Jamal Murray", position: "PG", number: "27", age: 29, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1627750.png", keyStats: { PPG: "22.4", APG: "5.9", RPG: "4.1", "3PM": "2.8" }, role: "Star", propTip: "Points Over 22.5 — hits big in high-leverage games" },
      { name: "Michael Porter Jr.", position: "SF", number: "1", age: 27, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1629008.png", keyStats: { PPG: "18.2", RPG: "7.8", "3PM": "3.4", FG: "48.9%" }, role: "Starter", propTip: "3-Pointers Over 2.5 — elite spot-up shooter" },
      { name: "Aaron Gordon", position: "PF", number: "50", age: 31, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/203932.png", keyStats: { PPG: "14.8", RPG: "6.8", APG: "3.4", FG: "55.1%" }, role: "Starter", propTip: "Rebounds Over 6.5 — athletic big with motor" },
      { name: "Kentavious Caldwell-Pope", position: "SG", number: "5", age: 33, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/203484.png", keyStats: { PPG: "11.4", "3P%": "42.1%", SPG: "1.4", RPG: "3.2" }, role: "Starter", propTip: "3-Pointers Over 1.5 — elite 3-point specialist" },
    ],
    upcomingGames: [
      { date: "Oct 2026", time: "Season Opens", opponent: "TBD", home: true, venue: "Ball Arena", tvNetwork: "ESPN/TNT", gameType: "Regular", propOdds: "Jokic triple-double props always in play" },
    ],
    aiNote: "Jokic is the best player in basketball — a stat machine who makes everyone around him better. With Murray healthy all year, Denver should be a title contender again in 2026-27.",
    propHotspot: "Jokic Points+Rebounds+Assists",
    bettingTrend: "Hot",
  },
  {
    id: "okc",
    name: "Thunder", city: "Oklahoma City", abbreviation: "OKC",
    sport: "NBA", division: "Northwest", conference: "West",
    primaryColor: "hsl(205 100% 45%)", secondaryColor: "hsl(25 100% 50%)",
    logoEmoji: "🏀", stadium: "Paycom Center",
    established: 1967,
    record: { wins: 57, losses: 25, pct: 0.695, streak: "Season Complete" },
    standing: "2025-26 Season: 1st seed West",
    teamStats: {
      offenseRank: 3, defenseRank: 1,
      label1: "PPG", val1: "119.6", label2: "Opp PPG", val2: "107.2",
      label3: "eFG%", val3: "56.4%", label4: "3P%", val4: "37.9%",
      label5: "Reb/G", val5: "46.8", label6: "Ast/G", val6: "27.4",
    },
    roster: [
      { name: "Shai Gilgeous-Alexander", position: "PG", number: "2", age: 28, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628983.png", keyStats: { PPG: "31.2", APG: "6.3", SPG: "2.1", FG: "53.4%" }, role: "Star", propTip: "Points Over 30.5 — MVP frontrunner, carries offense" },
      { name: "Chet Holmgren", position: "C", number: "7", age: 23, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1631096.png", keyStats: { PPG: "18.6", RPG: "8.1", BPG: "2.4", FG: "52.2%" }, role: "Star", propTip: "Blocks Over 1.5 — elite rim protector" },
      { name: "Jalen Williams", position: "SG", number: "8", age: 24, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1631114.png", keyStats: { PPG: "22.1", APG: "5.4", RPG: "4.2", FG: "50.8%" }, role: "Star", propTip: "Points+Assists combo props — two-way threat" },
      { name: "Lu Dort", position: "SF", number: "5", age: 26, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1629652.png", keyStats: { PPG: "13.4", SPG: "1.6", RPG: "3.8", "3P%": "38.4%" }, role: "Starter", propTip: "Steals Over 1.5 — lockdown defender" },
      { name: "Isaiah Joe", position: "SG", number: "11", age: 26, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1630181.png", keyStats: { PPG: "9.8", "3P%": "41.2%", "3PM": "2.4", RPG: "2.1" }, role: "Role Player", propTip: "3-Pointers — specialists have value in high-possession games" },
    ],
    upcomingGames: [
      { date: "Oct 2026", time: "Season Opens", opponent: "TBD", home: true, venue: "Paycom Center", tvNetwork: "ESPN/TNT", gameType: "Regular", propOdds: "SGA scoring props will be heavily priced" },
    ],
    aiNote: "The youngest #1 seed in recent history. SGA may win back-to-back MVPs. Chet Holmgren is elite at both ends. This team is built to compete for titles for the next decade.",
    propHotspot: "SGA Points + Holmgren Blocks",
    bettingTrend: "Hot",
  },
  {
    id: "bos",
    name: "Celtics", city: "Boston", abbreviation: "BOS",
    sport: "NBA", division: "Atlantic", conference: "East",
    primaryColor: "hsl(145 80% 32%)", secondaryColor: "hsl(0 0% 95%)",
    logoEmoji: "🏀", stadium: "TD Garden",
    established: 1946,
    record: { wins: 55, losses: 27, pct: 0.671, streak: "Season Complete" },
    standing: "2025-26 Season: 1st seed East",
    teamStats: {
      offenseRank: 2, defenseRank: 3,
      label1: "PPG", val1: "120.2", label2: "Opp PPG", val2: "109.4",
      label3: "eFG%", val3: "58.2%", label4: "3P%", val4: "40.1%",
      label5: "Reb/G", val5: "46.2", label6: "Ast/G", val6: "25.8",
    },
    roster: [
      { name: "Jayson Tatum", position: "SF", number: "0", age: 28, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628369.png", keyStats: { PPG: "27.3", RPG: "8.4", APG: "4.9", FG: "47.1%" }, role: "Star", propTip: "Points Over 26.5 — franchise player, big-game performer" },
      { name: "Jaylen Brown", position: "SG", number: "7", age: 30, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1627759.png", keyStats: { PPG: "24.1", RPG: "5.6", SPG: "1.3", FG: "50.2%" }, role: "Star", propTip: "Points Over 23.5 — two-way wing with elite athleticism" },
      { name: "Al Horford", position: "C", number: "42", age: 40, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/201143.png", keyStats: { PPG: "11.2", RPG: "6.8", "3P%": "42.4%", BPG: "1.1" }, role: "Starter", propTip: "3-Pointers Over 1.5 — veteran shooter, great value" },
      { name: "Derrick White", position: "PG", number: "9", age: 31, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628401.png", keyStats: { PPG: "15.8", APG: "5.2", SPG: "1.4", "3PM": "2.1" }, role: "Starter", propTip: "Steals + Assists combo — does everything quietly" },
      { name: "Kristaps Porzingis", position: "C", number: "8", age: 31, photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/204001.png", keyStats: { PPG: "16.8", RPG: "7.2", BPG: "1.8", FG: "49.4%" }, role: "Starter", propTip: "Blocks Over 1.5 — shot-blocking stretch big" },
    ],
    upcomingGames: [
      { date: "Oct 2026", time: "Season Opens", opponent: "TBD", home: true, venue: "TD Garden", tvNetwork: "ESPN/TNT", gameType: "Regular", propOdds: "Tatum/Brown will carry early-season props" },
    ],
    aiNote: "Tatum and Brown is the best duo in the East. The Celtics' 3-point shooting is elite — they live and die by the 3-ball. Great team but couldn't get past the Knicks this year.",
    propHotspot: "Tatum Points + Brown Points",
    bettingTrend: "Hot",
  },
];

// ── NHL TEAMS ─────────────────────────────────────────────────────────────────
const nhlTeams: Team[] = [
  {
    id: "edm",
    name: "Oilers", city: "Edmonton", abbreviation: "EDM",
    sport: "NHL", division: "Pacific", conference: "West",
    primaryColor: "hsl(25 100% 50%)", secondaryColor: "hsl(214 100% 28%)",
    logoEmoji: "🏒", stadium: "Rogers Place",
    established: 1972,
    record: { wins: 52, losses: 22, pct: 0.702, streak: "Season Complete" },
    standing: "2025-26 Season: 1st Pacific",
    teamStats: {
      offenseRank: 1, defenseRank: 8,
      label1: "Goals/G", val1: "3.82", label2: "Goals Against", val2: "2.94",
      label3: "PP%", val3: "28.4%", label4: "PK%", val4: "80.2%",
      label5: "SOG/G", val5: "32.1", label6: "Save %", val6: ".912",
    },
    roster: [
      { name: "Connor McDavid", position: "C", number: "97", age: 30, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8478402.png", keyStats: { G: "54", A: "96", PTS: "150", "+/-": "+38" }, role: "Star", propTip: "Points Over 1.5 — best player alive, 150 points this season" },
      { name: "Leon Draisaitl", position: "C", number: "29", age: 30, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8477934.png", keyStats: { G: "48", A: "82", PTS: "130", SOG: "286" }, role: "Star", propTip: "Points Over 1.5 — McDavid's partner, elite on the power play" },
      { name: "Zach Hyman", position: "LW", number: "18", age: 33, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8478007.png", keyStats: { G: "36", A: "28", PTS: "64", SOG: "198" }, role: "Starter", propTip: "Shots on Goal Over 2.5 — net-front presence with high volume" },
      { name: "Evan Bouchard", position: "D", number: "75", age: 26, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8481604.png", keyStats: { G: "18", A: "54", PTS: "72", SOG: "192" }, role: "Starter", propTip: "Points Over 0.5 — QB of the power play, assists machine" },
      { name: "Stuart Skinner", position: "G", number: "74", age: 27, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8481533.png", keyStats: { SV: ".914", GAA: "2.78", W: "38", SO: "4" }, role: "Starter", propTip: "Saves Over 26.5 — high-volume team, lots of shot attempts" },
    ],
    upcomingGames: [
      { date: "Sep 2026", time: "Season Opener", opponent: "TBD", home: true, venue: "Rogers Place", tvNetwork: "Sportsnet/ESPN+", gameType: "Regular", propOdds: "McDavid Point props will be high value all season" },
    ],
    aiNote: "McDavid had 150 points — the most dominant individual season in over a decade. Draisaitl is the perfect partner. The power play is the most dangerous weapon in hockey. Season starts Sep 2026.",
    propHotspot: "McDavid + Draisaitl Points",
    bettingTrend: "Hot",
  },
  {
    id: "col",
    name: "Avalanche", city: "Colorado", abbreviation: "COL",
    sport: "NHL", division: "Central", conference: "West",
    primaryColor: "hsl(0 80% 40%)", secondaryColor: "hsl(214 55% 30%)",
    logoEmoji: "🏒", stadium: "Ball Arena",
    established: 1972,
    record: { wins: 48, losses: 26, pct: 0.649, streak: "Season Complete" },
    standing: "2025-26 Season: 2nd Central",
    teamStats: {
      offenseRank: 2, defenseRank: 4,
      label1: "Goals/G", val1: "3.64", label2: "Goals Against", val2: "2.78",
      label3: "PP%", val3: "25.8%", label4: "PK%", val4: "82.4%",
      label5: "SOG/G", val5: "31.4", label6: "Save %", val6: ".918",
    },
    roster: [
      { name: "Nathan MacKinnon", position: "C", number: "29", age: 31, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8477492.png", keyStats: { G: "49", A: "89", PTS: "138", "+/-": "+44" }, role: "Star", propTip: "Points Over 1.5 — top-3 player in hockey, runs the offense" },
      { name: "Cale Makar", position: "D", number: "8", age: 28, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8480069.png", keyStats: { G: "22", A: "69", PTS: "91", "+/-": "+39" }, role: "Star", propTip: "Points Over 1.5 — best defensive player in hockey" },
      { name: "Mikko Rantanen", position: "RW", number: "96", age: 30, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8478493.png", keyStats: { G: "44", A: "67", PTS: "111", SOG: "264" }, role: "Star", propTip: "Points Over 1.5 — lethal on the right side" },
      { name: "Artturi Lehkonen", position: "LW", number: "62", age: 29, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8479343.png", keyStats: { G: "28", A: "38", PTS: "66", SOG: "156" }, role: "Starter", propTip: "Goals Over 0.5 — consistent finisher in the net-front" },
      { name: "Alexandar Georgiev", position: "G", number: "40", age: 29, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8481533.png", keyStats: { SV: ".918", GAA: "2.68", W: "36", SO: "5" }, role: "Starter", propTip: "Saves Over 25.5 — solid GAA behind strong team" },
    ],
    upcomingGames: [
      { date: "Sep 2026", time: "Season Opener", opponent: "TBD", home: true, venue: "Ball Arena", tvNetwork: "ESPN+/Altitude", gameType: "Regular", propOdds: "MacKinnon point props will be elite all season" },
    ],
    aiNote: "MacKinnon + Makar is the best forward-defenseman combo in hockey. Rantanen is criminally underrated. Colorado's system is built for high-event hockey — perfect for props.",
    propHotspot: "MacKinnon Points + Makar Assists",
    bettingTrend: "Hot",
  },
  {
    id: "tor",
    name: "Maple Leafs", city: "Toronto", abbreviation: "TOR",
    sport: "NHL", division: "Atlantic", conference: "East",
    primaryColor: "hsl(214 100% 40%)", secondaryColor: "hsl(0 0% 95%)",
    logoEmoji: "🏒", stadium: "Scotiabank Arena",
    established: 1917,
    record: { wins: 44, losses: 30, pct: 0.595, streak: "Season Complete" },
    standing: "2025-26 Season: 3rd Atlantic",
    teamStats: {
      offenseRank: 5, defenseRank: 12,
      label1: "Goals/G", val1: "3.41", label2: "Goals Against", val2: "3.14",
      label3: "PP%", val3: "23.2%", label4: "PK%", val4: "78.9%",
      label5: "SOG/G", val5: "33.4", label6: "Save %", val6: ".907",
    },
    roster: [
      { name: "Auston Matthews", position: "C", number: "34", age: 29, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8478465.png", keyStats: { G: "52", A: "44", PTS: "96", SOG: "318" }, role: "Star", propTip: "Shots on Goal Over 3.5 — highest SOG rate in the league" },
      { name: "Mitchell Marner", position: "RW", number: "16", age: 29, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8481523.png", keyStats: { G: "28", A: "68", PTS: "96", SOG: "198" }, role: "Star", propTip: "Assists Over 0.5 — distributes all night long" },
      { name: "William Nylander", position: "RW", number: "88", age: 30, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8477939.png", keyStats: { G: "38", A: "48", PTS: "86", SOG: "234" }, role: "Star", propTip: "Goals Over 0.5 — streaky but high ceiling" },
      { name: "Jake McCabe", position: "D", number: "9", age: 33, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8476463.png", keyStats: { G: "8", A: "28", PTS: "36", "+/-": "+12" }, role: "Starter", propTip: "Blocks + Hits props — physical stay-at-home D" },
      { name: "Joseph Woll", position: "G", number: "60", age: 27, photoUrl: "https://assets.nhle.com/mugs/nhl/408x408/8481604.png", keyStats: { SV: ".908", GAA: "3.04", W: "28", SO: "2" }, role: "Starter", propTip: "Saves Over 28.5 — faces lots of shots behind shaky defense" },
    ],
    upcomingGames: [
      { date: "Sep 2026", time: "Season Opener", opponent: "TBD", home: true, venue: "Scotiabank Arena", tvNetwork: "Sportsnet/ESPN+", gameType: "Regular", propOdds: "Matthews SOG is a yearly must-watch prop" },
    ],
    aiNote: "Matthews leads the league in shots — his SOG prop is the safest-feeling bet in hockey. Marner's assists are elite. The goaltending and defense remain question marks.",
    propHotspot: "Matthews Shots on Goal",
    bettingTrend: "Neutral",
  },
];

// ── TENNIS PLAYERS AS "TEAMS" ─────────────────────────────────────────────────
const tennisTeams: Team[] = [
  {
    id: "sinner",
    name: "Jannik Sinner", city: "Italy", abbreviation: "ITA",
    sport: "Tennis", division: "ATP Top 10",
    primaryColor: "hsl(0 80% 45%)", secondaryColor: "hsl(45 100% 55%)",
    logoEmoji: "🎾", stadium: "World #1",
    established: 2001,
    record: { wins: 37, losses: 5, pct: 0.881 },
    standing: "World #1 · 5 Titles in 2026",
    teamStats: {
      label1: "Win %", val1: "88.1%", label2: "Titles YTD", val2: "5",
      label3: "Aces/Match", val3: "6.2", label4: "1st Serve %", val4: "64.1%",
      label5: "Surface", val5: "All courts", label6: "Break Pts Conv.", val6: "44.8%",
    },
    roster: [
      { name: "Jannik Sinner", position: "Singles", number: "#1", age: 24, photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4534919.png", keyStats: { Ranking: "#1", Win: "88.1%", Titles: "5", Aces: "6.2/M" }, role: "Star", propTip: "Aces Over 6.5 — averages 6.2 on hard and grass courts" },
    ],
    upcomingGames: [
      { date: "Jun 30", time: "TBD", opponent: "Wimbledon R1", home: false, venue: "All England Club", tvNetwork: "ESPN/Peacock", gameType: "Playoff", propOdds: "Aces Over 6.5 + Games Over 21.5" },
      { date: "Jul 3–4", time: "TBD", opponent: "Wimbledon R2", home: false, venue: "All England Club", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 7–8", time: "TBD", opponent: "Wimbledon QF", home: false, venue: "All England Club", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 11", time: "TBD", opponent: "Wimbledon SF", home: false, venue: "Centre Court", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 13", time: "TBD", opponent: "Wimbledon Final", home: false, venue: "Centre Court", tvNetwork: "ESPN/ABC", gameType: "Playoff" },
    ],
    aiNote: "World #1. Dominant on all surfaces. Wimbledon 2026 is his to lose — 88% win rate on grass in 2026. Aces and games props are prime targeting opportunities.",
    propHotspot: "Aces Over 6.5 + Match Winner",
    bettingTrend: "Hot",
  },
  {
    id: "alcaraz",
    name: "Carlos Alcaraz", city: "Spain", abbreviation: "ESP",
    sport: "Tennis", division: "ATP Top 10",
    primaryColor: "hsl(0 80% 45%)", secondaryColor: "hsl(220 100% 45%)",
    logoEmoji: "🎾", stadium: "World #2",
    established: 2003,
    record: { wins: 35, losses: 6, pct: 0.854 },
    standing: "World #2 · Reigning Wimbledon Champion",
    teamStats: {
      label1: "Win %", val1: "85.4%", label2: "Titles YTD", val2: "4",
      label3: "Aces/Match", val3: "8.1", label4: "1st Serve %", val4: "63.8%",
      label5: "Surface", val5: "Grass specialist", label6: "Break Pts Conv.", val6: "46.2%",
    },
    roster: [
      { name: "Carlos Alcaraz", position: "Singles", number: "#2", age: 23, photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4921572.png", keyStats: { Ranking: "#2", Win: "85.4%", Titles: "4", Aces: "8.1/M" }, role: "Star", propTip: "Games Won Over 9.5 per match — dominates sets on grass" },
    ],
    upcomingGames: [
      { date: "Jun 30", time: "TBD", opponent: "Wimbledon R1", home: false, venue: "All England Club", tvNetwork: "ESPN/Peacock", gameType: "Playoff", propOdds: "Aces Over 7.5 + Games Over 9.5 recommended" },
      { date: "Jul 3–4", time: "TBD", opponent: "Wimbledon R2", home: false, venue: "All England Club", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 7–8", time: "TBD", opponent: "Wimbledon QF", home: false, venue: "All England Club", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 11", time: "TBD", opponent: "Wimbledon SF", home: false, venue: "Centre Court", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 13", time: "TBD", opponent: "Wimbledon Final", home: false, venue: "Centre Court", tvNetwork: "ESPN/ABC", gameType: "Playoff" },
    ],
    aiNote: "Reigning Wimbledon champion and the highest ace rate in the top 10. Alcaraz on grass is terrifying — his shotmaking at 23 is historic. Favorite or co-favorite for the title with Sinner.",
    propHotspot: "Aces Over 7.5 + Games Won",
    bettingTrend: "Hot",
  },
  {
    id: "sabalenka",
    name: "Aryna Sabalenka", city: "Belarus", abbreviation: "BLR",
    sport: "Tennis", division: "WTA Top 10",
    primaryColor: "hsl(263 80% 50%)", secondaryColor: "hsl(0 0% 95%)",
    logoEmoji: "🎾", stadium: "WTA World #1",
    established: 1998,
    record: { wins: 38, losses: 6, pct: 0.864 },
    standing: "WTA World #1 · 4 Titles in 2026",
    teamStats: {
      label1: "Win %", val1: "86.4%", label2: "Titles YTD", val2: "4",
      label3: "Aces/Match", val3: "4.8", label4: "1st Serve %", val4: "60.9%",
      label5: "Surface", val5: "Hard court expert", label6: "Break Pts Conv.", val6: "48.1%",
    },
    roster: [
      { name: "Aryna Sabalenka", position: "Singles (W)", number: "#1", age: 28, photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4490956.png", keyStats: { Ranking: "#1", Win: "86.4%", Titles: "4", Aces: "4.8/M" }, role: "Star", propTip: "Games Over 20.5 — big hitter, tends to go deep in rallies" },
    ],
    upcomingGames: [
      { date: "Jun 30", time: "TBD", opponent: "Wimbledon R1", home: false, venue: "All England Club", tvNetwork: "ESPN/Peacock", gameType: "Playoff", propOdds: "Match Winner + Games played Over 20.5" },
      { date: "Jul 3–4", time: "TBD", opponent: "Wimbledon R2", home: false, venue: "All England Club", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 7–8", time: "TBD", opponent: "Wimbledon QF", home: false, venue: "All England Club", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 11", time: "TBD", opponent: "Wimbledon SF", home: false, venue: "Centre Court", tvNetwork: "ESPN", gameType: "Playoff" },
      { date: "Jul 12", time: "TBD", opponent: "Wimbledon Final (W)", home: false, venue: "Centre Court", tvNetwork: "ESPN/ABC", gameType: "Playoff" },
    ],
    aiNote: "WTA World #1 and the most powerful baseliner in women's tennis. Her serve is elite. Wimbledon is slightly outside her comfort zone (prefers hard courts), but her talent transcends surface.",
    propHotspot: "Games Played Over 20.5",
    bettingTrend: "Hot",
  },
];

// ── COMBINED EXPORT ───────────────────────────────────────────────────────────
export const ALL_TEAMS: Team[] = [...mlbTeams, ...nbaTeams, ...nhlTeams, ...tennisTeams];

export function getTeamsBySport(sport: string): Team[] {
  return ALL_TEAMS.filter(t => t.sport === sport);
}

export function getTeamById(id: string): Team | undefined {
  return ALL_TEAMS.find(t => t.id === id);
}

export function getAllSports(): string[] {
  return ["MLB", "NBA", "NHL", "Tennis"];
}
