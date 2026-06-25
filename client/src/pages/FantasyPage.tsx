import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Brain, TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle2, XCircle, RefreshCw, Zap, DollarSign,
  Activity, Trophy, ChevronRight, ArrowUpDown, Target,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface InjuryReport {
  player: string; team: string; sport: string;
  status: "Out" | "Doubtful" | "Questionable" | "Day-to-Day" | "Active";
  injury: string; lastUpdate: string; impactScore: number; recommendation: string;
}
interface FantasyPlayer {
  id: number; name: string; team: string; sport: string; position: string;
  salary: number; projPoints: number; value: number; ownership: number;
  edge: "elite" | "high" | "mid" | "low";
  aiRec: "Must Start" | "Start" | "Flex" | "Sit" | "Avoid";
  reasoning: string; trend: "up" | "down" | "flat";
  matchup: string; matchupGrade: "A" | "B" | "C" | "D" | "F";
  injuryStatus: string; recentForm: number[];
}
interface TradeAnalysis {
  playerA: string; playerB: string;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  recommendation: "Accept" | "Decline" | "Counter";
  explanation: string; winnerBy: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const REC_COLORS: Record<string, string> = {
  "Must Start": "hsl(80 96% 58%)", Start: "hsl(190 92% 60%)",
  Flex: "hsl(263 100% 72%)", Sit: "hsl(38 100% 65%)", Avoid: "hsl(5 96% 64%)",
};
const STATUS_COLORS: Record<string, string> = {
  Active: "hsl(80 96% 58%)", "Day-to-Day": "hsl(38 100% 65%)",
  Questionable: "hsl(30 100% 58%)", Doubtful: "hsl(5 96% 64%)", Out: "hsl(0 0% 45%)",
};
const GRADE_COLORS: Record<string, string> = {
  "A+": "hsl(80 96% 58%)", A: "hsl(190 92% 60%)", "B+": "hsl(263 100% 72%)",
  B: "hsl(196 96% 60%)", C: "hsl(38 100% 65%)", D: "hsl(5 96% 64%)",
};
const EDGE_LABELS: Record<string, string> = { elite: "ELITE", high: "HIGH", mid: "MID", low: "LOW" };

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const lastUp = data[data.length - 1] >= data[data.length - 2];
  return (
    <svg width={w} height={h} className="opacity-90">
      <polyline points={pts} fill="none"
        stroke={lastUp ? "hsl(80 96% 58%)" : "hsl(5 96% 64%)"}
        strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return <circle key={i} cx={x} cy={y} r="2.5"
          fill={i === data.length - 1 ? (lastUp ? "hsl(80 96% 58%)" : "hsl(5 96% 64%)") : "transparent"} />;
      })}
    </svg>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, color }: {
  icon: any; title: string; subtitle?: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs" style={{ color: "hsl(220 15% 55%)" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function FantasyPage() {
  const [sportFilter, setSportFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"projPoints" | "value" | "salary">("projPoints");
  const [tradeA, setTradeA] = useState("");
  const [tradeB, setTradeB] = useState("");
  const [activeTab, setActiveTab] = useState<"lineup" | "injuries" | "trade">("lineup");

  const qc = useQueryClient();

  const { data: players = [], isLoading: loadingPlayers } = useQuery<FantasyPlayer[]>({
    queryKey: ["/api/fantasy/players", sportFilter],
    queryFn: () => apiRequest("GET", sportFilter === "All" ? "/api/fantasy/players" : `/api/fantasy/players?sport=${sportFilter}`).then(r => r.json()),
    refetchInterval: 30000,
  });

  const { data: injuries = [], isLoading: loadingInjuries } = useQuery<InjuryReport[]>({
    queryKey: ["/api/fantasy/injuries", sportFilter],
    queryFn: () => apiRequest("GET", sportFilter === "All" ? "/api/fantasy/injuries" : `/api/fantasy/injuries?sport=${sportFilter}`).then(r => r.json()),
    refetchInterval: 30000,
  });

  const tradeMutation = useMutation<TradeAnalysis, Error, { playerA: string; playerB: string }>({
    mutationFn: (body) => apiRequest("POST", "/api/fantasy/trade", body).then(r => r.json()),
  });

  const sorted = [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  const mustStarts = sorted.filter(p => p.aiRec === "Must Start");
  const riskyPlayers = sorted.filter(p => p.aiRec === "Sit" || p.aiRec === "Avoid");

  const SPORTS = ["All", "MLB", "Tennis"];
  const TABS = [
    { id: "lineup", label: "AI Lineup", icon: Brain },
    { id: "injuries", label: "Injury Tracker", icon: Activity },
    { id: "trade", label: "Trade Analyzer", icon: ArrowUpDown },
  ] as const;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6" style={{ background: "hsl(216 42% 3%)" }}>
      {/* Header */}
      <div className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(263 100% 12%) 0%, hsl(216 42% 6%) 100%)", border: "1px solid hsl(263 100% 70% / 0.2)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(263 100% 70%), transparent)", transform: "translate(30%, -30%)" }} />
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain size={22} style={{ color: "hsl(263 100% 72%)" }} />
              <span className="label-caps" style={{ color: "hsl(263 100% 72%)" }}>AI Fantasy Assistant</span>
            </div>
            <h1 className="text-xl font-black text-white mb-1">Daily Lineup Builder</h1>
            <p className="text-sm" style={{ color: "hsl(220 15% 55%)" }}>
              PEMF-powered projections · {players.length} players analyzed · Updated every 30s
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex gap-3">
            {[
              { label: "Must Start", val: mustStarts.length, color: "hsl(80 96% 58%)" },
              { label: "Risky", val: riskyPlayers.length, color: "hsl(5 96% 64%)" },
              { label: "Injuries", val: injuries.filter(i => i.status !== "Active").length, color: "hsl(38 100% 65%)" },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-4 py-2.5 text-center min-w-[64px]"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
                <div className="label-caps text-[9px]" style={{ color: `${s.color}99` }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sport Filter + Tabs */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {SPORTS.map(s => (
            <button key={s} onClick={() => setSportFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={sportFilter === s ? { background: "hsl(263 100% 70%)", color: "#fff" } : { background: "hsl(220 20% 10%)", color: "hsl(220 15% 55%)", border: "1px solid hsl(220 20% 18%)" }}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1" style={{ background: "hsl(220 20% 8%)", padding: "4px", borderRadius: "10px" }}>
          {TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={active ? { background: "hsl(263 100% 70%)", color: "#fff" } : { color: "hsl(220 15% 55%)" }}>
                <t.icon size={13} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab: AI Lineup ── */}
      {activeTab === "lineup" && (
        <div className="space-y-4">
          {/* Sort controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: "hsl(220 15% 45%)" }}>Sort by:</span>
            {(["projPoints", "value", "salary"] as const).map(key => (
              <button key={key} onClick={() => setSortBy(key)}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={sortBy === key ? { background: "hsl(80 96% 58% / 0.15)", color: "hsl(80 96% 58%)", border: "1px solid hsl(80 96% 58% / 0.3)" } : { color: "hsl(220 15% 50%)", background: "hsl(220 20% 9%)", border: "1px solid hsl(220 20% 16%)" }}>
                {key === "projPoints" ? "Proj Pts" : key === "value" ? "Value (pts/$k)" : "Salary"}
              </button>
            ))}
          </div>

          {loadingPlayers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map(p => {
                const recColor = REC_COLORS[p.aiRec] || "hsl(220 15% 50%)";
                const trendIcon = p.trend === "up" ? TrendingUp : p.trend === "down" ? TrendingDown : Minus;
                const trendColor = p.trend === "up" ? "hsl(80 96% 58%)" : p.trend === "down" ? "hsl(5 96% 64%)" : "hsl(220 15% 55%)";
                const edgeColor = { elite: "hsl(80 96% 58%)", high: "hsl(190 92% 60%)", mid: "hsl(263 100% 72%)", low: "hsl(220 15% 45%)" }[p.edge];
                return (
                  <div key={p.id} className="rounded-2xl p-4 transition-all hover:scale-[1.01]"
                    data-testid={`fantasy-player-${p.id}`}
                    style={{ background: "hsl(220 20% 7%)", border: p.aiRec === "Must Start" ? `1px solid ${recColor}50` : "1px solid hsl(220 20% 14%)" }}>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          <span className="label-caps text-[9px] px-1.5 py-0.5 rounded"
                            style={{ background: `${edgeColor}20`, color: edgeColor }}>
                            {EDGE_LABELS[p.edge]}
                          </span>
                        </div>
                        <span className="text-[11px]" style={{ color: "hsl(220 15% 50%)" }}>
                          {p.team} · {p.position} · {p.sport}
                        </span>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                        style={{ background: `${recColor}18`, color: recColor }}>
                        {p.aiRec}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Proj Pts", val: p.projPoints.toFixed(1), color: "hsl(263 100% 72%)" },
                        { label: "Value", val: `${p.value.toFixed(1)}x`, color: "hsl(80 96% 58%)" },
                        { label: "Salary", val: `$${(p.salary / 1000).toFixed(1)}k`, color: "hsl(190 92% 60%)" },
                      ].map(s => (
                        <div key={s.label} className="rounded-lg p-2 text-center"
                          style={{ background: "hsl(220 20% 10%)" }}>
                          <div className="font-black text-sm" style={{ color: s.color }}>{s.val}</div>
                          <div className="label-caps text-[9px]" style={{ color: "hsl(220 15% 45%)" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Form sparkline + trend */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="label-caps text-[9px] mb-1" style={{ color: "hsl(220 15% 40%)" }}>Last 5 Games</div>
                        <Sparkline data={p.recentForm} />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {(() => { const TI = trendIcon; return <TI size={13} style={{ color: trendColor }} />; })()}
                          <span className="text-xs font-semibold" style={{ color: trendColor }}>{p.trend.toUpperCase()}</span>
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "hsl(220 15% 45%)" }}>
                          {p.ownership}% owned
                        </div>
                        <div className="text-[10px]" style={{ color: "hsl(220 15% 40%)" }}>
                          Matchup: <span style={{ color: GRADE_COLORS[p.matchupGrade] || "#fff" }}>{p.matchupGrade}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="rounded-lg px-3 py-2"
                      style={{ background: "hsl(220 20% 9%)", borderLeft: `2px solid ${recColor}60` }}>
                      <p className="text-[11px] leading-relaxed" style={{ color: "hsl(220 15% 60%)" }}>
                        {p.reasoning}
                      </p>
                    </div>

                    {/* Matchup tag */}
                    <div className="flex items-center gap-1 mt-2.5">
                      <Target size={11} style={{ color: "hsl(220 15% 40%)" }} />
                      <span className="text-[10px]" style={{ color: "hsl(220 15% 45%)" }}>{p.matchup}</span>
                      {p.injuryStatus !== "Active" && (
                        <span className="ml-auto label-caps text-[9px] px-1.5 rounded"
                          style={{ background: "hsl(38 100% 65% / 0.15)", color: "hsl(38 100% 65%)" }}>
                          ⚠ {p.injuryStatus}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Injury Tracker ── */}
      {activeTab === "injuries" && (
        <div className="space-y-3">
          <SectionHeader icon={Activity} title="Injury Tracker" subtitle="Real-time status · Updated before first pitch" color="hsl(38 100% 65%)" />
          {loadingInjuries ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {injuries.map((inj, i) => {
                const sc = STATUS_COLORS[inj.status] || "hsl(220 15% 50%)";
                const isRisky = inj.status === "Questionable" || inj.status === "Doubtful" || inj.status === "Out";
                return (
                  <div key={i} className="rounded-xl p-4 flex gap-3"
                    style={{ background: "hsl(220 20% 7%)", border: `1px solid ${sc}30` }}>
                    {/* Status indicator */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc, boxShadow: `0 0 8px ${sc}` }} />
                      <div className="w-px flex-1" style={{ background: `${sc}30` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-bold text-white text-sm">{inj.player}</span>
                          <span className="text-[11px] ml-2" style={{ color: "hsl(220 15% 50%)" }}>{inj.team} · {inj.sport}</span>
                        </div>
                        <span className="label-caps text-[10px] px-2 py-0.5 rounded flex-shrink-0"
                          style={{ background: `${sc}20`, color: sc }}>
                          {inj.status}
                        </span>
                      </div>
                      <div className="text-xs mb-1.5" style={{ color: "hsl(220 15% 55%)" }}>{inj.injury}</div>
                      {/* Impact bar */}
                      {inj.impactScore > 0 && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="label-caps text-[9px]" style={{ color: "hsl(220 15% 40%)" }}>IMPACT</span>
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(220 20% 14%)" }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${inj.impactScore * 10}%`, background: sc }} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: sc }}>{inj.impactScore}/10</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 rounded-lg px-2 py-1.5"
                        style={{ background: isRisky ? "hsl(38 100% 65% / 0.08)" : "hsl(80 96% 58% / 0.08)" }}>
                        {isRisky
                          ? <AlertTriangle size={11} style={{ color: "hsl(38 100% 65%)" }} className="flex-shrink-0" />
                          : <CheckCircle2 size={11} style={{ color: "hsl(80 96% 58%)" }} className="flex-shrink-0" />
                        }
                        <p className="text-[10px] leading-tight" style={{ color: isRisky ? "hsl(38 100% 65%)" : "hsl(80 96% 58%)" }}>
                          {inj.recommendation}
                        </p>
                      </div>
                      <div className="text-[9px] mt-1" style={{ color: "hsl(220 15% 35%)" }}>Updated {inj.lastUpdate}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Trade Analyzer ── */}
      {activeTab === "trade" && (
        <div className="space-y-4 max-w-2xl">
          <SectionHeader icon={ArrowUpDown} title="AI Trade Analyzer" subtitle="Input two players — get instant grade + recommendation" color="hsl(190 92% 60%)" />

          <div className="rounded-2xl p-5" style={{ background: "hsl(220 20% 7%)", border: "1px solid hsl(220 20% 14%)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                { label: "You Give", key: "A", val: tradeA, setter: setTradeA, color: "hsl(5 96% 64%)" },
                { label: "You Get", key: "B", val: tradeB, setter: setTradeB, color: "hsl(80 96% 58%)" },
              ].map(f => (
                <div key={f.key}>
                  <label className="label-caps text-[10px] mb-1.5 block" style={{ color: f.color }}>{f.label}</label>
                  <input
                    value={f.val}
                    onChange={e => f.setter(e.target.value)}
                    placeholder="Player name..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white outline-none transition-all"
                    style={{ background: "hsl(220 20% 10%)", border: `1px solid ${f.color}30` }}
                    data-testid={`trade-input-${f.key.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => tradeMutation.mutate({ playerA: tradeA, playerB: tradeB })}
              disabled={!tradeA || !tradeB || tradeMutation.isPending}
              data-testid="analyze-trade-btn"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: "hsl(263 100% 70%)", color: "#fff", opacity: (!tradeA || !tradeB) ? 0.5 : 1 }}>
              {tradeMutation.isPending ? <RefreshCw size={15} className="animate-spin" /> : <Brain size={15} />}
              Analyze Trade
            </button>
          </div>

          {/* Result */}
          {tradeMutation.data && (
            <div className="rounded-2xl p-5 animate-[float-up_0.4s_ease]"
              style={{
                background: "hsl(220 20% 7%)",
                border: `2px solid ${GRADE_COLORS[tradeMutation.data.grade] || "hsl(263 100% 70%)"}50`,
              }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="label-caps text-[10px] mb-0.5" style={{ color: "hsl(220 15% 45%)" }}>TRADE GRADE</div>
                  <div className="text-4xl font-black" style={{ color: GRADE_COLORS[tradeMutation.data.grade] || "#fff" }}>
                    {tradeMutation.data.grade}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-4 py-2 rounded-xl font-black text-sm"
                    style={{
                      background: tradeMutation.data.recommendation === "Accept"
                        ? "hsl(80 96% 58% / 0.15)" : tradeMutation.data.recommendation === "Decline"
                        ? "hsl(5 96% 64% / 0.15)" : "hsl(38 100% 65% / 0.15)",
                      color: tradeMutation.data.recommendation === "Accept"
                        ? "hsl(80 96% 58%)" : tradeMutation.data.recommendation === "Decline"
                        ? "hsl(5 96% 64%)" : "hsl(38 100% 65%)",
                    }}>
                    {tradeMutation.data.recommendation === "Accept" ? "✓ Accept" : tradeMutation.data.recommendation === "Decline" ? "✕ Decline" : "↺ Counter"}
                  </span>
                  {tradeMutation.data.winnerBy > 0 && (
                    <div className="text-xs mt-1.5" style={{ color: "hsl(220 15% 50%)" }}>
                      {tradeMutation.data.winnerBy.toFixed(1)} pt edge
                    </div>
                  )}
                </div>
              </div>

              {/* Players */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "hsl(5 96% 64% / 0.1)", border: "1px solid hsl(5 96% 64% / 0.2)" }}>
                  <div className="label-caps text-[9px] mb-0.5" style={{ color: "hsl(5 96% 64% / 0.7)" }}>YOU GIVE</div>
                  <div className="font-bold text-sm text-white">{tradeMutation.data.playerA}</div>
                </div>
                <ChevronRight size={18} style={{ color: "hsl(220 15% 40%)" }} />
                <div className="flex-1 rounded-xl p-3 text-center" style={{ background: "hsl(80 96% 58% / 0.1)", border: "1px solid hsl(80 96% 58% / 0.2)" }}>
                  <div className="label-caps text-[9px] mb-0.5" style={{ color: "hsl(80 96% 58% / 0.7)" }}>YOU GET</div>
                  <div className="font-bold text-sm text-white">{tradeMutation.data.playerB}</div>
                </div>
              </div>

              <div className="rounded-xl p-3" style={{ background: "hsl(220 20% 10%)" }}>
                <div className="label-caps text-[9px] mb-1.5" style={{ color: "hsl(220 15% 40%)" }}>AI ANALYSIS</div>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(220 15% 65%)" }}>
                  {tradeMutation.data.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Quick suggestions */}
          <div>
            <div className="label-caps text-[10px] mb-2" style={{ color: "hsl(220 15% 35%)" }}>TRY THESE TRADES</div>
            <div className="flex flex-wrap gap-2">
              {[
                ["Shohei Ohtani", "Fernando Tatis Jr."],
                ["Aaron Judge", "Julio Rodriguez"],
                ["Blake Snell", "Gerrit Cole"],
              ].map(([a, b]) => (
                <button key={a}
                  onClick={() => { setTradeA(a); setTradeB(b); }}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ background: "hsl(220 20% 9%)", color: "hsl(220 15% 55%)", border: "1px solid hsl(220 20% 16%)" }}>
                  {a.split(" ").pop()} ↔ {b.split(" ").pop()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
