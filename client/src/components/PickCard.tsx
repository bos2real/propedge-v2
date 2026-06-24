import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, BookmarkCheck, Copy, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";

interface Pick {
  id: number;
  sport: string;
  player: string;
  team: string;
  opponent: string;
  market: string;
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

interface PickCardProps {
  pick: Pick;
  isSaved?: boolean;
  showReason?: boolean;
  rank?: number;
  isNew?: boolean;
}

export default function PickCard({ pick, isSaved: initialSaved = false, showReason = false, rank, isNew }: PickCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [expanded, setExpanded] = useState(showReason);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => saved
      ? apiRequest("DELETE", `/api/saved/${pick.id}`)
      : apiRequest("POST", `/api/saved/${pick.id}`),
    onSuccess: () => {
      setSaved(!saved);
      qc.invalidateQueries({ queryKey: ["/api/saved"] });
    },
  });

  const handleCopy = () => {
    const text = `${pick.sport} | ${pick.player} (${pick.team} vs ${pick.opponent})\n${pick.side} ${pick.line} ${pick.market}\nConfidence: ${pick.confidence}% | EV: +${pick.ev}%\n${pick.gameTime}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: "Pick copied to clipboard." });
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const confColor = pick.confidence >= 80 ? "#F59E0B" : pick.confidence >= 70 ? "#22C55E" : "#60A5FA";

  return (
    <div className={`bg-card border border-border rounded-xl p-4 card-hover ${pick.edge === "elite" ? "elite-glow" : ""} ${isNew ? "feed-item-new" : ""}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {rank && (
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
              {rank}
            </span>
          )}
          <span className={`badge-${pick.sport} text-[10px] font-bold px-2 py-0.5 rounded-full`}>{pick.sport}</span>
          <span className={`edge-${pick.edge} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase`}>{pick.edge}</span>
          {pick.status === "won" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/15 text-green-400 border border-green-400/30">✅ WON</span>}
          {pick.status === "lost" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-400/15 text-red-400 border border-red-400/30">❌ LOST</span>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={handleCopy}
            data-testid={`copy-pick-${pick.id}`}
            className={`p-1.5 rounded-lg transition-colors ${copied ? "bg-amber-400/20 text-amber-400" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => saveMutation.mutate()}
            data-testid={`save-pick-${pick.id}`}
            className={`p-1.5 rounded-lg transition-colors ${saved ? "text-amber-400 bg-amber-400/10" : "hover:bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Player + pick */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="font-bold text-foreground text-sm">{pick.player}</span>
          <span className="text-xs text-muted-foreground">{pick.team} vs {pick.opponent}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-black ${pick.side === "Over" ? "side-over" : "side-under"}`}>{pick.side}</span>
          <span className="text-lg font-black text-foreground">{pick.line}</span>
          <span className="text-sm font-medium text-muted-foreground">{pick.market}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3">
        {/* Confidence */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Confidence</span>
            <span className="text-[11px] font-bold" style={{ color: confColor }}>{pick.confidence}%</span>
          </div>
          <div className="conf-bar">
            <div className="conf-fill" style={{ width: `${pick.confidence}%`, background: confColor }} />
          </div>
        </div>
        {/* EV */}
        <div className="text-right shrink-0">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">EV+</div>
          <div className="text-sm font-bold text-green-400">+{pick.ev}%</div>
        </div>
      </div>

      {/* Game time */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{pick.gameTime}</span>
        <button onClick={() => setExpanded(!expanded)}
          data-testid={`expand-pick-${pick.id}`}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          AI Reasoning {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Reasoning */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{pick.reasoning}</p>
        </div>
      )}
    </div>
  );
}
