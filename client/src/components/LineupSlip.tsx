import { useState } from "react";
import { Copy, Trash2, X, ChevronDown, ChevronUp, Layers, ExternalLink, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SlipPick {
  id: number;
  player: string;
  team: string;
  market: string;
  line: number;
  side: string;
  sport: string;
  confidence: number;
  ev: number;
}

// ─── Platform configs ─────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "prizepicks",
    label: "PrizePicks",
    icon: "🎯",
    url: "https://app.prizepicks.com/board",
    color: "hsl(231 88% 18% / 0.85)",
    border: "hsl(231 88% 55% / 0.5)",
    textColor: "#a5b4fc",
    // Format: one pick per line as "Player Name Over/Under Line"
    format: (picks: SlipPick[]) =>
      picks.map(p => `${p.player} ${p.side} ${p.line}`).join("\n"),
  },
  {
    id: "underdog",
    label: "Underdog Fantasy",
    icon: "🐶",
    url: "https://underdogfantasy.com/pick-em",
    color: "hsl(22 95% 22% / 0.85)",
    border: "hsl(22 95% 55% / 0.5)",
    textColor: "#fdba74",
    // Format: "Player Name Higher/Lower Line Market"
    format: (picks: SlipPick[]) =>
      picks.map(p => `${p.player} ${p.side === "Over" ? "Higher" : "Lower"} ${p.line} ${p.market}`).join("\n"),
  },
  {
    id: "fanduel",
    label: "FanDuel",
    icon: "🏆",
    url: "https://www.fanduel.com/sports-betting",
    color: "hsl(145 60% 12% / 0.85)",
    border: "hsl(145 60% 45% / 0.5)",
    textColor: "#86efac",
    // Format: "Player Over/Under Line Market (Sport)"
    format: (picks: SlipPick[]) =>
      picks.map(p => `${p.player} ${p.side} ${p.line} ${p.market} (${p.sport})`).join("\n"),
  },
];

// ─── Platform Button ──────────────────────────────────────────────────────────
function PlatformBtn({
  platform,
  picks,
  disabled,
}: {
  platform: typeof PLATFORMS[0];
  picks: SlipPick[];
  disabled: boolean;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (disabled) return;

    // 1. Format and copy to clipboard
    const formatted = platform.format(picks);
    try {
      await navigator.clipboard.writeText(formatted);
    } catch {
      // fallback — silently continue even if clipboard fails
    }

    // 2. Open the platform in a new tab
    window.open(platform.url, "_blank", "noopener,noreferrer");

    // 3. Show confirmation
    setCopied(true);
    toast({
      title: `Opening ${platform.label}`,
      description: `${picks.length} pick${picks.length > 1 ? "s" : ""} copied — just paste when you arrive!`,
    });
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      data-testid={`export-${platform.id}`}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 hover:brightness-110 active:scale-[0.98]"
      style={{
        background: platform.color,
        border: `1px solid ${platform.border}`,
        color: platform.textColor,
      }}
    >
      <span className="text-base leading-none">{platform.icon}</span>
      <span className="flex-1 text-left">
        {copied ? "Copied! Paste when ready" : `Open ${platform.label}`}
      </span>
      {copied
        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        : <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
      }
    </button>
  );
}

// ─── Slip Pick Row ────────────────────────────────────────────────────────────
function SlipRow({ pick, onRemove }: { pick: SlipPick; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2 rounded-xl"
      style={{ background: "hsl(222 35% 10%)", border: "1px solid hsl(222 30% 15%)" }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-foreground truncate">{pick.player}</div>
        <div className="text-[10px] text-muted-foreground truncate">
          <span className={pick.side === "Over" ? "text-lime-400 font-semibold" : "text-red-400 font-semibold"}>
            {pick.side}
          </span>{" "}
          {pick.line} {pick.market}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors shrink-0"
        title="Remove pick"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Plain copy ───────────────────────────────────────────────────────────────
function PlainCopyBtn({ picks }: { picks: SlipPick[] }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const text = picks.map((p, i) =>
      `${i + 1}. ${p.player} — ${p.side} ${p.line} ${p.market} (${p.sport})`
    ).join("\n");
    await navigator.clipboard.writeText(`PropEdge Lineup\n───────────────\n${text}\n\nGenerated by PropEdge AI`);
    setCopied(true);
    toast({ description: "Plain text lineup copied!" });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      data-testid="copy-all-generic"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
      style={{
        background: "hsl(222 35% 11%)",
        border: "1px solid hsl(222 30% 18%)",
        color: "hsl(222 20% 60%)",
      }}
    >
      {copied ? <CheckCircle2 className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy Plain Text"}
    </button>
  );
}

// ─── Main LineupSlip ──────────────────────────────────────────────────────────
interface LineupSlipProps {
  picks: SlipPick[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

export default function LineupSlip({ picks, onRemove, onClear }: LineupSlipProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showExport, setShowExport] = useState(false);

  if (picks.length === 0) return null;

  return (
    <div
      data-testid="lineup-slip"
      className="fixed bottom-5 right-5 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "hsl(222 47% 5%)",
        border: "1px solid hsl(258 90% 66% / 0.35)",
        boxShadow: "0 0 40px hsl(258 90% 66% / 0.12), 0 4px 32px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
        style={{ background: "hsl(258 90% 66% / 0.1)", borderBottom: "1px solid hsl(258 90% 66% / 0.2)" }}
        onClick={() => setCollapsed(c => !c)}
      >
        <Layers className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(258 90% 75%)" }} />
        <span className="text-xs font-black tracking-wide" style={{ color: "hsl(258 90% 80%)" }}>
          MY LINEUP SLIP
        </span>
        <span
          className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: "hsl(258 90% 66% / 0.2)", color: "hsl(258 90% 80%)", border: "1px solid hsl(258 90% 66% / 0.3)" }}
        >
          {picks.length}/6
        </span>
        <span className="text-muted-foreground ml-1">
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </div>

      {!collapsed && (
        <div className="p-2.5 space-y-2">
          {/* Picks list */}
          <div className="space-y-1.5">
            {picks.map(p => (
              <SlipRow key={p.id} pick={p} onRemove={() => onRemove(p.id)} />
            ))}
          </div>

          {picks.length < 6 && (
            <p className="text-[9px] text-muted-foreground text-center py-0.5">
              {6 - picks.length} more pick{6 - picks.length !== 1 ? "s" : ""} to fill the slip
            </p>
          )}

          {/* Export toggle */}
          <button
            data-testid="toggle-export"
            onClick={() => setShowExport(s => !s)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(258 90% 60%), hsl(220 90% 55%))",
              color: "#fff",
            }}
          >
            <ExternalLink className="w-3 h-3" />
            Send to Platform
            {showExport ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
          </button>

          {/* Platform buttons */}
          {showExport && (
            <div className="space-y-1.5">
              <p className="text-[9px] text-center pb-0.5" style={{ color: "hsl(258 90% 75%)" }}>
                Opens the app + copies your picks — just paste
              </p>
              {PLATFORMS.map(platform => (
                <PlatformBtn
                  key={platform.id}
                  platform={platform}
                  picks={picks}
                  disabled={picks.length === 0}
                />
              ))}
              <PlainCopyBtn picks={picks} />
            </div>
          )}

          {/* Clear */}
          <button
            data-testid="clear-slip"
            onClick={onClear}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-semibold text-muted-foreground hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear Slip
          </button>
        </div>
      )}
    </div>
  );
}
