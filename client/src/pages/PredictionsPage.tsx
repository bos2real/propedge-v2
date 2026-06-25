import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSlip } from "@/context/SlipContext";
import { useToast } from "@/hooks/use-toast";
import {
  Brain, Copy, Check, Plus, RefreshCw, Zap, Target, TrendingUp,
  ChevronDown, ChevronUp, Filter, Flame, BarChart2, ExternalLink,
  ArrowUpRight, Star, Shield, Clock, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Format pick for each platform
// ─────────────────────────────────────────────
function formatPrizePicks(picks: Pick[]): string {
  const lines = picks.map(p =>
    `${p.player} ${p.side} ${p.line} ${p.market}`
  );
  return lines.join("\n");
}

function formatUnderdog(picks: Pick[]): string {
  const lines = picks.map(p =>
    `${p.player} ${p.side === "Over" ? "Higher" : "Lower"} ${p.line} ${p.market} (${p.team})`
  );
  return lines.join("\n");
}

function formatFanDuel(picks: Pick[]): string {
  const lines = picks.map(p =>
    `${p.player} ${p.side} ${p.line} ${p.market} - ${p.sport}`
  );
  return lines.join("\n");
}

function formatDraftKings(picks: Pick[]): string {
  const lines = picks.map(p =>
    `${p.player} | ${p.market} ${p.side} ${p.line} | ${p.team} vs ${p.opponent || "TBD"}`
  );
  return lines.join("\n");
}

const PLATFORMS = [
  {
    id: "prizepicks",
    label: "PrizePicks",
    emoji: "🎯",
    color: "hsl(260 95% 68%)",
    bg: "hsl(260 95% 68% / 0.12)",
    border: "hsl(260 95% 68% / 0.28)",
    url: "https://app.prizepicks.com",
    format: formatPrizePicks,
  },
  {
    id: "underdog",
    label: "Underdog",
    emoji: "🐶",
    color: "hsl(32 100% 60%)",
    bg: "hsl(32 100% 56% / 0.12)",
    border: "hsl(32 100% 56% / 0.28)",
    url: "https://underdogfantasy.com",
    format: formatUnderdog,
  },
  {
    id: "fanduel",
    label: "FanDuel",
    emoji: "🏈",
    color: "hsl(193 88% 60%)",
    bg: "hsl(193 88% 57% / 0.12)",
    border: "hsl(193 88% 57% / 0.28)",
    url: "https://sportsbook.fanduel.com",
    format: formatFanDuel,
  },
  {
    id: "draftkings",
    label: "DraftKings",
    emoji: "👑",
    color: "hsl(82 92% 56%)",
    bg: "hsl(82 92% 56% / 0.12)",
    border: "hsl(82 92% 56% / 0.28)",
    url: "https://sportsbook.draftkings.com",
    format: formatDraftKings,
  },
];

const SPORT_HSL: Record<string, string> = {
  MLB: "4 92% 62%",
  NBA: "32 100% 56%",
  NHL: "198 92% 58%",
  Tennis: "82 92% 56%",
};

const SPORT_EMOJI: Record<string, string> = {
  MLB: "⚾", NBA: "🏀", NHL: "🏒", Tennis: "🎾",
};

// ─────────────────────────────────────────────
// Edge config
// ─────────────────────────────────────────────
const EDGE_META: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  elite: {
    label: "ELITE",
    color: "hsl(260 95% 82%)",
    bg: "hsl(260 95% 68% / 0.15)",
    border: "hsl(260 95% 68% / 0.4)",
    glow: "0 0 28px hsl(260 95% 68% / 0.2)",
  },
  high: {
    label: "HIGH",
    color: "hsl(82 92% 62%)",
    bg: "hsl(82 92% 56% / 0.13)",
    border: "hsl(82 92% 56% / 0.35)",
    glow: "0 0 20px hsl(82 92% 56% / 0.14)",
  },
  mid: {
    label: "MID",
    color: "hsl(193 88% 67%)",
    bg: "hsl(193 88% 57% / 0.12)",
    border: "hsl(193 88% 57% / 0.3)",
    glow: "none",
  },
  low: {
    label: "LOW",
    color: "hsl(220 12% 54%)",
    bg: "hsl(220 20% 14%)",
    border: "hsl(220 20% 22%)",
    glow: "none",
  },
};

// ─────────────────────────────────────────────
// Single prediction card
// ─────────────────────────────────────────────
function PredictionCard({ pick, selected, onToggle }: {
  pick: Pick;
  selected: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { addToSlip } = useSlip();
  const { toast } = useToast();
  const edge = EDGE_META[pick.edge] ?? EDGE_META.low;
  const sportHsl = SPORT_HSL[pick.sport];

  const singleLine = `${pick.player} ${pick.side} ${pick.line} ${pick.market}`;

  const handleCopySingle = async () => {
    try { await navigator.clipboard.writeText(singleLine); } catch {}
    setCopied(true);
    toast({ title: "Copied!", description: singleLine });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSlip = () => {
    addToSlip({
      id: `pred-${pick.id}`,
      player: pick.player,
      team: pick.team,
      market: pick.market,
      line: pick.line,
      side: pick.side as "Over" | "Under",
      sport: pick.sport as any,
      confidence: pick.confidence,
      ev: pick.ev,
    });
    toast({ title: "Added to slip!", description: pick.player });
  };

  return (
    <div
      data-testid={`pred-card-${pick.id}`}
      onClick={onToggle}
      className="rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden ai-card"
      style={{
        background: selected
          ? `hsl(260 95% 68% / 0.1)`
          : "hsl(220 38% 7%)",
        borderColor: selected ? "hsl(260 95% 68% / 0.55)" : edge.border,
        boxShadow: selected
          ? "0 0 28px hsl(260 95% 68% / 0.18), 0 0 0 1px hsl(260 95% 68% / 0.15)"
          : edge.glow,
      }}
    >
      {/* Selected checkmark overlay */}
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: "hsl(260 95% 68%)", boxShadow: "0 0 12px hsl(260 95% 68% / 0.5)" }}>
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Top edge bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {/* Sport badge */}
          <span className="text-sm">{SPORT_EMOJI[pick.sport] ?? "🏆"}</span>
          <span className="text-[10px] font-bold px-2 py-px rounded-full"
            style={{ background: `hsl(${sportHsl} / 0.13)`, color: `hsl(${sportHsl})`, border: `1px solid hsl(${sportHsl} / 0.28)` }}>
            {pick.sport}
          </span>
          <span className="text-[10px] font-bold px-2 py-px rounded-full"
            style={{ background: edge.bg, color: edge.color, border: `1px solid ${edge.border}` }}>
            {edge.label} EDGE
          </span>
        </div>
        <div className="flex items-center gap-2 mr-8">
          <span className="text-[11px] font-black" style={{ color: "hsl(82 92% 62%)" }}>+{pick.ev}% EV</span>
          <span className="text-[10px] text-muted-foreground">{pick.confidence}% conf</span>
        </div>
      </div>

      {/* Main pick display */}
      <div className="px-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-base font-black text-foreground tracking-tight truncate">{pick.player}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">{pick.team}</span>
              {pick.opponent && (
                <>
                  <span className="text-muted-foreground/40">vs</span>
                  <span className="text-xs text-muted-foreground">{pick.opponent}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-2 justify-end">
              <span className={`text-xl font-black ${pick.side === "Over" ? "side-over" : "side-under"}`}>
                {pick.side}
              </span>
              <span className="text-xl font-black text-foreground">{pick.line}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{pick.market}</div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-3">
          <div className="conf-bar">
            <div className="conf-fill" style={{
              width: `${pick.confidence}%`,
              background: `linear-gradient(90deg, ${edge.bg.replace("/ 0", "/ 0.8")}, ${edge.color})`,
            }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{pick.confidence}% confidence</span>
            <span className="text-[10px] font-bold trend-up">+{pick.ev}% EV</span>
          </div>
        </div>

        {/* Reasoning toggle */}
        {pick.reasoning && (
          <div className="mt-2.5">
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }}
              className="flex items-center gap-1.5 text-[11px] font-medium transition-colors group"
              style={{ color: "hsl(260 95% 72%)" }}
            >
              <Brain className="w-3 h-3" />
              AI Reasoning
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {expanded && (
              <div className="mt-2 p-3 rounded-xl text-[11px] text-muted-foreground leading-relaxed"
                style={{ background: "hsl(220 38% 5%)", border: "1px solid hsl(220 28% 14%)" }}>
                {pick.reasoning}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t"
        style={{ borderColor: "hsl(220 28% 11%)" }}
        onClick={e => e.stopPropagation()}>
        <div className="text-[10px] text-muted-foreground font-mono">{singleLine}</div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleAddSlip} data-testid={`pred-slip-${pick.id}`}>
            <Plus className="w-3 h-3" /> Slip
          </Button>
          <Button size="sm" className="h-6 px-2.5 text-[10px] gap-1 font-bold"
            style={{
              background: copied ? "hsl(82 92% 56% / 0.15)" : "hsl(260 95% 68% / 0.14)",
              color: copied ? "hsl(82 92% 62%)" : "hsl(260 95% 78%)",
              border: `1px solid ${copied ? "hsl(82 92% 56% / 0.35)" : "hsl(260 95% 68% / 0.3)"}`,
            }}
            onClick={handleCopySingle} data-testid={`pred-copy-${pick.id}`}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Bulk copy panel (sticky bottom)
// ─────────────────────────────────────────────
function BulkCopyPanel({ picks, onClear }: { picks: Pick[]; onClear: () => void }) {
  const [platform, setPlatform] = useState("prizepicks");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const plat = PLATFORMS.find(p => p.id === platform) ?? PLATFORMS[0];
  const formatted = plat.format(picks);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(formatted); } catch {}
    setCopied(true);
    toast({ title: `Copied for ${plat.label}!`, description: `${picks.length} picks formatted and copied` });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenApp = async () => {
    try { await navigator.clipboard.writeText(formatted); } catch {}
    window.open(plat.url, "_blank");
    toast({ title: "Picks copied!", description: `Opening ${plat.label}… paste your picks` });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(680px,calc(100vw-3rem))]"
      style={{ filter: "drop-shadow(0 8px 40px hsl(260 95% 68% / 0.3))" }}>
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: "hsl(220 38% 6% / 0.96)", borderColor: "hsl(260 95% 68% / 0.4)", backdropFilter: "blur(20px)" }}>
        {/* Header strip */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b"
          style={{ background: "hsl(260 95% 68% / 0.1)", borderColor: "hsl(260 95% 68% / 0.2)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "hsl(260 95% 78%)" }} />
            <span className="text-sm font-bold" style={{ color: "hsl(260 95% 82%)" }}>
              {picks.length} Pick{picks.length !== 1 ? "s" : ""} Selected
            </span>
          </div>
          <button onClick={onClear} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-lg hover:bg-secondary">
            Clear selection
          </button>
        </div>

        <div className="p-4">
          {/* Platform selector */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                data-testid={`plat-${p.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={platform === p.id
                  ? { background: p.bg, color: p.color, border: `1px solid ${p.border}`, boxShadow: `0 0 12px ${p.border}` }
                  : { background: "hsl(220 28% 10%)", color: "hsl(220 12% 54%)", border: "1px solid hsl(220 28% 16%)" }
                }
              >
                <span>{p.emoji}</span> {p.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="rounded-xl p-3 mb-3 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-32"
            style={{ background: "hsl(220 38% 4%)", border: "1px solid hsl(220 28% 12%)", color: "hsl(82 92% 62%)" }}>
            <pre className="whitespace-pre-wrap break-words">{formatted || "Select picks above…"}</pre>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 h-9 text-sm font-bold btn-gradient rounded-xl gap-2"
              onClick={handleCopy} disabled={picks.length === 0} data-testid="bulk-copy-btn">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : `Copy for ${plat.label}`}
            </Button>
            <Button className="h-9 px-4 text-sm font-bold rounded-xl gap-1.5"
              style={{ background: "hsl(220 28% 11%)", border: "1px solid hsl(220 28% 18%)", color: "hsl(210 20% 75%)" }}
              onClick={handleOpenApp} disabled={picks.length === 0} data-testid="bulk-open-btn">
              Open App <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
const SPORTS_FILTER = ["All", "MLB", "NBA", "NHL", "Tennis"] as const;
const EDGE_FILTER = ["All", "Elite", "High", "Mid"] as const;

export default function PredictionsPage() {
  const [sportFilter, setSportFilter] = useState<string>("All");
  const [edgeFilter, setEdgeFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [countdown, setCountdown] = useState(15);

  const { data: picks = [], isLoading, refetch } = useQuery<Pick[]>({
    queryKey: ["/api/picks"],
    queryFn: () => apiRequest("GET", "/api/picks?limit=50").then(r => r.json()),
    refetchInterval: 15000,
  });

  // Countdown timer
  useEffect(() => {
    const iv = setInterval(() => setCountdown(c => c <= 1 ? 15 : c - 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Re-sync countdown on refetch
  useEffect(() => { setCountdown(15); }, [picks]);

  const filtered = picks.filter(p => {
    const sportOk = sportFilter === "All" || p.sport === sportFilter;
    const edgeOk  = edgeFilter  === "All" || p.edge.toLowerCase() === edgeFilter.toLowerCase();
    return sportOk && edgeOk;
  });

  const selectedPicks = picks.filter(p => selectedIds.has(p.id));

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)));
    }
  };

  const eliteCount  = filtered.filter(p => p.edge === "elite").length;
  const highCount   = filtered.filter(p => p.edge === "high").length;
  const avgEv       = filtered.length
    ? Math.round(filtered.reduce((s, p) => s + p.ev, 0) / filtered.length * 10) / 10
    : 0;
  const avgConf     = filtered.length
    ? Math.round(filtered.reduce((s, p) => s + p.confidence, 0) / filtered.length)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: "hsl(220 45% 4%)" }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden px-6 pt-8 pb-5"
        style={{ background: "linear-gradient(135deg, hsl(260 95% 68% / 0.1) 0%, hsl(82 92% 56% / 0.04) 60%, transparent 100%)" }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(260 95% 68% / 0.1) 0%, transparent 70%)" }} />

        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(260 95% 68% / 0.2)", border: "1px solid hsl(260 95% 68% / 0.3)" }}>
                  <Brain className="w-4 h-4" style={{ color: "hsl(260 95% 78%)" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: "hsl(260 95% 78%)" }}>PEMF Algorithm · 5-Factor Model</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1">
                <span className="gradient-text">AI Predictions</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Select picks to copy · one-click export to PrizePicks, Underdog, FanDuel & DraftKings
              </p>
            </div>

            {/* Refresh counter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "hsl(82 92% 56% / 0.1)", border: "1px solid hsl(82 92% 56% / 0.2)" }}>
                <RefreshCw className={`w-3.5 h-3.5 ${countdown < 5 ? "animate-spin" : ""}`} style={{ color: "hsl(82 92% 62%)" }} />
                <span className="text-xs font-mono font-bold" style={{ color: "hsl(82 92% 62%)" }}>
                  {countdown}s
                </span>
              </div>
            </div>
          </div>

          {/* Mini stats row */}
          {!isLoading && (
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="w-3.5 h-3.5" style={{ color: "hsl(260 95% 78%)" }} />
                <span className="font-black" style={{ color: "hsl(260 95% 82%)" }}>{eliteCount}</span>
                <span className="text-muted-foreground text-xs">elite picks</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <Zap className="w-3.5 h-3.5 text-lime-400" />
                <span className="font-black text-lime-400">{highCount}</span>
                <span className="text-muted-foreground text-xs">high edge</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: "hsl(193 88% 67%)" }} />
                <span className="font-black" style={{ color: "hsl(193 88% 67%)" }}>+{avgEv}%</span>
                <span className="text-muted-foreground text-xs">avg EV</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5 text-sm">
                <Target className="w-3.5 h-3.5" style={{ color: "hsl(38 100% 65%)" }} />
                <span className="font-black" style={{ color: "hsl(38 100% 65%)" }}>{avgConf}%</span>
                <span className="text-muted-foreground text-xs">avg conf</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pt-4 pb-36 max-w-screen-xl mx-auto">

        {/* ── Filters + Select All ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sport filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "hsl(220 38% 8%)", border: "1px solid hsl(220 28% 13%)" }}>
              {SPORTS_FILTER.map(s => (
                <button key={s} onClick={() => setSportFilter(s)}
                  data-testid={`filter-sport-${s.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={sportFilter === s
                    ? { background: "hsl(260 95% 68% / 0.15)", color: "hsl(260 95% 82%)", border: "1px solid hsl(260 95% 68% / 0.3)" }
                    : { color: "hsl(220 12% 52%)" }
                  }>
                  {s === "All" ? "All Sports" : `${SPORT_EMOJI[s]} ${s}`}
                </button>
              ))}
            </div>
            {/* Edge filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "hsl(220 38% 8%)", border: "1px solid hsl(220 28% 13%)" }}>
              {EDGE_FILTER.map(e => (
                <button key={e} onClick={() => setEdgeFilter(e)}
                  data-testid={`filter-edge-${e.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={edgeFilter === e
                    ? { background: "hsl(82 92% 56% / 0.13)", color: "hsl(82 92% 62%)", border: "1px solid hsl(82 92% 56% / 0.3)" }
                    : { color: "hsl(220 12% 52%)" }
                  }>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{filtered.length} picks</span>
            <button
              onClick={handleSelectAll}
              data-testid="select-all-btn"
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: selectedIds.size === filtered.length && filtered.length > 0
                  ? "hsl(260 95% 68% / 0.15)"
                  : "hsl(220 38% 8%)",
                color: selectedIds.size === filtered.length && filtered.length > 0
                  ? "hsl(260 95% 82%)"
                  : "hsl(220 12% 54%)",
                border: `1px solid ${selectedIds.size === filtered.length && filtered.length > 0 ? "hsl(260 95% 68% / 0.3)" : "hsl(220 28% 16%)"}`,
              }}
            >
              {selectedIds.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        {/* ── Picks grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No picks match these filters</h3>
            <p className="text-sm text-muted-foreground">Try changing your sport or edge filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(pick => (
              <PredictionCard
                key={pick.id}
                pick={pick}
                selected={selectedIds.has(pick.id)}
                onToggle={() => toggleSelect(pick.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky bulk copy panel ── */}
      {selectedIds.size > 0 && (
        <BulkCopyPanel
          picks={selectedPicks}
          onClear={() => setSelectedIds(new Set())}
        />
      )}
    </div>
  );
}
