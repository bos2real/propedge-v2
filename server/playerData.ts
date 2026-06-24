/**
 * PropEdge Player Database
 * Current 2026 season stats + official headshot CDN URLs
 *
 * Photo sources:
 *  NBA  → https://cdn.nba.com/headshots/nba/latest/260x190/{id}.png
 *  MLB  → https://midfield.mlbstatic.com/v1/people/{id}/spots/120
 *  NHL  → https://cms.nhl.bamgrid.com/images/headshots/current/168x168/{id}.jpg
 *  Tennis → ESPN CDN via athlete ID
 */

export interface PlayerProfile {
  name: string;
  sport: string;
  team: string;
  number: string;
  position: string;
  photoUrl: string;
  age: number;
  height: string;
  weight: string;
  nationality: string;
  stats: StatLine[];
  season: string;
  lastGame?: string;
  trend: "hot" | "cold" | "neutral";
  bio: string;
}

export interface StatLine {
  label: string;
  value: string;
  highlight?: boolean;
}

const PLAYER_DB: Record<string, PlayerProfile> = {

  // ─── MLB BATTERS ────────────────────────────────────────────────────────────
  "Shohei Ohtani": {
    name: "Shohei Ohtani",
    sport: "MLB",
    team: "Los Angeles Dodgers",
    number: "17",
    position: "SP / DH",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/660271/spots/120",
    age: 31,
    height: "6'4\"",
    weight: "210 lbs",
    nationality: "🇯🇵 Japan",
    trend: "hot",
    season: "2026",
    lastGame: "June 22 vs SD",
    bio: "Two-way superstar on a historic dual-threat 2026 campaign.",
    stats: [
      { label: "AVG",  value: ".293", highlight: true },
      { label: "HR",   value: "17",   highlight: true },
      { label: "RBI",  value: "45" },
      { label: "SB",   value: "6" },
      { label: "OPS",  value: ".966", highlight: true },
      { label: "ERA (P)", value: "1.47", highlight: true },
      { label: "K (P)",   value: "78" },
      { label: "W-L (P)", value: "7-2" },
    ],
  },

  "Aaron Judge": {
    name: "Aaron Judge",
    sport: "MLB",
    team: "New York Yankees",
    number: "99",
    position: "RF",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/592450/spots/120",
    age: 34,
    height: "6'7\"",
    weight: "282 lbs",
    nationality: "🇺🇸 USA",
    trend: "hot",
    season: "2026",
    lastGame: "June 22 vs TOR",
    bio: "AL MVP frontrunner chasing another 60+ HR season.",
    stats: [
      { label: "AVG",  value: ".284" },
      { label: "HR",   value: "24",   highlight: true },
      { label: "RBI",  value: "58",   highlight: true },
      { label: "OBP",  value: ".412", highlight: true },
      { label: "SLG",  value: ".628" },
      { label: "OPS",  value: "1.040", highlight: true },
      { label: "BB",   value: "42" },
    ],
  },

  "Freddie Freeman": {
    name: "Freddie Freeman",
    sport: "MLB",
    team: "Los Angeles Dodgers",
    number: "5",
    position: "1B",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/518692/spots/120",
    age: 36,
    height: "6'5\"",
    weight: "220 lbs",
    nationality: "🇺🇸 USA",
    trend: "hot",
    season: "2026",
    lastGame: "June 22 vs SD",
    bio: "Veteran contact machine leading the Dodgers lineup.",
    stats: [
      { label: "AVG",  value: ".308", highlight: true },
      { label: "HR",   value: "11" },
      { label: "RBI",  value: "49",   highlight: true },
      { label: "2B",   value: "18",   highlight: true },
      { label: "OBP",  value: ".390" },
      { label: "OPS",  value: ".882" },
    ],
  },

  "Julio Rodriguez": {
    name: "Julio Rodriguez",
    sport: "MLB",
    team: "Seattle Mariners",
    number: "44",
    position: "CF",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/677594/spots/120",
    age: 23,
    height: "6'3\"",
    weight: "228 lbs",
    nationality: "🇩🇴 Dominican Republic",
    trend: "cold",
    season: "2026",
    lastGame: "June 22 vs HOU",
    bio: "Young superstar working through a mid-season slump.",
    stats: [
      { label: "AVG",  value: ".241" },
      { label: "HR",   value: "8" },
      { label: "RBI",  value: "31" },
      { label: "SB",   value: "14",   highlight: true },
      { label: "K%",   value: "27.4%" },
      { label: "OPS",  value: ".742" },
    ],
  },

  "Ronald Acuna Jr.": {
    name: "Ronald Acuna Jr.",
    sport: "MLB",
    team: "Atlanta Braves",
    number: "13",
    position: "RF",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/660670/spots/120",
    age: 26,
    height: "6'0\"",
    weight: "205 lbs",
    nationality: "🇻🇪 Venezuela",
    trend: "hot",
    season: "2026",
    lastGame: "June 22 vs NYM",
    bio: "Back to MVP form after full recovery — fastest in the league.",
    stats: [
      { label: "AVG",  value: ".296" },
      { label: "HR",   value: "13" },
      { label: "RBI",  value: "38" },
      { label: "SB",   value: "22",   highlight: true },
      { label: "R",    value: "54",   highlight: true },
      { label: "OPS",  value: ".901", highlight: true },
    ],
  },

  // ─── MLB PITCHERS ───────────────────────────────────────────────────────────
  "Gerrit Cole": {
    name: "Gerrit Cole",
    sport: "MLB",
    team: "New York Yankees",
    number: "45",
    position: "SP",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/543037/spots/120",
    age: 35,
    height: "6'4\"",
    weight: "220 lbs",
    nationality: "🇺🇸 USA",
    trend: "hot",
    season: "2026",
    lastGame: "June 20 vs BOS",
    bio: "Cy Young contender with one of the best K rates in the AL.",
    stats: [
      { label: "ERA",  value: "2.81", highlight: true },
      { label: "W-L",  value: "8-3" },
      { label: "K",    value: "112",  highlight: true },
      { label: "IP",   value: "86.1" },
      { label: "WHIP", value: "0.98", highlight: true },
      { label: "K/9",  value: "11.7" },
    ],
  },

  "Paul Skenes": {
    name: "Paul Skenes",
    sport: "MLB",
    team: "Pittsburgh Pirates",
    number: "30",
    position: "SP",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/694973/spots/120",
    age: 23,
    height: "6'6\"",
    weight: "235 lbs",
    nationality: "🇺🇸 USA",
    trend: "hot",
    season: "2026",
    lastGame: "June 21 vs MIL",
    bio: "The most electric arm in baseball — 2025 NL ROY now Cy Young candidate.",
    stats: [
      { label: "ERA",  value: "2.14", highlight: true },
      { label: "W-L",  value: "9-2",  highlight: true },
      { label: "K",    value: "128",  highlight: true },
      { label: "IP",   value: "88.0" },
      { label: "WHIP", value: "0.84", highlight: true },
      { label: "K/9",  value: "13.1" },
    ],
  },

  "Spencer Strider": {
    name: "Spencer Strider",
    sport: "MLB",
    team: "Atlanta Braves",
    number: "99",
    position: "SP",
    photoUrl: "https://midfield.mlbstatic.com/v1/people/675911/spots/120",
    age: 26,
    height: "6'0\"",
    weight: "195 lbs",
    nationality: "🇺🇸 USA",
    trend: "hot",
    season: "2026",
    lastGame: "June 20 vs PHI",
    bio: "Fully healthy and back to his elite K-machine form.",
    stats: [
      { label: "ERA",  value: "2.66" },
      { label: "W-L",  value: "7-3" },
      { label: "K",    value: "119",  highlight: true },
      { label: "IP",   value: "81.0" },
      { label: "WHIP", value: "1.01" },
      { label: "K/9",  value: "13.2", highlight: true },
    ],
  },

  // ─── NBA ────────────────────────────────────────────────────────────────────
  "Nikola Jokic": {
    name: "Nikola Jokic",
    sport: "NBA",
    team: "Denver Nuggets",
    number: "15",
    position: "C",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/203999.png",
    age: 31,
    height: "6'11\"",
    weight: "284 lbs",
    nationality: "🇷🇸 Serbia",
    trend: "hot",
    season: "2025-26",
    lastGame: "Playoffs R2",
    bio: "5x All-Star, 4x MVP. The greatest passing big man in NBA history.",
    stats: [
      { label: "PPG",  value: "26.8", highlight: true },
      { label: "RPG",  value: "12.4", highlight: true },
      { label: "APG",  value: "9.1",  highlight: true },
      { label: "FG%",  value: "57.8%" },
      { label: "TS%",  value: "65.4%", highlight: true },
      { label: "BPM",  value: "+12.2" },
    ],
  },

  "Shai Gilgeous-Alexander": {
    name: "Shai Gilgeous-Alexander",
    sport: "NBA",
    team: "Oklahoma City Thunder",
    number: "2",
    position: "G",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628983.png",
    age: 26,
    height: "6'6\"",
    weight: "195 lbs",
    nationality: "🇨🇦 Canada",
    trend: "hot",
    season: "2025-26",
    lastGame: "Playoffs R2",
    bio: "2026 NBA MVP — the most unstoppable scorer in the league.",
    stats: [
      { label: "PPG",  value: "30.1", highlight: true },
      { label: "RPG",  value: "4.8" },
      { label: "APG",  value: "6.4" },
      { label: "SPG",  value: "2.0",  highlight: true },
      { label: "FG%",  value: "52.4%" },
      { label: "TS%",  value: "63.8%", highlight: true },
    ],
  },

  "Luka Doncic": {
    name: "Luka Doncic",
    sport: "NBA",
    team: "Los Angeles Lakers",
    number: "77",
    position: "G/F",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1629029.png",
    age: 27,
    height: "6'7\"",
    weight: "230 lbs",
    nationality: "🇸🇮 Slovenia",
    trend: "neutral",
    season: "2025-26",
    lastGame: "Playoffs R1",
    bio: "Triple-double machine now leading the Lakers to contention.",
    stats: [
      { label: "PPG",  value: "28.4", highlight: true },
      { label: "RPG",  value: "8.3",  highlight: true },
      { label: "APG",  value: "8.8",  highlight: true },
      { label: "3PM",  value: "2.8" },
      { label: "TO",   value: "3.8" },
      { label: "TS%",  value: "58.1%" },
    ],
  },

  "Giannis Antetokounmpo": {
    name: "Giannis Antetokounmpo",
    sport: "NBA",
    team: "Milwaukee Bucks",
    number: "34",
    position: "PF",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/203507.png",
    age: 31,
    height: "6'11\"",
    weight: "243 lbs",
    nationality: "🇬🇷 Greece",
    trend: "hot",
    season: "2025-26",
    lastGame: "Playoffs R1",
    bio: "The Greek Freak — still the most physically dominant player alive.",
    stats: [
      { label: "PPG",  value: "29.9", highlight: true },
      { label: "RPG",  value: "11.7", highlight: true },
      { label: "APG",  value: "6.5" },
      { label: "BPG",  value: "1.4",  highlight: true },
      { label: "FG%",  value: "56.2%" },
      { label: "FT%",  value: "73.4%" },
    ],
  },

  "Anthony Edwards": {
    name: "Anthony Edwards",
    sport: "NBA",
    team: "Minnesota Timberwolves",
    number: "5",
    position: "SG",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1630162.png",
    age: 25,
    height: "6'4\"",
    weight: "225 lbs",
    nationality: "🇺🇸 USA",
    trend: "cold",
    season: "2025-26",
    lastGame: "Reg. Season",
    bio: "Explosive guard going through a mid-season shooting slump.",
    stats: [
      { label: "PPG",  value: "25.7" },
      { label: "RPG",  value: "5.2" },
      { label: "APG",  value: "5.0" },
      { label: "3PM",  value: "2.9",  highlight: true },
      { label: "FG%",  value: "44.1%" },
      { label: "3P%",  value: "35.8%" },
    ],
  },

  "Jayson Tatum": {
    name: "Jayson Tatum",
    sport: "NBA",
    team: "Boston Celtics",
    number: "0",
    position: "SF",
    photoUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628369.png",
    age: 28,
    height: "6'8\"",
    weight: "210 lbs",
    nationality: "🇺🇸 USA",
    trend: "neutral",
    season: "2025-26",
    lastGame: "Playoffs R2",
    bio: "Boston's franchise cornerstone and Finals MVP caliber player.",
    stats: [
      { label: "PPG",  value: "26.5", highlight: true },
      { label: "RPG",  value: "8.2" },
      { label: "APG",  value: "4.8" },
      { label: "3PM",  value: "3.1",  highlight: true },
      { label: "FG%",  value: "46.3%" },
      { label: "TS%",  value: "60.7%" },
    ],
  },

  // ─── NHL ────────────────────────────────────────────────────────────────────
  "Connor McDavid": {
    name: "Connor McDavid",
    sport: "NHL",
    team: "Edmonton Oilers",
    number: "97",
    position: "C",
    photoUrl: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478402.jpg",
    age: 29,
    height: "6'1\"",
    weight: "193 lbs",
    nationality: "🇨🇦 Canada",
    trend: "hot",
    season: "2025-26",
    lastGame: "Playoffs R2",
    bio: "Best player on the planet — Hart Trophy winner multiple times.",
    stats: [
      { label: "G",    value: "43",   highlight: true },
      { label: "A",    value: "82",   highlight: true },
      { label: "PTS",  value: "125",  highlight: true },
      { label: "+/-",  value: "+31" },
      { label: "PPP",  value: "42",   highlight: true },
      { label: "SOG",  value: "284" },
    ],
  },

  "Nathan MacKinnon": {
    name: "Nathan MacKinnon",
    sport: "NHL",
    team: "Colorado Avalanche",
    number: "29",
    position: "C",
    photoUrl: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477492.jpg",
    age: 30,
    height: "6'0\"",
    weight: "205 lbs",
    nationality: "🇨🇦 Canada",
    trend: "hot",
    season: "2025-26",
    lastGame: "Reg. Season",
    bio: "Hart Trophy winner and one of the most explosive skaters ever.",
    stats: [
      { label: "G",    value: "38" },
      { label: "A",    value: "74",   highlight: true },
      { label: "PTS",  value: "112",  highlight: true },
      { label: "+/-",  value: "+28" },
      { label: "PPP",  value: "38",   highlight: true },
      { label: "SOG",  value: "261" },
    ],
  },

  "David Pastrnak": {
    name: "David Pastrnak",
    sport: "NHL",
    team: "Boston Bruins",
    number: "88",
    position: "RW",
    photoUrl: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477956.jpg",
    age: 29,
    height: "6'1\"",
    weight: "194 lbs",
    nationality: "🇨🇿 Czech Republic",
    trend: "hot",
    season: "2025-26",
    lastGame: "Reg. Season",
    bio: "Elite scorer and one of the most dangerous power play weapons in the NHL.",
    stats: [
      { label: "G",    value: "49",   highlight: true },
      { label: "A",    value: "51",   highlight: true },
      { label: "PTS",  value: "100",  highlight: true },
      { label: "+/-",  value: "+18" },
      { label: "PPG",  value: "22",   highlight: true },
      { label: "SOG",  value: "298" },
    ],
  },

  "Cale Makar": {
    name: "Cale Makar",
    sport: "NHL",
    team: "Colorado Avalanche",
    number: "8",
    position: "D",
    photoUrl: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480069.jpg",
    age: 26,
    height: "5'11\"",
    weight: "187 lbs",
    nationality: "🇨🇦 Canada",
    trend: "neutral",
    season: "2025-26",
    lastGame: "Reg. Season",
    bio: "Norris Trophy winner — most offensively gifted defenseman of his generation.",
    stats: [
      { label: "G",    value: "24",   highlight: true },
      { label: "A",    value: "62",   highlight: true },
      { label: "PTS",  value: "86",   highlight: true },
      { label: "+/-",  value: "+22" },
      { label: "Blk",  value: "78",   highlight: true },
      { label: "PPP",  value: "34" },
    ],
  },

  "Auston Matthews": {
    name: "Auston Matthews",
    sport: "NHL",
    team: "Toronto Maple Leafs",
    number: "34",
    position: "C",
    photoUrl: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478465.jpg",
    age: 28,
    height: "6'3\"",
    weight: "220 lbs",
    nationality: "🇺🇸 USA",
    trend: "hot",
    season: "2025-26",
    lastGame: "Reg. Season",
    bio: "Rocket shot, elite hands — led the NHL in goals last season.",
    stats: [
      { label: "G",    value: "52",   highlight: true },
      { label: "A",    value: "42" },
      { label: "PTS",  value: "94",   highlight: true },
      { label: "+/-",  value: "+14" },
      { label: "PPG",  value: "18",   highlight: true },
      { label: "SOG",  value: "318",  highlight: true },
    ],
  },

  // ─── TENNIS ─────────────────────────────────────────────────────────────────
  "Carlos Alcaraz": {
    name: "Carlos Alcaraz",
    sport: "Tennis",
    team: "ESP",
    number: "",
    position: "RH",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4790977.png",
    age: 22,
    height: "6'1\"",
    weight: "179 lbs",
    nationality: "🇪🇸 Spain",
    trend: "hot",
    season: "2026",
    lastGame: "Roland Garros SF",
    bio: "World No. 2 — two-time Wimbledon champion and Grand Slam phenom.",
    stats: [
      { label: "ATP Rank",    value: "#2",    highlight: true },
      { label: "2026 Titles", value: "3",     highlight: true },
      { label: "Win%",        value: "82%",   highlight: true },
      { label: "Aces/Match",  value: "7.2" },
      { label: "1st Srv %",   value: "67%" },
      { label: "Brk Pts Con", value: "44%",   highlight: true },
    ],
  },

  "Jannik Sinner": {
    name: "Jannik Sinner",
    sport: "Tennis",
    team: "ITA",
    number: "",
    position: "RH",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4818985.png",
    age: 24,
    height: "6'2\"",
    weight: "176 lbs",
    nationality: "🇮🇹 Italy",
    trend: "hot",
    season: "2026",
    lastGame: "Roland Garros F",
    bio: "World No. 1 — 2024 US Open champion dominating the tour.",
    stats: [
      { label: "ATP Rank",    value: "#1",    highlight: true },
      { label: "2026 Titles", value: "4",     highlight: true },
      { label: "Win%",        value: "86%",   highlight: true },
      { label: "Aces/Match",  value: "5.8" },
      { label: "1st Srv %",   value: "64%" },
      { label: "Brk Pts Con", value: "41%",   highlight: true },
    ],
  },

  "Novak Djokovic": {
    name: "Novak Djokovic",
    sport: "Tennis",
    team: "SRB",
    number: "",
    position: "RH",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/3728.png",
    age: 39,
    height: "6'2\"",
    weight: "170 lbs",
    nationality: "🇷🇸 Serbia",
    trend: "cold",
    season: "2026",
    lastGame: "Roland Garros QF",
    bio: "GOAT with 24 Grand Slam titles — age catching up but still dangerous.",
    stats: [
      { label: "ATP Rank",    value: "#5" },
      { label: "2026 Titles", value: "1" },
      { label: "Win%",        value: "71%" },
      { label: "Aces/Match",  value: "4.5" },
      { label: "1st Srv %",   value: "62%" },
      { label: "Brk Pts Con", value: "45%",   highlight: true },
    ],
  },

  "Aryna Sabalenka": {
    name: "Aryna Sabalenka",
    sport: "Tennis",
    team: "BLR",
    number: "",
    position: "RH",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4066804.png",
    age: 28,
    height: "6'0\"",
    weight: "163 lbs",
    nationality: "🇧🇾 Belarus",
    trend: "hot",
    season: "2026",
    lastGame: "Roland Garros F",
    bio: "WTA World No. 1 — three-time Grand Slam champion with elite power.",
    stats: [
      { label: "WTA Rank",    value: "#1",    highlight: true },
      { label: "2026 Titles", value: "3",     highlight: true },
      { label: "Win%",        value: "83%",   highlight: true },
      { label: "Aces/Match",  value: "4.2" },
      { label: "DF/Match",    value: "3.1" },
      { label: "Winners/M",   value: "28",    highlight: true },
    ],
  },

  "Iga Swiatek": {
    name: "Iga Swiatek",
    sport: "Tennis",
    team: "POL",
    number: "",
    position: "RH",
    photoUrl: "https://www.espn.com/i/headshots/tennis/players/full/4533802.png",
    age: 25,
    height: "5'9\"",
    weight: "128 lbs",
    nationality: "🇵🇱 Poland",
    trend: "hot",
    season: "2026",
    lastGame: "Roland Garros SF",
    bio: "Five-time Roland Garros champion — the clay court GOAT.",
    stats: [
      { label: "WTA Rank",    value: "#2",    highlight: true },
      { label: "2026 Titles", value: "3",     highlight: true },
      { label: "Win%",        value: "80%",   highlight: true },
      { label: "Brk Pts Con", value: "51%",   highlight: true },
      { label: "Winners/M",   value: "26" },
      { label: "1st Srv %",   value: "60%" },
    ],
  },
};

/** Look up a player profile by name — case-insensitive fuzzy match */
export function getPlayerProfile(name: string): PlayerProfile | null {
  // Exact match first
  if (PLAYER_DB[name]) return PLAYER_DB[name];

  // Case-insensitive
  const lower = name.toLowerCase();
  const key = Object.keys(PLAYER_DB).find(k => k.toLowerCase() === lower);
  if (key) return PLAYER_DB[key];

  // Partial match (last name)
  const lastName = name.split(" ").pop()?.toLowerCase() ?? "";
  const partialKey = Object.keys(PLAYER_DB).find(k =>
    k.toLowerCase().includes(lastName) && lastName.length > 3
  );
  if (partialKey) return PLAYER_DB[partialKey];

  return null;
}

export { PLAYER_DB };
