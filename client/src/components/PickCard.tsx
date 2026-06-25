import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSlip } from "@/context/SlipContext";
import {
  Bookmark, BookmarkCheck, Copy, Check,
  ChevronDown, ChevronUp, Brain, Plus, Zap
} from "lucide-react";

interface Pick {
  id: number; sport: string; player: string; team: string; opponent: string;
  market: string; line: number; side: string; confidence: number; ev: number;
  edge: string; reasoning: string; gameTime: string; status: string; createdAt: number;
}

interface PickCardProps {
  pick: Pick;
  isSaved?: boolean;
  showReason?: boolean;
  rank?: number;
  isNew?: boolean;
}

// Sport → neon color
const SPORT_HSL: Record<string, string> = {
  MLB: "5 96% 64%", NBA: "30 100% 58%", NHL: "196 96% 60%", Tennis: "80 96% 58%",
};
const SPORT_EMOJI: Record<string, string> = {
  MLB: "⚾", NBA: "🏀", NHL: "🏒", Tennis: "🎾",
};

// Edge → styling
const EDGE_STYLE: Record<string, { cls: string; glow: string; barGrad: string }> = {
  elite: {
    cls: "elite-glow",
    glow: "0 0 36px hsl(263 100% 70% / 0.28)",
    barGrad: "linear-gradient(90deg, hsl(263 100% 55%), hsl(263 100% 80%))",
  },
  high: {
    cls: "high-glow",
    glow: "0 0 28px hsl(80 96% 58% / 0.18)",
    barGrad: "linear-gradient(90deg, hsl(80 96% 44%), hsl(80 96% 68%))",
  },
  mid: {
    cls: "mid-glow",
    glow: "none",
    barGrad: "linear-gradient(90deg, hsl(190 92% 46%), hsl(190 92% 68%))",
  },
  low: {
    cls: "",
    glow: "none",
    barGrad: "linear-gradient(90deg, hsl(218 28% 25%), hsl(218 28% 40%))",
  },
};

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta); return ok;
  } catch { return false; }
}

export default function PickCard({ pick, isSaved: initSaved = false, showReason = false, rank, isNew }: PickCardProps) {
  const [saved, setSaved] = useState(initSaved);
  const [expanded, setExpanded] = useState(showReason);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { addToSlip } = useSlip();

  const edge = EDGE_STYLE[pick.edge] ?? EDGE_STYLE.low;
  const sportHsl = SPORT_HSL[pick.sport] ?? "263 100% 70%";
  const confColor = pick.confidence >= 80 ? "hsl(263 100% 80%)" : pick.confidence >= 70 ? "hsl(80 96% 62%)" : "hsl(190 92% 64%)";

  const saveMutation = useMutation({
    mutationFn: () => saved
      ? apiRequest("DELETE", `/api/saved/${pick.id}`)
      : apiRequest("POST",   `/api/saved/${pick.id}`),
    onSuccess: () => { setSaved(!saved); qc.invalidateQueries({ queryKey: ["/api/saved"] }); },
  });

  const handleCopy = async () => {
    const text = `${pick.player} ${pick.side} ${pick.line} ${pick.market} — ${pick.confidence}% conf · +${pick.ev}% EV`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast({ title: "Pick copied!", description: text });
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleAddSlip = () => {
    addToSlip({
      id: `pick-${pick.id}`,
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
    <div className={`relative rounded-2xl border overflow-hidden card-hover ai-card ${edge.cls} ${isNew ? "feed-item-new" : ""}`}
      style={{ background: "hsl(218 38% 6%)" }}>

      {/* Top neon accent strip */}
      <div className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, hsl(${sportHsl}), hsl(263 100% 70%), hsl(80 96% 58%))` }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {rank && (
            <span className={`rank-badge rank-badge-${rank <= 3 ? rank : ""}`}>{rank}</span>
          )}
          <span className={`badge-${pick.sport} text-[10px] font-bold px-2.5 py-1 rounded-full`}>
            {SPORT_EMOJI[pick.sport]} {pick.sport}
          </span>
          <span className={`edge-${pick.edge} text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide`}>
            {pick.edge}
          </span>
          {pick.status === "won" && (
            <span className="status-won text-[10px] font-black px-2.5 py-1 rounded-full">✅ WON</span>
          )}
          {pick.status === "lost" && (
            <span className="status-lost text-[10px] font-black px-2.5 py-1 rounded-full">❌ LOST</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleAddSlip} data-testid={`add-slip-${pick.id}`}
            className="p-1.5 rounded-xl transition-all hover:scale-110"
            title="Add to slip"
            style={{ background: "hsl(263 100% 70% / 0.1)", color: "hsl(263 100% 80%)", border: "1px solid hsl(263 100% 70% / 0.22)" }}>
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleCopy} data-testid={`copy-pick-${pick.id}`}
            className="p-1.5 rounded-xl transition-all hover:scale-110"
            style={copied
              ? { background: "hsl(80 96% 58% / 0.15)", color: "hsl(80 96% 62%)", border: "1px solid hsl(80 96% 58% / 0.3)" }
              : { background: "hsl(218 28% 11%)", color: "hsl(218 18% 55%)", border: "1px solid hsl(218 28% 16%)" }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => saveMutation.mutate()} data-testid={`save-pick-${pick.id}`}
            className="p-1.5 rounded-xl transition-all hover:scale-110"
            style={saved
              ? { background: "hsl(38 100% 60% / 0.15)", color: "hsl(38 100% 66%)", border: "1px solid hsl(38 100% 60% / 0.3)" }
              : { background: "hsl(218 28% 11%)", color: "hsl(218 18% 55%)", border: "1px solid hsl(218 28% 16%)" }}>
            {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Player + pick — the hero section */}
      <div className="px-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="text-base font-black text-foreground tracking-tight truncate mb-0.5">{pick.player}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span style={{ color: `hsl(${sportHsl})` }} className="font-semibold">{pick.team}</span>
              <span className="opacity-40">vs</span>
              <span>{pick.opponent || "TBD"}</span>
            </div>
          </div>
          {/* Big pick display */}
          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className={`text-2xl font-black ${pick.side === "Over" ? "side-over" : "side-under"}`}>{pick.side}</span>
              <span className="text-2xl font-black text-foreground">{pick.line}</span>
            </div>
            <div className="text-xs text-muted-foreground">{pick.market}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="space-y-2">
          {/* Confidence bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="label-caps">Confidence</span>
              <span className="text-xs font-black" style={{ color: confColor }}>{pick.confidence}%</span>
            </div>
            <div className="conf-bar">
              <div className="conf-fill" style={{ width: `${pick.confidence}%`, background: edge.barGrad }} />
            </div>
          </div>
          {/* EV + game time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" style={{ color: "hsl(80 96% 58%)" }} />
              <span className="text-sm font-black trend-up">+{pick.ev}% EV</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{pick.gameTime}</span>
          </div>
        </div>

        {/* Reasoning toggle */}
        <button onClick={() => setExpanded(!expanded)}
          data-testid={`expand-pick-${pick.id}`}
          className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
          style={{ color: "hsl(263 100% 72%)" }}>
          <Brain className="w-3.5 h-3.5" />
          AI Reasoning
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {expanded && (
          <div className="mt-2 p-3 rounded-xl text-[11px] text-muted-foreground leading-relaxed border"
            style={{ background: "hsl(218 38% 4%)", borderColor: "hsl(218 28% 13%)" }}>
            {pick.reasoning}
          </div>
        )}
      </div>
    </div>
  );
}
