import { useState } from "react";
import { Copy, Trash2, X, ChevronDown, ChevronUp, Layers, ExternalLink, CheckCircle2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SlipPick {
  id: string | number;
  player: string;
  team: string;
  market: string;
  line: number;
  side: string;
  sport: string;
  confidence: number;
  ev: number;
}

const PLATFORMS = [
  {
    id: "prizepicks",
    label: "PrizePicks",
    icon: "🎯",
    url: "https://app.prizepicks.com/board",
    bg: "hsl(230 88% 22% / 0.92)",
    border: "hsl(230 88% 60% / 0.55)",
    color: "hsl(230 88% 84%)",
    glow: "hsl(230 88% 58% / 0.25)",
    format: (picks: SlipPick[]) => picks.map(p => `${p.player} ${p.side} ${p.line}`).join("\n"),
  },
  {
    id: "underdog",
    label: "Underdog",
    icon: "🐶",
    url: "https://underdogfantasy.com/pick-em",
    bg: "hsl(24 96% 20% / 0.92)",
    border: "hsl(24 96% 58% / 0.55)",
    color: "hsl(24 96% 80%)",
    glow: "hsl(24 96% 55% / 0.22)",
    format: (picks: SlipPick[]) => picks.map(p => `${p.player} ${p.side === "Over" ? "Higher" : "Lower"} ${p.line} ${p.market}`).join("\n"),
  },
  {
    id: "fanduel",
    label: "FanDuel",
    icon: "🏆",
    url: "https://www.fanduel.com/sports-betting",
    bg: "hsl(196 80% 16% / 0.92)",
    border: "hsl(196 80% 52% / 0.55)",
    color: "hsl(196 80% 80%)",
    glow: "hsl(196 80% 50% / 0.22)",
    format: (picks: SlipPick[]) => picks.map(p => `${p.player} ${p.side} ${p.line} ${p.market} (${p.sport})`).join("\n"),
  },
  {
    id: "draftkings",
    label: "DraftKings",
    icon: "👑",
    url: "https://sportsbook.draftkings.com",
    bg: "hsl(80 90% 14% / 0.92)",
    border: "hsl(80 90% 52% / 0.55)",
    color: "hsl(80 90% 74%)",
    glow: "hsl(80 90% 50% / 0.22)",
    format: (picks: SlipPick[]) => picks.map(p => `${p.player} | ${p.market} ${p.side} ${p.line} | ${p.team}`).join("\n"),
  },
];

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

function SlipRow({ pick, onRemove }: { pick: SlipPick; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
      style={{ background: "hsl(218 32% 9%)", border: "1px solid hsl(218 28% 14%)" }}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-foreground truncate leading-tight">{pick.player}</div>
        <div className="text-[10px] flex items-center gap-1 mt-0.5">
          <span className={`font-black ${pick.side === "Over" ? "side-over" : "side-under"}`}>{pick.side}</span>
          <span className="text-muted-foreground">{pick.line}</span>
          <span className="text-muted-foreground/60 truncate">{pick.market}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[9px] font-black" style={{ color: "hsl(80 96% 62%)" }}>+{pick.ev}%</span>
        <button onClick={onRemove}
          className="p-1 rounded-lg transition-colors hover:scale-110"
          style={{ color: "hsl(218 18% 45%)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "hsl(5 96% 66%)"; (e.currentTarget as HTMLElement).style.background = "hsl(5 96% 64% / 0.1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "hsl(218 18% 45%)"; (e.currentTarget as HTMLElement).style.background = ""; }}>
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function ExportPanel({ picks }: { picks: SlipPick[] }) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fallback, setFallback] = useState<{ text: string; url: string; label: string } | null>(null);

  const handlePlatform = async (p: typeof PLATFORMS[0]) => {
    const text = p.format(picks);
    const ok = await copyToClipboard(text);
    if (ok) {
      window.open(p.url, "_blank", "noopener,noreferrer");
      setCopiedId(p.id);
      toast({ title: `Opening ${p.label}`, description: `${picks.length} pick${picks.length !== 1 ? "s" : ""} copied — paste when you arrive!` });
      setTimeout(() => setCopiedId(null), 3500);
    } else {
      setFallback({ text, url: p.url, label: p.label });
    }
  };

  if (fallback) {
    return (
      <div className="space-y-2">
        <div className="rounded-xl p-3" style={{ background: "hsl(218 38% 5%)", border: "1px solid hsl(263 100% 70% / 0.2)" }}>
          <p className="text-[10px] font-bold mb-2" style={{ color: "hsl(263 100% 80%)" }}>
            Select all → copy → paste into {fallback.label}
          </p>
          <textarea readOnly defaultValue={fallback.text} onFocus={e => e.target.select()}
            rows={picks.length + 2}
            className="w-full text-[10px] font-mono rounded-lg p-2 resize-none focus:outline-none"
            style={{ background: "hsl(218 40% 4%)", border: "1px solid hsl(218 28% 14%)", color: "hsl(80 96% 64%)" }} />
          <div className="flex gap-1.5 mt-2">
            {fallback.url && (
              <button onClick={() => window.open(fallback.url, "_blank")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold btn-neon">
                <ExternalLink className="w-3 h-3" /> Open {fallback.label}
              </button>
            )}
            <button onClick={() => setFallback(null)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
              style={{ background: "hsl(218 32% 10%)", border: "1px solid hsl(218 28% 16%)" }}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[9px] text-center font-semibold pb-0.5" style={{ color: "hsl(263 100% 72%)" }}>
        Copies picks + opens app · one tap
      </p>
      {PLATFORMS.map(p => {
        const isCopied = copiedId === p.id;
        return (
          <button key={p.id} onClick={() => handlePlatform(p)} disabled={picks.length === 0}
            data-testid={`export-${p.id}`}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 active:scale-[0.98]"
            style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color, boxShadow: isCopied ? `0 0 16px ${p.glow}` : "none" }}>
            <span className="text-base leading-none">{p.icon}</span>
            <span className="flex-1 text-left">{isCopied ? "Copied! Paste in app →" : `Open ${p.label}`}</span>
            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />}
          </button>
        );
      })}
    </div>
  );
}

interface LineupSlipProps { picks: SlipPick[]; onRemove: (id: string | number) => void; onClear: () => void; }

export default function LineupSlip({ picks, onRemove, onClear }: LineupSlipProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const avgConf = picks.length ? Math.round(picks.reduce((s, p) => s + p.confidence, 0) / picks.length) : 0;
  const pct = (picks.length / 6) * 100;

  if (picks.length === 0) return null;

  return (
    <div data-testid="lineup-slip"
      className="fixed bottom-5 right-5 z-50 w-[288px] rounded-2xl overflow-hidden"
      style={{
        background: "hsl(218 42% 4% / 0.97)",
        border: "1px solid hsl(263 100% 70% / 0.4)",
        boxShadow: "0 0 60px hsl(263 100% 70% / 0.18), 0 0 120px hsl(263 100% 70% / 0.06), 0 8px 48px hsl(218 42% 3% / 0.7)",
        backdropFilter: "blur(24px)",
      }}>

      {/* Progress bar across top */}
      <div className="h-[3px] w-full" style={{ background: "hsl(218 28% 12%)" }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, hsl(263 100% 62%), hsl(80 96% 58%))", boxShadow: "0 0 8px hsl(263 100% 70% / 0.5)" }} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
        style={{ background: "hsl(263 100% 70% / 0.08)", borderBottom: "1px solid hsl(263 100% 70% / 0.15)" }}
        onClick={() => setCollapsed(c => !c)}>
        <Layers className="w-4 h-4 shrink-0" style={{ color: "hsl(263 100% 78%)" }} />
        <span className="text-xs font-black tracking-widest" style={{ color: "hsl(263 100% 84%)" }}>MY SLIP</span>
        {/* Pick count badge */}
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: "hsl(263 100% 70% / 0.2)", color: "hsl(263 100% 84%)", border: "1px solid hsl(263 100% 70% / 0.35)", boxShadow: "0 0 8px hsl(263 100% 70% / 0.2)" }}>
          {picks.length}/6
        </span>
        {picks.length > 0 && (
          <span className="text-[9px] font-bold" style={{ color: "hsl(80 96% 62%)" }}>{avgConf}% avg</span>
        )}
        <span className="ml-auto text-muted-foreground">
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-2.5">
          {/* Picks */}
          <div className="space-y-1.5">
            {picks.map(p => (
              <SlipRow key={p.id} pick={p} onRemove={() => onRemove(p.id)} />
            ))}
          </div>

          {picks.length < 6 && (
            <div className="text-[10px] text-center py-1 font-medium" style={{ color: "hsl(218 18% 40%)" }}>
              {Array(6 - picks.length).fill("·").join(" ")} {6 - picks.length} more to fill
            </div>
          )}

          {/* Send to Platform CTA */}
          <button onClick={() => setShowExport(s => !s)} data-testid="toggle-export"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black btn-neon transition-all active:scale-[0.98]">
            <Zap className="w-4 h-4" />
            Send to Platform
            {showExport ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
          </button>

          {showExport && <ExportPanel picks={picks} />}

          {/* Clear */}
          <button onClick={onClear} data-testid="clear-slip"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold transition-colors text-muted-foreground hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
            Clear Slip
          </button>
        </div>
      )}
    </div>
  );
}
