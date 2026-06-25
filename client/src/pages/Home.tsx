import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PickCard from "@/components/PickCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp, Zap, Target, Activity, Brain,
  ArrowRight, Star, Flame, ChevronRight, Trophy
} from "lucide-react";

interface FeedEvent {
  id: number; type: string; sport: string; title: string; body: string; urgent: number;
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

const SPORT_HSL: Record<string, string> = {
  MLB: "5 96% 64%", NBA: "30 100% 58%", NHL: "196 96% 60%", Tennis: "80 96% 58%",
};

export default function Home() {
  const qc = useQueryClient();
  const [newPickIds, setNewPickIds] = useState<Set<number>>(new Set());

  const { data: summary, isLoading: sumLoading } = useQuery<Summary>({
    queryKey: ["/api/summary"],
    queryFn: () => apiRequest("GET", "/api/summary").then(r => r.json()),
    refetchInterval: 30000,
  });

  const { data: topPicks } = useQuery<Record<string, Pick[]>>({
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
    queryFn: () => apiRequest("GET", "/api/feed?limit=20").then(r => r.json()),
    refetchInterval: 15000,
  });

  useEffect(() => {
    const apiBase = (window as any).__API_BASE__ || "";
    const ev = new EventSource(`${apiBase}/api/feed/stream`);
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
            }, 4000);
          }
        }
      } catch {}
    };
    return () => ev.close();
  }, [qc]);

  const elitePicks = recentPicks.filter(p => p.edge === "elite").slice(0, 3);
  const allSports = ["MLB", "NBA", "NHL", "Tennis"] as const;

  const typeIcon: Record<string, string> = {
    new_pick: "🎯", result: "📊", line_move: "📈", hot_streak: "🔥", injury: "⚠️",
  };

  const STATS = [
    { label: "Win Rate",    value: summary ? `${summary.winRate}%`    : "—", sub: summary ? `${summary.won}W / ${summary.lost}L` : "loading…", icon: Trophy,    cls: "stat-card-violet", numCls: "num-violet" },
    { label: "Elite Picks", value: summary ? `${summary.eliteCount}`  : "—", sub: "Active now",             icon: Zap,       cls: "stat-card-lime",   numCls: "num-lime" },
    { label: "Avg EV+",     value: summary ? `+${summary.avgEv}%`    : "—", sub: "On pending picks",        icon: TrendingUp,cls: "stat-card-cyan",   numCls: "num-cyan" },
    { label: "Total Picks", value: summary ? `${summary.totalPicks}`  : "—", sub: summary ? `${summary.pending} pending` : "—", icon: Activity, cls: "stat-card-amber", numCls: "num-amber" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(216 42% 3%)" }}>

      {/* ── Cinematic Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(263 100% 70% / 0.09) 0%, transparent 55%)" }}>
        {/* Ambient orbs */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(263 100% 70% / 0.12) 0%, transparent 70%)" }} />
        <div className="absolute top-8 left-1/2 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(80 96% 58% / 0.06) 0%, transparent 70%)" }} />

        <div className="relative px-6 pt-8 pb-6 max-w-screen-xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="live-dot" />
                <span className="text-xs font-black tracking-wide" style={{ color: "hsl(80 96% 62%)" }}>LIVE · PEMF 5-FACTOR AI</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight leading-none mb-2">
                <span className="text-gradient">PropEdge</span>
                <span className="text-foreground/40 ml-3 text-xl font-light">v4.0</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Real-time AI predictions · 2026 live stats · Instant copy to PrizePicks, Underdog, FanDuel & DraftKings
              </p>
            </div>
            <Link href="/predictions">
              <a className="btn-neon px-6 py-3 rounded-2xl text-sm flex items-center gap-2 cursor-pointer font-bold">
                <Brain className="w-4 h-4" />
                AI Predictions
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {sumLoading
              ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              : STATS.map(({ label, value, sub, icon: Icon, cls, numCls }) => (
                <div key={label} className={`rounded-2xl p-5 border relative overflow-hidden ${cls}`}>
                  {/* Corner glow */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-30"
                    style={{ background: "radial-gradient(circle, currentColor, transparent)", filter: "blur(12px)" }} />
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 opacity-70" />
                    <span className="label-caps">{label}</span>
                  </div>
                  <div className={`stat-number text-3xl font-black leading-none mb-1 ${numCls}`}>{value}</div>
                  <div className="text-[11px] text-muted-foreground">{sub}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 max-w-screen-xl mx-auto mt-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left: picks ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Elite spotlight */}
            {elitePicks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "hsl(263 100% 70% / 0.18)", border: "1px solid hsl(263 100% 70% / 0.32)", boxShadow: "0 0 16px hsl(263 100% 70% / 0.2)" }}>
                      <Flame className="w-4 h-4" style={{ color: "hsl(263 100% 80%)" }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-foreground">Elite Picks</h2>
                      <p className="text-[10px] text-muted-foreground">Highest EV opportunities right now</p>
                    </div>
                    <span className="edge-elite text-[10px] font-black px-2 py-1 rounded-full ml-1">{elitePicks.length}</span>
                  </div>
                  <Link href="/predictions">
                    <a className="flex items-center gap-1 text-[11px] font-bold transition-colors"
                      style={{ color: "hsl(263 100% 76%)" }}>
                      See all <ChevronRight className="w-3 h-3" />
                    </a>
                  </Link>
                </div>
                <div className="space-y-3">
                  {elitePicks.map(p => <PickCard key={p.id} pick={p} isNew={newPickIds.has(p.id)} showReason />)}
                </div>
              </section>
            )}

            {/* Live feed */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="live-dot" />
                <h2 className="text-sm font-black text-foreground">Live Pick Feed</h2>
                <span className="text-[10px] text-muted-foreground">auto-updates</span>
              </div>
              {recentLoading
                ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
                : <div className="space-y-3">{recentPicks.slice(0, 15).map(p => <PickCard key={p.id} pick={p} isNew={newPickIds.has(p.id)} />)}</div>
              }
            </section>
          </div>

          {/* ── Right widgets ── */}
          <div className="space-y-5">

            {/* Best pick by sport */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Star className="w-4 h-4" style={{ color: "hsl(80 96% 62%)" }} />
                <h2 className="text-sm font-black text-foreground">Best Pick · Sport</h2>
              </div>
              <div className="space-y-3">
                {topPicks && allSports.map(sport => {
                  const picks = topPicks[sport] || [];
                  if (!picks.length) return null;
                  const best = picks[0];
                  const hsl = SPORT_HSL[sport];
                  return (
                    <div key={sport} className="rounded-2xl p-4 border relative overflow-hidden card-hover"
                      style={{ background: "hsl(218 38% 6%)", borderColor: "hsl(218 28% 12%)" }}>
                      {/* Sport accent strip */}
                      <div className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, hsl(${hsl}), transparent)` }} />
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`badge-${sport} text-[10px] font-black px-2.5 py-1 rounded-full`}>{sport}</span>
                        <span className="text-[10px] text-muted-foreground">Top pick</span>
                      </div>
                      <div className="text-sm font-black text-foreground mb-1">{best.player}</div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-2xl font-black ${best.side === "Over" ? "side-over" : "side-under"}`}>{best.side}</span>
                        <span className="text-2xl font-black text-foreground">{best.line}</span>
                        <span className="text-xs text-muted-foreground">{best.market}</span>
                      </div>
                      <div className="conf-bar mb-2">
                        <div className="conf-fill" style={{
                          width: `${best.confidence}%`,
                          background: `linear-gradient(90deg, hsl(${hsl} / 0.7), hsl(${hsl}))`,
                        }} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-muted-foreground">{best.confidence}% conf</span>
                        <span className="text-[10px] font-black trend-up">+{best.ev}% EV</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Activity className="w-4 h-4" style={{ color: "hsl(190 92% 64%)" }} />
                <h2 className="text-sm font-black text-foreground">Activity Feed</h2>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {feedEvents.map(ev => (
                  <div key={ev.id} className={`rounded-xl p-3 border transition-all ${ev.urgent ? "elite-glow" : ""}`}
                    style={{ background: "hsl(218 38% 6%)", borderColor: ev.urgent ? undefined : "hsl(218 28% 12%)" }}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm shrink-0 mt-0.5">{typeIcon[ev.type] || "📌"}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground leading-snug truncate">{ev.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{ev.body}</div>
                        <div className="mt-1.5">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                            style={{
                              background: `hsl(${SPORT_HSL[ev.sport] || "263 100% 70%"} / 0.13)`,
                              color: `hsl(${SPORT_HSL[ev.sport] || "263 100% 80%"})`,
                              border: `1px solid hsl(${SPORT_HSL[ev.sport] || "263 100% 70%"} / 0.28)`,
                            }}>
                            {ev.sport}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
