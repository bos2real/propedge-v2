import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PickCard from "@/components/PickCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  TrendingUp, Zap, Target, Activity, Brain, ArrowRight,
  ChevronRight, BarChart2, Flame, Star
} from "lucide-react";

interface FeedEvent {
  id: number; type: string; sport: string;
  title: string; body: string; meta: string;
  urgent: number; createdAt: number;
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
  MLB: "4 92% 62%", NBA: "32 100% 56%", NHL: "198 92% 58%", Tennis: "82 92% 56%",
};

export default function Home() {
  const qc = useQueryClient();
  const [newPickIds, setNewPickIds] = useState<Set<number>>(new Set());
  const feedEndRef = useRef<HTMLDivElement>(null);

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

  // SSE live updates
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
            }, 3000);
          }
        }
      } catch {}
    };
    return () => ev.close();
  }, [qc]);

  const elitePicks = recentPicks.filter(p => p.edge === "elite").slice(0, 3);
  const allSports = ["MLB", "NBA", "NHL", "Tennis"] as const;

  const typeIcon: Record<string, string> = {
    new_pick: "🎯", result: "📊", line_move: "🔔", hot_streak: "🔥", injury: "⚠️",
  };

  const STAT_CARDS = [
    {
      label: "Win Rate",
      value: summary ? `${summary.winRate}%` : "—",
      sub: summary ? `${summary.won}W — ${summary.lost}L` : "calculating…",
      icon: Target,
      cls: "stat-card-violet",
      iconColor: "hsl(260 95% 78%)",
      valColor: "hsl(260 95% 82%)",
    },
    {
      label: "Elite Picks",
      value: summary ? String(summary.eliteCount) : "—",
      sub: "Active now",
      icon: Zap,
      cls: "stat-card-lime",
      iconColor: "hsl(82 92% 62%)",
      valColor: "hsl(82 92% 62%)",
    },
    {
      label: "Avg EV+",
      value: summary ? `+${summary.avgEv}%` : "—",
      sub: "On pending picks",
      icon: TrendingUp,
      cls: "stat-card-cyan",
      iconColor: "hsl(193 88% 67%)",
      valColor: "hsl(193 88% 67%)",
    },
    {
      label: "Total Picks",
      value: summary ? String(summary.totalPicks) : "—",
      sub: summary ? `${summary.pending} pending` : "—",
      icon: Activity,
      cls: "stat-card-amber",
      iconColor: "hsl(38 100% 65%)",
      valColor: "hsl(38 100% 65%)",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(220 45% 4%)" }}>

      {/* ── Cinematic hero header ── */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6"
        style={{ background: "linear-gradient(135deg, hsl(260 95% 68% / 0.1) 0%, hsl(220 45% 4% / 0) 55%)" }}>
        {/* Background orb */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(260 95% 68% / 0.07) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(82 92% 56% / 0.05) 0%, transparent 70%)" }} />

        <div className="relative max-w-screen-xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="live-dot" />
                <span className="text-xs font-semibold" style={{ color: "hsl(82 92% 62%)" }}>LIVE · PEMF Algorithm</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1">
                <span className="gradient-text">AI Dashboard</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                2026 live stats · 5-factor model · updates every 45s
              </p>
            </div>
            <Link href="/predictions">
              <a className="btn-gradient px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
                <Brain className="w-4 h-4" />
                AI Predictions
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 max-w-screen-xl mx-auto">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {sumLoading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            : STAT_CARDS.map(({ label, value, sub, icon: Icon, cls, iconColor, valColor }) => (
              <div key={label} className={`rounded-2xl p-4 border ${cls} relative overflow-hidden`}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                  <span className="label-xs text-muted-foreground">{label}</span>
                </div>
                <div className="stat-number text-3xl font-black" style={{ color: valColor }}>{value}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
              </div>
            ))
          }
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left: picks ── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Elite picks spotlight */}
            {elitePicks.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "hsl(260 95% 68% / 0.15)", border: "1px solid hsl(260 95% 68% / 0.3)" }}>
                      <Flame className="w-3.5 h-3.5" style={{ color: "hsl(260 95% 78%)" }} />
                    </div>
                    <h2 className="text-sm font-bold text-foreground">Elite Picks Right Now</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold edge-elite">{elitePicks.length}</span>
                  </div>
                  <Link href="/predictions">
                    <a className="text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      style={{ color: "hsl(260 95% 75%)" }}>
                      See all <ChevronRight className="w-3 h-3" />
                    </a>
                  </Link>
                </div>
                <div className="space-y-3">
                  {elitePicks.map(pick => (
                    <PickCard key={pick.id} pick={pick} isNew={newPickIds.has(pick.id)} showReason />
                  ))}
                </div>
              </section>
            )}

            {/* Live pick feed */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="live-dot" />
                <h2 className="text-sm font-bold text-foreground">Live Pick Feed</h2>
                <span className="text-[10px] text-muted-foreground ml-1">auto-updates</span>
              </div>
              {recentLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
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

          {/* ── Right: sidebar widgets ── */}
          <div className="space-y-5">

            {/* Top picks by sport */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4" style={{ color: "hsl(82 92% 62%)" }} />
                <h2 className="text-sm font-bold text-foreground">Best Pick by Sport</h2>
              </div>
              <div className="space-y-3">
                {topPicks && allSports.map(sport => {
                  const picks = topPicks[sport] || [];
                  if (!picks.length) return null;
                  const best = picks[0];
                  const hsl = SPORT_HSL[sport];
                  return (
                    <div key={sport} className="rounded-2xl p-4 border glass-hover glass ai-card cursor-default">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`badge-${sport} text-[10px] font-bold px-2.5 py-1 rounded-full`}>{sport}</span>
                        <span className="text-[10px] text-muted-foreground">#{1} pick</span>
                      </div>
                      <div className="text-sm font-bold text-foreground mb-1">{best.player}</div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className={`text-lg font-black ${best.side === "Over" ? "side-over" : "side-under"}`}>{best.side}</span>
                        <span className="text-lg font-black text-foreground">{best.line}</span>
                        <span className="text-xs text-muted-foreground">{best.market}</span>
                      </div>
                      <div className="conf-bar mb-1.5">
                        <div className="conf-fill" style={{
                          width: `${best.confidence}%`,
                          background: `linear-gradient(90deg, hsl(${hsl} / 0.7), hsl(${hsl}))`,
                        }} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-muted-foreground">{best.confidence}% conf</span>
                        <span className="text-[10px] font-bold trend-up">+{best.ev}% EV</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4" style={{ color: "hsl(193 88% 67%)" }} />
                <h2 className="text-sm font-bold text-foreground">Activity Feed</h2>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {feedEvents.map(ev => (
                  <div key={ev.id}
                    className={`rounded-xl p-3 border transition-colors ${ev.urgent ? "elite-glow" : "border-border glass"}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0 mt-0.5">{typeIcon[ev.type] || "📌"}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground leading-snug truncate">{ev.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{ev.body}</div>
                        <div className="mt-1">
                          <span className="text-[9px] font-bold px-1.5 py-px rounded-full"
                            style={{
                              background: `hsl(${SPORT_HSL[ev.sport] ?? "260 95% 68%"} / 0.12)`,
                              color: `hsl(${SPORT_HSL[ev.sport] ?? "260 95% 78%"})`,
                              border: `1px solid hsl(${SPORT_HSL[ev.sport] ?? "260 95% 68%"} / 0.25)`,
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

      <div ref={feedEndRef} />
    </div>
  );
}
