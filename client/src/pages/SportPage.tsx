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
  Star, Shield, Target, Activity, BarChart2, Swords, UserCircle, PlusCircle, CheckCircle2,
  Flame
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
  color: string; bg: string; border: string; glow: string;
  accentHsl: string;
  categories: { id: string; label: string; icon: React.ReactNode }[];
  // Stat buckets for Top 6: each bucket picks the BEST pick for that market
  statBuckets: { label: string; emoji: string; markets: string[] }[];
}> = {
  MLB: {
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25",
    glow: "hsl(4 90% 60%)", accentHsl: "4 90% 60%",
    categories: [
      { id: "All",      label: "All Props",  icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Batting",  label: "Batting",    icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "Pitching", label: "Pitching",   icon: <Zap className="w-3.5 h-3.5" /> },
    ],
    statBuckets: [
      { label: "Hits",          emoji: "🎯", markets: ["Hits"] },
      { label: "Home Runs",     emoji: "💥", markets: ["Home Runs"] },
      { label: "RBI",           emoji: "🏃", markets: ["RBI"] },
      { label: "Total Bases",   emoji: "📐", markets: ["Total Bases"] },
      { label: "Strikeouts",    emoji: "🔥", markets: ["Strikeouts"] },
      { label: "Stolen Bases",  emoji: "⚡", markets: ["Stolen Bases"] },
    ],
  },
  NBA: {
    color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/25",
    glow: "hsl(33 100% 55%)", accentHsl: "33 100% 55%",
    categories: [
      { id: "All",        label: "All Props",   icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Scoring",    label: "Scoring",     icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "Playmaking", label: "Playmaking",  icon: <Target className="w-3.5 h-3.5" /> },
      { id: "Rebounding", label: "Rebounding",  icon: <BarChart2 className="w-3.5 h-3.5" /> },
      { id: "Defense",    label: "Defense",     icon: <Shield className="w-3.5 h-3.5" /> },
      { id: "Combo",      label: "Combo",       icon: <Star className="w-3.5 h-3.5" /> },
    ],
    statBuckets: [
      { label: "Points",       emoji: "🏀", markets: ["Points"] },
      { label: "Rebounds",     emoji: "💪", markets: ["Rebounds"] },
      { label: "Assists",      emoji: "🎯", markets: ["Assists"] },
      { label: "3-Pointers",   emoji: "🔥", markets: ["3-Pointers Made"] },
      { label: "Pts+Reb+Ast",  emoji: "⭐", markets: ["Pts+Reb+Ast"] },
      { label: "Blocks",       emoji: "🛡️", markets: ["Blocks"] },
    ],
  },
  NHL: {
    color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25",
    glow: "hsl(200 90% 55%)", accentHsl: "200 90% 55%",
    categories: [
      { id: "All",           label: "All Props",     icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Scoring",       label: "Scoring",       icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "Shooting",      label: "Shots on Goal", icon: <Target className="w-3.5 h-3.5" /> },
      { id: "Special Teams", label: "Power Play",    icon: <Zap className="w-3.5 h-3.5" /> },
      { id: "Physical",      label: "Physical",      icon: <Swords className="w-3.5 h-3.5" /> },
      { id: "Defense",       label: "Defense",       icon: <Shield className="w-3.5 h-3.5" /> },
    ],
    statBuckets: [
      { label: "Shots on Goal",   emoji: "🏒", markets: ["Shots on Goal"] },
      { label: "Goals",           emoji: "🚨", markets: ["Goals"] },
      { label: "Points",          emoji: "⭐", markets: ["Points"] },
      { label: "PP Points",       emoji: "⚡", markets: ["Power Play Points"] },
      { label: "Hits",            emoji: "💥", markets: ["Hits"] },
      { label: "Assists",         emoji: "🎯", markets: ["Assists"] },
    ],
  },
  Tennis: {
    color: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/25",
    glow: "hsl(85 90% 55%)", accentHsl: "85 90% 55%",
    categories: [
      { id: "All",     label: "All Props",  icon: <Activity className="w-3.5 h-3.5" /> },
      { id: "Serving", label: "Serving",    icon: <Zap className="w-3.5 h-3.5" /> },
      { id: "Return",  label: "Return",     icon: <Target className="w-3.5 h-3.5" /> },
      { id: "Match",   label: "Match",      icon: <Trophy className="w-3.5 h-3.5" /> },
    ],
    statBuckets: [
      { label: "Aces",        emoji: "🎾", markets: ["Aces"] },
      { label: "Games Won",   emoji: "🏆", markets: ["Games Won"] },
      { label: "1st Serve %", emoji: "💫", markets: ["1st Serve %"] },
      { label: "Double Faults", emoji: "❌", markets: ["Double Faults"] },
      { label: "Break Points", emoji: "⚡", markets: ["Break Points Won"] },
      { label: "Winners",     emoji: "🔥", markets: ["Winners"] },
    ],
  },
};

const EDGE_LABEL: Record<string, string> = { elite: "ELITE", high: "HIGH", mid: "MID", low: "LOW" };
const EDGE_CLASS: Record<string, string> = { elite: "edge-elite", high: "edge-high", mid: "edge-mid", low: "edge-low" };

function EdgePill({ edge }: { edge: string }) {
  return (
    <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${EDGE_CLASS[edge] ?? "edge-low"}`}>
      {EDGE_LABEL[edge] ?? edge.toUpperCase()}
    </span>
  );
}

// ─── Top6ByStat — hero section ─────────────────────────────────────────────────
function Top6ByStat({ picks, sport }: { picks: Pick[]; sport: string }) {
  const { toast } = useToast();
  const { addToSlip, isInSlip } = useSlip();
  const cfg = SPORT_CONFIG[sport];
  const accentHsl = cfg.accentHsl;

  // For each bucket, find the highest-EV pick matching any of its markets
  const bucketPicks = useMemo(() => {
    return cfg.statBuckets.map(bucket => {
      const match = picks
        .filter(p =>
          bucket.markets.some(m =>
            p.market.toLowerCase().includes(m.toLowerCase())
          )
        )
        .sort((a, b) => b.ev - a.ev || b.confidence - a.confidence)[0] ?? null;
      return { bucket, pick: match };
    });
  }, [picks, cfg]);

  const copyAll = () => {
    const lines = bucketPicks
      .filter(b => b.pick)
      .map((b, i) =>
        `${i + 1}. ${b.bucket.emoji} ${b.bucket.label}: ${b.pick!.player} ${b.pick!.side} ${b.pick!.line} (${b.pick!.confidence}% · +${b.pick!.ev}% EV)`
      ).join("\n");
    navigator.clipboard.writeText(
      `PropEdge Top 6 ${sport} Props — Future Picks\n${"─".repeat(44)}\n\n${lines}\n\nPowered by PropEdge PEMF Algorithm`
    );
    toast({ title: `Top 6 ${sport} Props Copied!`, description: "Formatted for PrizePicks / Underdog." });
  };

  const hasAny = bucketPicks.some(b => b.pick);

  return (
    <div
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        background: "hsl(222 40% 7%)",
        border: `1px solid hsl(${accentHsl} / 0.25)`,
        boxShadow: `0 0 40px hsl(${accentHsl} / 0.06)`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2.5 border-b"
        style={{ borderColor: `hsl(${accentHsl} / 0.15)`, background: `hsl(${accentHsl} / 0.06)` }}
      >
        <Flame className="w-4 h-4" style={{ color: `hsl(${accentHsl})` }} />
        <span className="font-black text-sm text-foreground tracking-tight">
          Top 6 {sport} Props
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `hsl(${accentHsl} / 0.12)`, color: `hsl(${accentHsl})`, border: `1px solid hsl(${accentHsl} / 0.25)` }}
        >
          FUTURE PICKS · HIGHEST EV
        </span>
        <button
          onClick={copyAll}
          disabled={!hasAny}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, hsl(${accentHsl}), hsl(258 90% 60%))` }}
        >
          <Copy className="w-3 h-3" />
          Copy All 6
        </button>
      </div>

      {/* Bucket grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-border/40">
        {bucketPicks.map(({ bucket, pick }, idx) => {
          const inSlip = pick ? isInSlip(pick.id) : false;

          return (
            <StatBucketCard
              key={bucket.label}
              bucket={bucket}
              pick={pick}
              idx={idx}
              accentHsl={accentHsl}
              inSlip={inSlip}
              onAddToSlip={() => {
                if (!pick || inSlip) return;
                addToSlip({ id: pick.id, player: pick.player, team: pick.team, market: pick.market, line: pick.line, side: pick.side, sport: pick.sport, confidence: pick.confidence, ev: pick.ev });
                toast({ description: `${pick.player} added to your slip!` });
              }}
              onCopy={() => {
                if (!pick) return;
                navigator.clipboard.writeText(`${pick.player} ${pick.side} ${pick.line} ${pick.market} (${pick.confidence}% conf · +${pick.ev}% EV)`);
                toast({ description: `${bucket.label} pick copied!` });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function StatBucketCard({
  bucket, pick, idx, accentHsl, inSlip, onAddToSlip, onCopy
}: {
  bucket: { label: string; emoji: string; markets: string[] };
  pick: Pick | null;
  idx: number;
  accentHsl: string;
  inSlip: boolean;
  onAddToSlip: () => void;
  onCopy: () => void;
}) {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div
      className="p-3 flex flex-col gap-2 min-h-[160px] relative group"
      style={pick?.edge === "elite" ? { background: `hsl(${accentHsl} / 0.04)` } : undefined}
    >
      {/* Stat label */}
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{bucket.emoji}</span>
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{bucket.label}</span>
        {pick?.edge === "elite" && (
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full edge-elite ml-auto">ELITE</span>
        )}
      </div>

      {pick ? (
        <>
          {/* Player name */}
          <div className="font-bold text-sm text-foreground leading-tight">{pick.player}</div>

          {/* The prop line — big and bold */}
          <div
            className="rounded-xl px-3 py-2 text-center"
            style={{ background: "hsl(222 35% 11%)", border: "1px solid hsl(222 30% 16%)" }}
          >
            <div className={`text-xl font-black ${pick.side === "Over" ? "side-over" : "side-under"}`}>
              {pick.side} {pick.line}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{pick.market}</div>
          </div>

          {/* Confidence + EV row */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{pick.confidence}%</span>
            <span className="font-bold text-lime-400">+{pick.ev}% EV</span>
          </div>

          {/* Confidence bar */}
          <div className="conf-bar" style={{ height: "3px" }}>
            <div
              className="conf-fill"
              style={{
                width: `${pick.confidence}%`,
                background: `linear-gradient(90deg, hsl(${accentHsl} / 0.6), hsl(${accentHsl}))`,
              }}
            />
          </div>

          {/* Reasoning toggle */}
          {showReasoning && (
            <div
              className="text-[10px] text-foreground/80 leading-relaxed rounded-xl p-2"
              style={{ background: "hsl(222 40% 6%)", border: "1px solid hsl(222 30% 13%)" }}
            >
              {pick.reasoning}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1 mt-auto pt-1">
            <button
              onClick={onCopy}
              title="Copy pick"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:opacity-80"
              style={{
                background: `hsl(${accentHsl} / 0.10)`,
                border: `1px solid hsl(${accentHsl} / 0.2)`,
                color: `hsl(${accentHsl})`,
              }}
            >
              <Copy className="w-2.5 h-2.5" />
              Copy
            </button>
            <button
              onClick={onAddToSlip}
              disabled={inSlip}
              title={inSlip ? "In slip" : "Add to Slip"}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all disabled:opacity-60 hover:opacity-80"
              style={inSlip ? {
                background: "hsl(85 90% 55% / 0.12)",
                border: "1px solid hsl(85 90% 55% / 0.3)",
                color: "hsl(85 90% 65%)",
              } : {
                background: "hsl(85 90% 55% / 0.08)",
                border: "1px solid hsl(85 90% 55% / 0.2)",
                color: "hsl(85 90% 55%)",
              }}
            >
              {inSlip ? <CheckCircle2 className="w-2.5 h-2.5" /> : <PlusCircle className="w-2.5 h-2.5" />}
              {inSlip ? "Added" : "Slip"}
            </button>
            <button
              onClick={() => setShowReasoning(r => !r)}
              title="AI reasoning"
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4 opacity-40">
          <Activity className="w-5 h-5 mb-2" />
          <span className="text-[10px] text-muted-foreground">Generating…</span>
        </div>
      )}
    </div>
  );
}

// ─── PropCard (full detail cards below the hero) ──────────────────────────────
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
      <div className="px-4 pt-4 pb-3">
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
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border badge-${pick.sport}`}>{pick.team}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">vs {pick.opponent} · {pick.gameTime}</div>
          </div>
          <EdgePill edge={pick.edge} />
        </div>

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

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Confidence</span>
              <span className="text-xs font-bold" style={{ color: "hsl(258 90% 75%)" }}>{pick.confidence}%</span>
            </div>
            <div className="conf-bar">
              <div className="conf-fill" style={{ width: `${pick.confidence}%`, background: "linear-gradient(90deg, hsl(258 90% 55%), hsl(258 90% 75%))" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Exp. Value</span>
              <span className="text-xs font-bold text-lime-400">+{pick.ev}%</span>
            </div>
            <div className="conf-bar">
              <div className="conf-fill" style={{ width: `${Math.min(100, pick.ev * 5)}%`, background: "linear-gradient(90deg, hsl(85 90% 45%), hsl(85 90% 60%))" }} />
            </div>
          </div>
        </div>

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
            style={{ background: "hsl(258 90% 66% / 0.12)", border: "1px solid hsl(258 90% 66% / 0.3)", color: "hsl(258 90% 80%)" }}
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
          <button
            data-testid={`slip-${pick.id}`}
            onClick={handleAddToSlip}
            disabled={inSlip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
            style={inSlip ? {
              background: "hsl(85 90% 55% / 0.12)", border: "1px solid hsl(85 90% 55% / 0.3)", color: "hsl(85 90% 65%)"
            } : {
              background: "hsl(85 90% 55% / 0.08)", border: "1px solid hsl(85 90% 55% / 0.2)", color: "hsl(85 90% 55%)"
            }}
          >
            {inSlip ? <><CheckCircle2 className="w-3 h-3" /> In Slip</> : <><PlusCircle className="w-3 h-3" /> + Slip</>}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 border-t" style={{ borderColor: "hsl(222 30% 14%)", background: "hsl(222 40% 6%)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3" style={{ color: "hsl(258 90% 75%)" }} />
            <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: "hsl(258 90% 75%)" }}>AI Model Reasoning</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed opacity-90">{pick.reasoning}</p>
          <div className="mt-2.5 pt-2.5 flex items-center gap-3 border-t text-[9px] text-muted-foreground" style={{ borderColor: "hsl(222 30% 14%)" }}>
            <span>Conf: <strong className="text-foreground">{pick.confidence}%</strong></span>
            <span>EV: <strong className="text-lime-400">+{pick.ev}%</strong></span>
            <span>Edge: <strong>{pick.edge}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main SportPage ────────────────────────────────────────────────────────────
export default function SportPage({ sport }: { sport: string }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const cfg = SPORT_CONFIG[sport] ?? SPORT_CONFIG.MLB;

  const { data: picks = [], isLoading } = useQuery<Pick[]>({
    queryKey: ["/api/picks", sport],
    queryFn: () => apiRequest("GET", `/api/picks?sport=${sport}&limit=80`).then(r => r.json()),
    refetchInterval: 60000,
  });

  const filtered = useMemo(() => {
    const base = activeCategory === "All"
      ? [...picks]
      : picks.filter(p => (p.category ?? "").toLowerCase() === activeCategory.toLowerCase());
    return base.sort((a, b) => b.ev - a.ev || b.confidence - a.confidence);
  }, [picks, activeCategory]);

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
            <h1 className={`text-xl font-black ${cfg.color}`}>{sport} Player Props</h1>
          </div>
          <p className="text-xs text-muted-foreground pl-5">
            PEMF Algorithm · 2026 live stats · future props only
          </p>
        </div>
      </div>

      {/* ── TOP 6 BY STAT — Hero Section ── */}
      {isLoading ? (
        <Skeleton className="h-52 rounded-2xl mb-6" />
      ) : (
        <Top6ByStat picks={picks} sport={sport} />
      )}

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
              <span className={`text-[9px] ml-0.5 px-1 rounded-full ${active ? `${cfg.bg} ${cfg.color}` : "bg-secondary text-muted-foreground"}`}>
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
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
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
