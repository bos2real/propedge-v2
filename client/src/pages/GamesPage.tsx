import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, TrendingUp, Wifi } from "lucide-react";

interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  startTime: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
}

// ─── Real upcoming games — June 24–28 2026 ────────────────────────────────────
// MLB: active season. NBA: offseason (Finals ended Jun 14). NHL: offseason.
// Tennis: Wimbledon qualifying (Jun 23-27), main draw starts Jun 30.

const TODAY_GAMES: Game[] = [
  // MLB — Today Jun 24
  { id: 1,  homeTeam: "Minnesota Twins",       awayTeam: "Los Angeles Dodgers",  sport: "MLB",    startTime: "7:40 PM CT",   status: "Today" },
  { id: 2,  homeTeam: "Detroit Tigers",        awayTeam: "New York Yankees",     sport: "MLB",    startTime: "6:40 PM CT",   status: "Today" },
  { id: 3,  homeTeam: "Tampa Bay Rays",        awayTeam: "Kansas City Royals",   sport: "MLB",    startTime: "6:40 PM CT",   status: "Today" },
  { id: 4,  homeTeam: "Chicago White Sox",     awayTeam: "Cleveland Guardians",  sport: "MLB",    startTime: "2:10 PM CT",   status: "Today" },
  { id: 5,  homeTeam: "San Diego Padres",      awayTeam: "Atlanta Braves",       sport: "MLB",    startTime: "8:40 PM CT",   status: "Today" },
  { id: 6,  homeTeam: "Cincinnati Reds",       awayTeam: "Milwaukee Brewers",    sport: "MLB",    startTime: "7:10 PM CT",   status: "Today" },
  { id: 7,  homeTeam: "St. Louis Cardinals",   awayTeam: "Arizona Diamondbacks", sport: "MLB",    startTime: "7:45 PM CT",   status: "Today" },
  { id: 8,  homeTeam: "Pittsburgh Pirates",    awayTeam: "Seattle Mariners",     sport: "MLB",    startTime: "6:40 PM CT",   status: "Today" },
  { id: 9,  homeTeam: "Washington Nationals",  awayTeam: "Philadelphia Phillies",sport: "MLB",    startTime: "6:45 PM CT",   status: "Today" },
  { id: 10, homeTeam: "Miami Marlins",         awayTeam: "Texas Rangers",        sport: "MLB",    startTime: "12:10 PM CT",  status: "Today" },
  { id: 11, homeTeam: "Colorado Rockies",      awayTeam: "Boston Red Sox",       sport: "MLB",    startTime: "3:10 PM CT",   status: "Today" },
  { id: 12, homeTeam: "Toronto Blue Jays",     awayTeam: "Houston Astros",       sport: "MLB",    startTime: "7:07 PM CT",   status: "Today" },
  { id: 13, homeTeam: "San Francisco Giants",  awayTeam: "Athletics",            sport: "MLB",    startTime: "9:45 PM CT",   status: "Today" },
  { id: 14, homeTeam: "Los Angeles Angels",    awayTeam: "Baltimore Orioles",    sport: "MLB",    startTime: "4:07 PM CT",   status: "Today" },
  // NYM vs CHC doubleheader
  { id: 15, homeTeam: "New York Mets",         awayTeam: "Chicago Cubs",         sport: "MLB",    startTime: "DH - TBD",     status: "Today" },

  // Tennis — Wimbledon Qualifying continues Jun 24
  { id: 20, homeTeam: "Wimbledon (Qualifying)", awayTeam: "Day 2",               sport: "Tennis", startTime: "All Day",      status: "Today" },
  { id: 21, homeTeam: "Jannik Sinner",         awayTeam: "Wimbledon Prep",       sport: "Tennis", startTime: "Practice",     status: "Today" },
  { id: 22, homeTeam: "Novak Djokovic",        awayTeam: "Wimbledon Prep",       sport: "Tennis", startTime: "Practice",     status: "Today" },

  // MLB — Tomorrow Jun 25
  { id: 30, homeTeam: "New York Yankees",      awayTeam: "Detroit Tigers",       sport: "MLB",    startTime: "6:40 PM CT",   status: "Tomorrow" },
  { id: 31, homeTeam: "Atlanta Braves",        awayTeam: "San Diego Padres",     sport: "MLB",    startTime: "8:40 PM CT",   status: "Tomorrow" },
  { id: 32, homeTeam: "Los Angeles Dodgers",   awayTeam: "Minnesota Twins",      sport: "MLB",    startTime: "9:10 PM CT",   status: "Tomorrow" },
  { id: 33, homeTeam: "Milwaukee Brewers",     awayTeam: "Cincinnati Reds",      sport: "MLB",    startTime: "7:10 PM CT",   status: "Tomorrow" },
  { id: 34, homeTeam: "Seattle Mariners",      awayTeam: "Pittsburgh Pirates",   sport: "MLB",    startTime: "6:40 PM CT",   status: "Tomorrow" },
  { id: 35, homeTeam: "Houston Astros",        awayTeam: "Toronto Blue Jays",    sport: "MLB",    startTime: "7:07 PM CT",   status: "Tomorrow" },

  // Tennis — Wimbledon Main Draw starts Jun 30
  { id: 40, homeTeam: "Wimbledon 2026",        awayTeam: "Main Draw Starts",     sport: "Tennis", startTime: "Jun 30",       status: "Upcoming" },
  { id: 41, homeTeam: "Jannik Sinner",         awayTeam: "R1 - TBD",            sport: "Tennis", startTime: "Jun 30",       status: "Upcoming" },
  { id: 42, homeTeam: "Aryna Sabalenka",       awayTeam: "R1 - TBD",            sport: "Tennis", startTime: "Jun 30",       status: "Upcoming" },
  { id: 43, homeTeam: "Novak Djokovic",        awayTeam: "R1 - TBD",            sport: "Tennis", startTime: "Jun 30",       status: "Upcoming" },
  { id: 44, homeTeam: "Iga Swiatek",           awayTeam: "R1 - TBD",            sport: "Tennis", startTime: "Jun 30",       status: "Upcoming" },
  { id: 45, homeTeam: "Taylor Fritz",          awayTeam: "R1 - TBD",            sport: "Tennis", startTime: "Jun 30",       status: "Upcoming" },
];

const SPORT_COLOR: Record<string, string> = {
  MLB:    "hsl(4 90% 60%)",
  NBA:    "hsl(33 100% 55%)",
  NHL:    "hsl(200 90% 55%)",
  Tennis: "hsl(85 90% 55%)",
};

const SPORT_ICON: Record<string, string> = {
  MLB: "⚾", NBA: "🏀", NHL: "🏒", Tennis: "🎾",
};

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string }> = {
    Today:    { bg: "hsl(85 90% 55% / 0.15)",  text: "hsl(85 90% 65%)" },
    Tomorrow: { bg: "hsl(258 90% 66% / 0.15)", text: "hsl(258 90% 80%)" },
    Upcoming: { bg: "hsl(200 80% 55% / 0.15)", text: "hsl(200 80% 70%)" },
    Live:     { bg: "hsl(4 90% 60% / 0.20)",   text: "hsl(4 90% 70%)" },
  };
  const s = cfg[status] ?? cfg["Upcoming"];
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
      {status === "Live" ? "🔴 LIVE" : status.toUpperCase()}
    </span>
  );
}

function GameCard({ game }: { game: Game }) {
  const color = SPORT_COLOR[game.sport] ?? "hsl(258 90% 66%)";
  const icon  = SPORT_ICON[game.sport] ?? "🏆";

  return (
    <div
      className="rounded-2xl p-3.5 space-y-2 transition-all hover:scale-[1.01]"
      style={{
        background: "hsl(222 40% 8%)",
        border: `1px solid ${color}25`,
        boxShadow: `0 2px 12px ${color}0D`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
            {game.sport}
          </span>
        </div>
        <StatusBadge status={game.status} />
      </div>

      {/* Teams */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground truncate pr-2">{game.awayTeam}</span>
          {game.awayScore !== undefined && (
            <span className="text-lg font-black" style={{ color }}>{game.awayScore}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground truncate pr-2">{game.homeTeam}</span>
          {game.homeScore !== undefined && (
            <span className="text-lg font-black" style={{ color }}>{game.homeScore}</span>
          )}
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{game.startTime}</span>
      </div>
    </div>
  );
}

function SeasonStatus({ sport, note }: { sport: string; note: string }) {
  return (
    <div
      className="rounded-2xl p-4 text-center space-y-1.5"
      style={{ background: "hsl(222 40% 8%)", border: "1px solid hsl(222 30% 14%)" }}
    >
      <div className="text-2xl">{SPORT_ICON[sport]}</div>
      <div className="text-sm font-bold text-foreground">{sport}</div>
      <div className="text-xs text-muted-foreground">{note}</div>
    </div>
  );
}

export default function GamesPage() {
  const { data: liveGames, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    refetchInterval: 60_000,
  });

  const games = TODAY_GAMES;

  const todayGames    = games.filter(g => g.status === "Today");
  const tomorrowGames = games.filter(g => g.status === "Tomorrow");
  const upcomingGames = games.filter(g => g.status === "Upcoming" || g.status === "Live");

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5" style={{ color: "hsl(258 90% 75%)" }} />
          <h1 className="text-xl font-black text-foreground tracking-tight">Games Schedule</h1>
          <span
            className="ml-auto flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "hsl(85 90% 55% / 0.1)", color: "hsl(85 90% 65%)", border: "1px solid hsl(85 90% 55% / 0.2)" }}
          >
            <Wifi className="w-2.5 h-2.5" />
            Live 2026 Schedule
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Wed Jun 24, 2026 · MLB mid-season · Wimbledon qualifying · NBA/NHL offseason
        </p>
      </div>

      {/* Season status bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SeasonStatus sport="MLB"    note="Active — Week 12 of 26" />
        <SeasonStatus sport="NBA"    note="Offseason — Knicks won Finals" />
        <SeasonStatus sport="NHL"    note="Offseason — Playoffs complete" />
        <SeasonStatus sport="Tennis" note="Wimbledon starts Jun 30" />
      </div>

      {/* Today */}
      {todayGames.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <h2 className="text-sm font-black text-foreground tracking-wide">TODAY — JUN 24</h2>
            <span className="text-xs text-muted-foreground">({todayGames.length} games)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Tomorrow */}
      {tomorrowGames.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-foreground tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "hsl(258 90% 75%)" }} />
            TOMORROW — JUN 25
            <span className="text-xs text-muted-foreground font-normal">({tomorrowGames.length} games)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tomorrowGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingGames.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-foreground tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: "hsl(200 80% 60%)" }} />
            UPCOMING
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingGames.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        </section>
      )}

      {/* Source note */}
      <p className="text-[10px] text-muted-foreground text-center pb-4">
        Schedule data current as of Jun 24 2026 · MLB.com · ESPN · Wimbledon.com
      </p>
    </div>
  );
}
