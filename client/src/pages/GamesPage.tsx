import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Activity } from "lucide-react";

interface Game {
  id: number; sport: string; homeTeam: string; awayTeam: string; gameTime: string;
  homeOdds: string; awayOdds: string; overUnder: number | null;
  status: string; homeScore: number | null; awayScore: number | null; inning: string | null;
}

const sportColor: Record<string, string> = {
  MLB: "text-red-400", NBA: "text-orange-400", NHL: "text-blue-400", Tennis: "text-green-400",
};

export default function GamesPage() {
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    queryFn: () => apiRequest("GET", "/api/games").then(r => r.json()),
    refetchInterval: 30000,
  });

  const sports = ["MLB", "NBA", "NHL", "Tennis"];
  const bySport = (sport: string) => games.filter(g => g.sport === sport);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Live Games</h1>
        <p className="text-sm text-muted-foreground">Scores and upcoming matchups · auto-updates every 30s</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-7">
          {sports.map(sport => {
            const sg = bySport(sport);
            if (!sg.length) return null;
            const live = sg.filter(g => g.status === "live");
            const scheduled = sg.filter(g => g.status === "scheduled");
            return (
              <section key={sport}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-bold text-sm ${sportColor[sport]}`}>{sport}</span>
                  {live.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-2 py-0.5 rounded-full">
                      <span className="live-dot !bg-red-400 !w-1.5 !h-1.5" />
                      {live.length} LIVE
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {sg.map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const isLive = game.status === "live";
  const isFinal = game.status === "final";

  return (
    <div className={`bg-card border rounded-xl p-4 card-hover ${isLive ? "border-red-400/30" : "border-border"}`}
      data-testid={`game-card-${game.id}`}>
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        {isLive ? (
          <span className="live-badge">🔴 LIVE · {game.inning || ""}</span>
        ) : isFinal ? (
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Final</span>
        ) : (
          <span className="text-[10px] text-muted-foreground">{game.gameTime}</span>
        )}
        <span className="text-[10px] text-muted-foreground">O/U {game.overUnder ?? "—"}</span>
      </div>

      {/* Teams + score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">{game.awayTeam}</span>
          <div className="flex items-center gap-2">
            {(isLive || isFinal) && game.awayScore !== null && (
              <span className="stat-number text-lg text-foreground">{game.awayScore}</span>
            )}
            <span className="text-xs text-muted-foreground">{game.awayOdds}</span>
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">{game.homeTeam}</span>
          <div className="flex items-center gap-2">
            {(isLive || isFinal) && game.homeScore !== null && (
              <span className="stat-number text-lg text-foreground">{game.homeScore}</span>
            )}
            <span className="text-xs text-muted-foreground">{game.homeOdds}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
