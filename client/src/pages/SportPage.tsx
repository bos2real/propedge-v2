import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy, Trophy, ChevronDown, ChevronUp, TrendingUp, Zap,
  Target, Shield, Star, Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pick {
  id: number; sport: string; player: string; team: string; opponent: string;
  market: string; category: string; line: number; side: string;
  confidence: number; ev: number; edge: string; reasoning: string;
  gameTime: string; status: string; createdAt: number;
}

// Sport-specific category configs
const SPORT_CATEGORIES: Record<string, { label: string; icon: React.ReactNode; color: string }[]> = {
  MLB: [
    { label: "All",       icon: <Activity className="w-3 h-3" />, color: "text-foreground" },
    { label: "Batting",   icon: <TrendingUp className="w-3 h-3" />, color: "text-red-400" },
    { label: "Pitching",  icon: <Zap className="w-3 h-3" />, color: "text-orange-400" },
  ],
  NBA: [
    { label: "All",        icon: <Activity className="w-3 h-3" />, color: "text-foreground" },
    { label: "Scoring",    icon: <TrendingUp className="w-3 h-3" />, color: "text-orange-400" },
    { label: "Playmaking", icon: <Target className="w-3 h-3" />, color: "text-cyan-400" },
    { label: "Rebounding", icon: <Shield className="w-3 h-3" />, color: "text-green-400" },
    { label: "Defense",    icon: <Shield className="w-3 h-3" />, color: "text-blue-400" },
    { label: "Combo",      icon: <Star className="w-3 h-3" />, color: "text-amber-400" },
  ],
  NHL: [
    { label: "All",           icon: <Activity className="w-3 h-3" />, color: "text-foreground" },
    { label: "Scoring",       icon: <TrendingUp className="w-3 h-3" />, color: "text-blue-400" },
    { label: "Shooting",      icon: <Target className="w-3 h-3" />, color: "text-cyan-400" },
    { label: "Special Teams", icon: <Zap className="w-3 h-3" />, color: "text-amber-400" },
    { label: "Physical",      icon: <Shield className="w-3 h-3" />, color: "text-red-400" },
    { label: "Defense",       icon: <Shield className="w-3 h-3" />, color: "text-green-400" },
  ],
  Tennis: [
    { label: "All",     icon: <Activity className="w-3 h-3" />, color: "text-foreground" },
    { label: "Serving", icon: <Zap className="w-3 h-3" />, color: "text-green-400" },
    { label: "Return",  icon: <Target className="w-3 h-3" />, color: "text-cyan-400" },
    { label: "Match",   icon: <Trophy className="w-3 h-3" />, color: "text-amber-400" },
  ],
};

const SPORT_HEADER_COLOR: Record<string, string> = {
  MLB: "text-red-400", NBA: "text-orange-400", NHL: "text-blue-400", Tennis: "text-green-400",
};
const SPORT_ACCENT_BG: Record<string, string> = {
  MLB: "bg-red-400/10 border-red-400/30 text-red-400",
  NBA: "bg-orange-400/10 border-orange-400/30 text-orange-400",
  NHL: "bg-blue-400/10 border-blue-400/30 text-blue-400",
  Tennis: "bg-green-400/10 border-green-400/30 text-green-400",
};

const EDGE_LABEL: Record<string, string> = {
  elite: "ELITE EDGE", high: "HIGH EDGE", mid: "MID EDGE", low: "LOW EDGE",
};
const EDGE_CLASS: Record<string, string> = {
  elite: "edge-elite", high: "edge-high", mid: "edge-mid", low: "edge-low",
};

function EdgePill({ edge }: { edge: string }) {
  return (
    <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border ${EDGE_CLASS[edge] ?? "edge-low"}`}>
      {EDGE_LABEL[edge] ?? edge.toUpperCase()}
    </span>
  );
}

function PickDetailCard({ pick, rank }: { pick: Pick; rank?: number }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const copyPick = () => {
    const text = `${pick.side} ${pick.line} ${pick.market} — ${pick.player} (${pick.confidence}% / +${pick.ev}% EV)\n${pick.reasoning}`;
    navigator.clipboard.writeText(text);
    toast({ description: "Pick copied to clipboard!" });
  };

  return (
    <div
      data-testid={`pick-card-${pick.id}`}
      className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${
        pick.edge === "elite" ? "border-amber-400/40 elite-glow" : "border-border"
      } card-hover`}
    >
      {/* Main row — always visible */}
      <div className="p-4">
        {/* Top row: rank + player + edge pill */}
        <div className="flex items-start gap-2 mb-2">
          {rank !== undefined && (
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {rank}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-foreground">{pick.player}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${SPORT_ACCENT_BG[pick.sport]}`}>
                {pick.team}
              </span>
              <EdgePill edge={pick.edge} />
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {pick.team} vs {pick.opponent} · {pick.gameTime}
            </div>
          </div>
        </div>

        {/* Stat line */}
        <div className="flex items-center gap-3 my-2">
          <div className={`text-lg font-black ${pick.side === "Over" ? "side-over" : "side-under"}`}>
            {pick.side} {pick.line}
          </div>
          <div className="text-sm text-muted-foreground font-medium">{pick.market}</div>
          <div className="text-xs text-muted-foreground">·</div>
          <div className="text-xs text-muted-foreground italic">{pick.category}</div>
        </div>

        {/* Confidence + EV bar */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Confidence</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${pick.confidence}%` }}
                />
              </div>
              <span className="text-xs font-bold text-amber-400">{pick.confidence}%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Expected Value</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: `${Math.min(100, pick.ev * 4)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-green-400">+{pick.ev}%</span>
            </div>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2">
          <button
            data-testid={`expand-pick-${pick.id}`}
            onClick={() => setExpanded(e => !e)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg py-1.5 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide AI Reasoning" : "View AI Reasoning"}
          </button>
          <button
            data-testid={`copy-pick-${pick.id}`}
            onClick={copyPick}
            className="flex items-center gap-1.5 text-xs bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-lg px-3 py-1.5 transition-colors font-semibold"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
      </div>

      {/* Expanded reasoning panel */}
      {expanded && (
        <div className="border-t border-border bg-secondary/20 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">AI Reasoning</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{pick.reasoning}</p>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span>Model confidence: <strong className="text-foreground">{pick.confidence}%</strong></span>
            <span>EV edge: <strong className="text-green-400">+{pick.ev}%</strong></span>
            <span className="ml-auto">{pick.side === "Over" ? "📈" : "📉"} {pick.side}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SportPage({ sport }: { sport: string }) {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: picks = [], isLoading } = useQuery<Pick[]>({
    queryKey: ["/api/picks", sport],
    queryFn: () => apiRequest("GET", `/api/picks?sport=${sport}&limit=80`).then(r => r.json()),
    refetchInterval: 45000,
  });

  const categories = SPORT_CATEGORIES[sport] ?? [{ label: "All", icon: <Activity className="w-3 h-3" />, color: "text-foreground" }];

  // Category filter
  const filtered = activeCategory === "All"
    ? [...picks]
    : picks.filter(p => p.category === activeCategory);

  // Sort by confidence desc
  filtered.sort((a, b) => b.confidence - a.confidence);

  // Top 6 pending picks by confidence (always across all categories)
  const top6 = picks
    .filter(p => p.status === "pending")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);

  const copyAll6 = () => {
    if (top6.length === 0) return;
    const lines = top6.map((p, i) =>
      `${i + 1}. ${p.player} — ${p.side} ${p.line} ${p.market} (${p.confidence}% conf / +${p.ev}% EV)\n   Reasoning: ${p.reasoning}`
    ).join("\n\n");
    navigator.clipboard.writeText(`PropEdge Top 6 ${sport} Picks\n${"─".repeat(44)}\n\n${lines}\n\nGenerated by PropEdge AI`);
    toast({ title: "Top 6 Copied!", description: `Full ${sport} picks with reasoning copied.` });
  };

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className={`text-xl font-bold ${SPORT_HEADER_COLOR[sport]}`}>{sport} Player Props</h1>
          <p className="text-sm text-muted-foreground">AI-generated · auto-updating every 45s</p>
        </div>
        <button
          onClick={copyAll6}
          data-testid="copy-top-6"
          className="flex items-center gap-2 bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-300 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy Top 6
        </button>
      </div>

      {/* ── Top 6 Panel ────────────────────────────────────────────── */}
      {isLoading ? (
        <Skeleton className="h-44 rounded-xl mb-5" />
      ) : top6.length > 0 ? (
        <div className="bg-card border border-amber-400/20 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-foreground">Top 6 {sport} Props</span>
            <span className="text-[10px] text-muted-foreground ml-2 bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-400/20">
              tap row to copy · includes full reasoning
            </span>
          </div>
          <div className="space-y-1.5">
            {top6.map((pick, i) => (
              <Top6Row key={pick.id} pick={pick} rank={i + 1} />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── Category Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.label}
            data-testid={`tab-${cat.label}`}
            onClick={() => setActiveCategory(cat.label)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              activeCategory === cat.label
                ? "bg-amber-400/20 text-amber-400 border-amber-400/40"
                : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            }`}
          >
            <span className={activeCategory === cat.label ? "text-amber-400" : cat.color}>
              {cat.icon}
            </span>
            {cat.label}
            {cat.label !== "All" && (
              <span className="ml-1 text-[9px] opacity-60">
                {picks.filter(p => p.category === cat.label).length}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} pick{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Picks Grid ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No {activeCategory} picks yet — AI is generating more…</p>
          <button
            onClick={() => setActiveCategory("All")}
            className="mt-3 text-xs text-amber-400 hover:underline"
          >
            Show all {sport} picks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((pick, i) => (
            <PickDetailCard key={pick.id} pick={pick} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Top 6 expandable row ─────────────────────────────────────────────────────
function Top6Row({ pick, rank }: { pick: Pick; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const copyRow = () => {
    const text = `${pick.side} ${pick.line} ${pick.market} — ${pick.player} (${pick.confidence}% / +${pick.ev}% EV)\n${pick.reasoning}`;
    navigator.clipboard.writeText(text);
    toast({ description: "Pick + reasoning copied!" });
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Summary row */}
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/40 transition-colors">
        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[9px] font-bold flex items-center justify-center shrink-0">
          {rank}
        </span>
        <span className="text-sm font-semibold text-foreground truncate flex-1">{pick.player}</span>
        <span className={`text-sm font-black shrink-0 ${pick.side === "Over" ? "side-over" : "side-under"}`}>
          {pick.side} {pick.line}
        </span>
        <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline w-24 truncate">{pick.market}</span>
        <span className="text-[10px] font-bold text-green-400 shrink-0">+{pick.ev}%</span>
        <EdgePill edge={pick.edge} />
        <button
          onClick={copyRow}
          data-testid={`top6-copy-${pick.id}`}
          className="p-1 rounded text-muted-foreground hover:text-amber-400 transition-colors"
          title="Copy pick"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={() => setExpanded(e => !e)}
          data-testid={`top6-expand-${pick.id}`}
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          title="View reasoning"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded reasoning */}
      {expanded && (
        <div className="border-t border-border bg-secondary/20 px-3 py-2.5">
          <div className="flex items-center gap-1 mb-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-bold text-amber-400 tracking-widest">AI REASONING</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">{pick.reasoning}</p>
          <div className="mt-2 flex items-center gap-3 text-[9px] text-muted-foreground">
            <span>{pick.team} vs {pick.opponent}</span>
            <span>·</span>
            <span>{pick.gameTime}</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">{pick.confidence}% confidence</span>
          </div>
        </div>
      )}
    </div>
  );
}
