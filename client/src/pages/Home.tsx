import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PickCard from "@/components/PickCard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Zap, Target, Activity } from "lucide-react";

interface FeedEvent {
  id: number;
  type: string;
  sport: string;
  title: string;
  body: string;
  meta: string;
  urgent: number;
  createdAt: number;
}

interface Pick {
  id: number; sport: string; player: string; team: string; opponent: string;
  market: string; line: number; side: string; confidence: number; ev: number;
  edge: string; reasoning: string; gameTime: string; status: string; createdAt: number;
}

interface Summary {
  totalPicks: number; won: number; lost: number; pending: number;
  winRate: number; eliteCount: number; avgEv: number;
}

export default function Home() {
  const qc = useQueryClient();
  const [newPickIds, setNewPickIds] = useState<Set<number>>(new Set());
  const feedEndRef = useRef<HTMLDivElement>(null);

  const { data: summary, isLoading: sumLoading } = useQuery<Summary>({
    queryKey: ["/api/summary"],
    queryFn: () => apiRequest("GET", "/api/summary").then(r => r.json()),
    refetchInterval: 30000,
  });

  const { data: topPicks, isLoading: picksLoading } = useQuery<Record<string, Pick[]>>({
    queryKey: ["/api/picks/top"],
    queryFn: () => apiRequest("GET", "/api/picks/top").then(r => r.json()),
    refetchInterval: 45000,
  });

  const { data: recentPicks = [], isLoading: recentLoading } = useQuery<Pick[]>({
    queryKey: ["/api/picks"],
    queryFn: () => apiRequest("GET", "/api/picks?limit=30").then(r => r.json()),
    refetchInterval: 45000,
  });

  const { data: feedEvents = [] } = useQuery<FeedEvent[]>({
    queryKey: ["/api/feed"],
    queryFn: () => apiRequest("GET", "/api/feed?limit=30").then(r => r.json()),
    refetchInterval: 15000,
  });

  // SSE for live feed updates
  useEffect(() => {
    const apiBase = (window as any).__API_BASE__ || "";
    const url = `${apiBase}/api/feed/stream`;
    const ev = new EventSource(url);

    ev.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event || data.pick) {
          qc.invalidateQueries({ queryKey: ["/api/feed"] });
          qc.invalidateQueries({ queryKey: ["/api/picks"] });
          qc.invalidateQueries({ queryKey: ["/api/picks/top"] });
          qc.invalidateQueries({ queryKey: ["/api/summary"] });
          if (data.pick) {
            setNewPickIds(prev => new Set([...prev, data.pick.id]));
            setTimeout(() => {
              setNewPickIds(prev => { const n = new Set(prev); n.delete(data.pick.id); return n; });
            }, 3000);
          }
        }
      } catch {}
    };

    return () => ev.close();
  }, [qc]);

  const elitePicks = recentPicks.filter(p => p.edge === "elite").slice(0, 3);
  const allSports = ["MLB", "NBA", "NHL", "Tennis"] as const;

  const sportColor: Record<string, string> = {
    MLB: "text-red-400", NBA: "text-orange-400", NHL: "text-sky-400", Tennis: "text-lime-400",
  };

  const typeIcon: Record<string, string> = {
    new_pick: "🎯", result: "📊", line_move: "🔔", hot_streak: "🔥", injury: "⚠️",
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1">AI Dashboard</h1>
        <p className="text-sm text-muted-foreground">Auto-generated picks · Updates every 45 seconds</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {sumLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) : summary && (
          <>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-muted-foreground">Win Rate</span>
              </div>
              <div className="stat-number text-2xl text-violet-400">{summary.winRate}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">{summary.won}W — {summary.lost}L</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-muted-foreground">Elite Picks</span>
              </div>
              <div className="stat-number text-2xl text-violet-400">{summary.eliteCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Active now</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-muted-foreground">Avg EV+</span>
              </div>
              <div className="stat-number text-2xl text-green-400">+{summary.avgEv}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">On pending picks</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="text-xs text-muted-foreground">Total Picks</span>
              </div>
              <div className="stat-number text-2xl text-sky-400">{summary.totalPicks}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{summary.pending} pending</div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Live Feed */}
        <div className="xl:col-span-2 space-y-6">
          {/* Elite picks */}
          {elitePicks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-bold text-foreground">Elite Picks Right Now</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{background:"hsl(258 90% 66% / 0.12)", color:"hsl(258 90% 80%)", border:"1px solid hsl(258 90% 66% / 0.25)"}}>{elitePicks.length} active</span>
              </div>
              <div className="space-y-3">
                {elitePicks.map(pick => (
                  <PickCard key={pick.id} pick={pick} isNew={newPickIds.has(pick.id)} showReason />
                ))}
              </div>
            </section>
          )}

          {/* Recent picks live feed */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="live-dot" />
              <h2 className="text-sm font-bold text-foreground">Live Pick Feed</h2>
            </div>
            {recentLoading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {recentPicks.slice(0, 15).map(pick => (
                  <PickCard key={pick.id} pick={pick} isNew={newPickIds.has(pick.id)} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Activity feed + top by sport */}
        <div className="space-y-5">
          {/* Activity feed */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-foreground">Activity Feed</h2>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {feedEvents.map(ev => (
                <div key={ev.id} className={`bg-card border rounded-lg p-3 ${ev.urgent ? "" : "border-border"}`} style={ev.urgent ? {border:"1px solid hsl(258 90% 66% / 0.35)"} : undefined}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{typeIcon[ev.type] || "📌"}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground leading-snug truncate">{ev.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{ev.body}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-semibold ${sportColor[ev.sport] || "text-muted-foreground"}`}>{ev.sport}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top picks by sport */}
          {topPicks && allSports.map(sport => {
            const picks = topPicks[sport] || [];
            if (!picks.length) return null;
            const best = picks[0];
            return (
              <div key={sport} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge-${sport} text-[10px] font-bold px-2 py-0.5 rounded-full`}>{sport}</span>
                  <span className="text-[10px] text-muted-foreground">Top pick</span>
                </div>
                <div className="text-sm font-bold text-foreground mb-0.5">{best.player}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-base font-black ${best.side === "Over" ? "side-over" : "side-under"}`}>{best.side}</span>
                  <span className="text-base font-black text-foreground">{best.line}</span>
                  <span className="text-xs text-muted-foreground">{best.market}</span>
                </div>
                <div className="conf-bar">
                  <div className="conf-fill" style={{ width: `${best.confidence}%`, background: "linear-gradient(90deg, hsl(258 90% 55%), hsl(258 90% 75%))" }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{best.confidence}% confidence</span>
                  <span className="text-[10px] text-green-400 font-bold">+{best.ev}% EV</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div ref={feedEndRef} />
    </div>
  );
}
