import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import PlayerProfilePanel from "@/components/PlayerProfilePanel";
import { useSlip } from "@/context/SlipContext";
import {
  Copy, Trophy, ChevronDown, ChevronUp,
  Zap, TrendingUp, TrendingDown, Minus,
  Star, Shield, Target, Activity, BarChart2, Swords, UserCircle, PlusCircle, CheckCircle2
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Pick {
  id: number;
  sport: string;
  player: string;
  team: string;
  opponent: string;
  market: string;
  category: string;
  line: number;
  side: string;
  confidence: number;
  ev: number;
  edge: string;
  reasoning: string;
  gameTime: string;
  status: string;
  createdAt: number;
}

// ─── Sport config ─────────────────────────────────────────────────────────────
const SPORT_CONFIG: Record<string, {
  color: string;
  bg: string;
  border: string;
  glow: string;
  categories: { id: string; label: string; icon: React.ReactNode }[];
}> = {
  MLB: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    glow: "hsl(4 90% 60%)",
    categories: [
      { id: "All",      label: "All Props",  icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Batting",  label: "Batting",    icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "Pitching", label: "Pitching",   icon: <Zap className="w-3.5 h-3.5" /> },
    ],
  },
  NBA: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    glow: "hsl(33 100% 55%)",
    categories: [
      { id: "All",        label: "All Props",   icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Scoring",    label: "Scoring",     icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "Playmaking", label: "Playmaking",  icon: <Target className="w-3.5 h-3.5" /> },
      { id: "Rebounding", label: "Rebounding",  icon: <BarChart2 className="w-3.5 h-3.5" /> },
      { id: "Defense",    label: "Defense",     icon: <Shield className="w-3.5 h-3.5" /> },
      { id: "Combo",      label: "Combo",       icon: <Star className="w-3.5 h-3.5" /> },
    ],
  },
  NHL: {
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    glow: "hsl(200 90% 55%)",
    categories: [
      { id: "All",           label: "All Props",     icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Scoring",       label: "Scoring",       icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "Shooting",      label: "Shots on Goal", icon: <Target className="w-3.5 h-3.5" /> },
      { id: "Special Teams", label: "Power Play",    icon: <Zap className="w-3.5 h-3.5" /> },
      { id: "Physical",      label: "Physical",      icon: <Swords className="w-3.5 h-3.5" /> },
      { id: "Defense",       label: "Defense",       icon: <Shield className="w-3.5 h-3.5" /> },
    ],
  },
  Tennis: {
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/25",
    glow: "hsl(85 90% 55%)",
    categories: [
      { id: "All",     label: "All Props",  icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Serving", label: "Serving",    icon: <Zap className="w-3.5 h-3.5" /> },
      { id: "Return",  label: "Return",     icon: <Target className="w-3.5 h-3.5" /> },
      { id: "Match",   label: "Match",      icon: <Trophy className="w-3.5 h-3.5" /> },
    ],
  },
};

const EDGE_LABEL: Record<string, string> = {
  elite: "ELITE", high: "HIGH", mid: "MID", low: "LOW",
};
const EDGE_CLASS: Record<string, string> = {
  elite: "edge-elite", high: "edge-high", mid: "edge-mid", low: "edge-low",
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function EdgePill({ edge }: { edge: string }) {
  return (
    <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${EDGE_CLASS[edge] ?? "edge-low"}`}>
      {EDGE_LABEL[edge] ?? edge.toUpperCase()}
    </span>
  );
}

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === "hot") return <TrendingUp className="w-3 h-3 text-lime-400" />;
  if (trend === "cold") return <TrendingDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

// ─── PropCard ─────────────────────────────────────────────────────────────────
function PropCard({ pick, rank, sport, onViewPlayer }: { pick: Pick; rank: number; sport: string; onViewPlayer: (name: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const { addToSlip, isInSlip } = useSlip();
  const cfg = SPORT_CONFIG[sport];
  const inSlip = isInSlip(pick.id);

  const copyPick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${pick.side} ${pick.line} ${pick.market} — ${pick.player} (${pick.confidence}% conf · +${pick.ev}% EV)\n📊 ${pick.reasoning}`;
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard!" });
  };

  const handleAddToSlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inSlip) return;
    addToSlip({ id: pick.id, player: pick.player, team: pick.team, market: pick.market, line: pick.line, side: pick.side, sport: pick.sport, confidence: pick.confidence, ev: pick.ev });
    toast({ description: `${pick.player} added to your slip!` });
  };

  const isElite = pick.edge === "elite";

  return (
    <div
      data-testid={`prop-card-${pick.id}`}
      className={`rounded-2xl border overflow-hidden transition-all duration-200 card-hover ${
        isElite ? "elite-glow border-violet-500/40" : "border-border bg-card"
      }`}
      style={isElite ? { background: "hsl(222 40% 8%)" } : undefined}
    >
      {/* ── Card header ── */}
      <div className="px-4 pt-4 pb-3">
        {/* Top: rank + player + badge */}
        <div className="flex items-start gap-2.5 mb-3">
          <div className={`rank-badge rank-badge-${Math.min(rank, 4)}`}>{rank}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onViewPlayer(pick.player)}
                data-testid={`view-player-${pick.id}`}
                className="font-bold text-sm text-foreground hover:opacity-70 transition-opacity text-left"
              >
                {pick.player}
              </button>
              <button onClick={() => onViewPlayer(pick.player)} className="text-muted-foreground hover:text-violet-400 transition-colors" title="View profile">
                <UserCircle className="w-3.5 h-3.5" />
              </button>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border badge-${pick.sport}`}>
                {pick.team}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              vs {pick.opponent} · {pick.gameTime}
            </div>
          </div>
          <EdgePill edge={pick.edge} />
        </div>

        {/* ── Stat line ── */}
        <div className="rounded-xl px-3 py-2.5 mb-3 flex items-center gap-3"
          style={{ background: "hsl(222 35% 11%)", border: "1px solid hsl(222 30% 16%)" }}>
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground mb-0.5">{pick.market}</div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black ${pick.side === "Over" ? "side-over" : "side-under"}`}>
                {pick.side} {pick.line}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground mb-0.5">Category</div>
            <div className={`text-xs font-semibold ${cfg.color}`}>{pick.category}</div>
          </div>
        </div>

        {/* ── Confidence + EV ── */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Confidence</span>
              <span className="text-xs font-bold" style={{ color: "hsl(258 90% 75%)" }}>{pick.confidence}%</span>
            </div>
            <div className="conf-bar">
              <div className="conf-fill" style={{
                width: `${pick.confidence}%`,
                background: "linear-gradient(90deg, hsl(258 90% 55%), hsl(258 90% 75%))"
              }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Exp. Value</span>
              <span className="text-xs font-bold text-lime-400">+{pick.ev}%</span>
            </div>
            <div className="conf-bar">
              <div className="conf-fill" style={{
                width: `${Math.min(100, pick.ev * 5)}%`,
                background: "linear-gradient(90deg, hsl(85 90% 45%), hsl(85 90% 60%))"
              }} />
            </div>
          </div>
        </div>

        {/* ── Action row ── */}
        <div className="flex gap-2">
          <button
            data-testid={`expand-${pick.id}`}
            onClick={() => setExpanded(e => !e)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: "hsl(222 35% 11%)", border: "1px solid hsl(222 30% 16%)" }}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide Reasoning" : "AI Reasoning"}
          </button>
          <button
            data-testid={`copy-${pick.id}`}
            onClick={copyPick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            style={{
              background: "hsl(258 90% 66% / 0.12)",
              border: "1px solid hsl(258 90% 66% / 0.3)",
              color: "hsl(258 90% 80%)"
            }}
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
          <button
            data-testid={`slip-${pick.id}`}
            onClick={handleAddToSlip}
            disabled={inSlip}
            title={inSlip ? "Already in slip" : "Add to My Slip"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
            style={inSlip ? {
              background: "hsl(85 90% 55% / 0.12)",
              border: "1px solid hsl(85 90% 55% / 0.3)",
              color: "hsl(85 90% 65%)"
            } : {
              background: "hsl(85 90% 55% / 0.08)",
              border: "1px solid hsl(85 90% 55% / 0.2)",
              color: "hsl(85 90% 55%)"
            }}
          >
            {inSlip
              ? <><CheckCircle2 className="w-3 h-3" /> In Slip</>
              : <><PlusCircle className="w-3 h-3" /> + Slip</>
            }
          </button>
        </div>
      </div>

      {/* ── Expanded reasoning ── */}
      {expanded && (
        <div className="px-4 py-3 border-t"
          style={{ borderColor: "hsl(222 30% 14%)", background: "hsl(222 40% 6%)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3" style={{ color: "hsl(258 90% 75%)" }} />
            <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: "hsl(258 90% 75%)" }}>
              AI Model Reasoning
            </span>
          </div>
          <p className="text-xs text-foreground leading-relaxed opacity-90">{pick.reasoning}</p>
          <div className="mt-2.5 pt-2.5 flex items-center gap-3 border-t text-[9px] text-muted-foreground"
            style={{ borderColor: "hsl(222 30% 14%)" }}>
            <span>Conf: <strong className="text-foreground">{pick.confidence}%</strong></span>
            <span>EV: <strong className="text-lime-400">+{pick.ev}%</strong></span>
            <span>Edge: <strong className={EDGE_CLASS[pick.edge] ? "" : "text-foreground"}>{pick.edge}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top6 Row ─────────────────────────────────────────────────────────────────
function Top6Row({ pick, rank }: { pick: Pick; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const { addToSlip, isInSlip } = useSlip();
  const inSlip = isInSlip(pick.id);

  const copy = () => {
    navigator.clipboard.writeText(
      `${rank}. ${pick.player} — ${pick.side} ${pick.line} ${pick.market} | ${pick.confidence}% · +${pick.ev}% EV\n${pick.reasoning}`
    );
    toast({ description: "Pick copied with reasoning!" });
  };

  const handleAddToSlip = () => {
    if (inSlip) return;
    addToSlip({ id: pick.id, player: pick.player, team: pick.team, market: pick.market, line: pick.line, side: pick.side, sport: pick.sport, confidence: pick.confidence, ev: pick.ev });
    toast({ description: `${pick.player} added to your slip!` });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {/* Summary row */}
      <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-secondary/30 transition-colors">
        <div className={`rank-badge rank-badge-${Math.min(rank, 4)} text-[9px]`}>{rank}</div>
        <span className="font-semibold text-sm text-foreground flex-1 truncate">{pick.player}</span>
        <span className={`text-sm font-black shrink-0 ${pick.side === "Over" ? "side-over" : "side-under"}`}>
          {pick.side} {pick.line}
        </span>
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block w-28 truncate text-right">{pick.market}</span>
        <span className="text-[11px] font-bold text-lime-400 shrink-0">+{pick.ev}%</span>
        <EdgePill edge={pick.edge} />
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={handleAddToSlip}
            data-testid={`top6-slip-${pick.id}`}
            disabled={inSlip}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            style={{ color: inSlip ? "hsl(85 90% 55%)" : undefined }}
            title={inSlip ? "Already in slip" : "Add to My Slip"}
          >
            {inSlip ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={copy}
            data-testid={`top6-copy-${pick.id}`}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title="Copy pick"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            data-testid={`top6-expand-${pick.id}`}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title={expanded ? "Hide reasoning" : "Show reasoning"}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Reasoning */}
      {expanded && (
        <div className="px-3 py-2.5 border-t border-border" style={{ background: "hsl(222 40% 6%)" }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3 h-3" style={{ color: "hsl(258 90% 75%)" }} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "hsl(258 90% 75%)" }}>AI Reasoning</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">{pick.reasoning}</p>
          <div className="mt-2 text-[9px] text-muted-foreground">
            {pick.team} vs {pick.opponent} · {pick.gameTime} · <strong className="text-foreground">{pick.confidence}% confidence</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main SportPage ────────────────────────────────────────────────────────────
export default function SportPage({ sport }: { sport: string }) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const cfg = SPORT_CONFIG[sport] ?? SPORT_CONFIG.MLB;

  const { data: picks = [], isLoading } = useQuery<Pick[]>({
    queryKey: ["/api/picks", sport],
    queryFn: () => apiRequest("GET", `/api/picks?sport=${sport}&limit=80`).then(r => r.json()),
    refetchInterval: 45000,
  });

  // Filter + sort
  const filtered = useMemo(() => {
    const base = activeCategory === "All"
      ? [...picks]
      : picks.filter(p => (p.category ?? "").toLowerCase() === activeCategory.toLowerCase());
    return base.sort((a, b) => b.confidence - a.confidence);
  }, [picks, activeCategory]);

  // Top 6 best pending across all categories
  const top6 = useMemo(() =>
    picks
      .filter(p => p.status === "pending")
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6),
    [picks]
  );

  const copyAll = () => {
    if (!top6.length) return;
    const lines = top6.map((p, i) =>
      `${i + 1}. ${p.player} | ${p.side} ${p.line} ${p.market}\n   ${p.confidence}% conf · +${p.ev}% EV\n   ${p.reasoning}`
    ).join("\n\n");
    navigator.clipboard.writeText(`PropEdge Top 6 ${sport} Props\n${"─".repeat(40)}\n\n${lines}\n\nPropEdge AI`);
    toast({ title: `Top 6 ${sport} Copied!`, description: "Includes full AI reasoning." });
  };

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className={`w-2.5 h-2.5 rounded-full ${
              sport === "MLB" ? "bg-red-500" :
              sport === "NBA" ? "bg-orange-400" :
              sport === "NHL" ? "bg-sky-400" : "bg-lime-400"
            }`} />
            <h1 className={`text-xl font-black ${cfg.color}`} style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              {sport} Player Props
            </h1>
          </div>
          <p className="text-xs text-muted-foreground pl-5">
            AI-generated projections · refreshes every 45s
          </p>
        </div>
        <button
          onClick={copyAll}
          data-testid="copy-top6-all"
          disabled={top6.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, hsl(258 90% 60%), hsl(220 90% 60%))" }}
        >
          <Copy className="w-4 h-4" />
          Copy Top 6
        </button>
      </div>

      {/* ── Top 6 Panel ── */}
      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl mb-5" />
      ) : top6.length > 0 ? (
        <div className="rounded-2xl border mb-5 overflow-hidden"
          style={{
            background: "hsl(222 40% 7%)",
            borderColor: "hsl(258 90% 66% / 0.2)",
            boxShadow: "0 0 30px hsl(258 90% 66% / 0.05)"
          }}>
          {/* Panel header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b"
            style={{ borderColor: "hsl(222 30% 14%)", background: "hsl(258 90% 66% / 0.05)" }}>
            <Trophy className="w-4 h-4" style={{ color: "hsl(258 90% 75%)" }} />
            <span className="font-bold text-sm text-foreground">Top 6 {sport} Props</span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full ml-1"
              style={{ background: "hsl(258 90% 66% / 0.12)", color: "hsl(258 90% 80%)", border: "1px solid hsl(258 90% 66% / 0.2)" }}>
              highest confidence
            </span>
            <span className="ml-auto text-[9px] text-muted-foreground hidden sm:block">
              tap ↓ to see full AI reasoning
            </span>
          </div>

          {/* Rows */}
          <div className="p-3 space-y-2">
            {top6.map((pick, i) => (
              <Top6Row key={pick.id} pick={pick} rank={i + 1} />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Category tabs ── */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {cfg.categories.map(cat => {
          const active = activeCategory === cat.id;
          const count = cat.id === "All"
            ? picks.length
            : picks.filter(p => (p.category ?? "").toLowerCase() === cat.id.toLowerCase()).length;

          return (
            <button
              key={cat.id}
              data-testid={`category-tab-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-secondary/50"
              }`}
            >
              <span className={active ? cfg.color : "opacity-60"}>{cat.icon}</span>
              {cat.label}
              <span className={`text-[9px] ml-0.5 px-1 rounded-full ${
                active ? `${cfg.bg} ${cfg.color}` : "bg-secondary text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3 h-3" />
          <span>{filtered.length} props</span>
        </div>
      </div>

      {/* ── Props grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "hsl(222 35% 11%)", border: "1px solid hsl(222 30% 16%)" }}>
            <Activity className="w-6 h-6 text-muted-foreground opacity-40" />
          </div>
          <p className="text-sm text-muted-foreground">No {activeCategory} props yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">AI is generating more picks…</p>
          {activeCategory !== "All" && (
            <button
              onClick={() => setActiveCategory("All")}
              className={`mt-4 text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${cfg.bg} ${cfg.color} ${cfg.border} border`}
            >
              Show all {sport} props
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((pick, i) => (
            <PropCard key={pick.id} pick={pick} rank={i + 1} sport={sport} onViewPlayer={setSelectedPlayer} />
          ))}
        </div>
      )}

      {/* Player profile modal */}
      {selectedPlayer && (
        <PlayerProfilePanel
          playerName={selectedPlayer}
          sport={sport}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
