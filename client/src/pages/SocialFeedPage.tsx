import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSlip } from "@/context/SlipContext";
import {
  Copy, Check, Plus, RefreshCw, Users, Bot, Flame,
  ChevronDown, ExternalLink, Clock, TrendingUp, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface CommunityPost {
  id: string;
  username: string;
  platform: "reddit" | "twitter" | "discord" | "betview";
  avatar: string;
  timeAgo: string;
  sport: "MLB" | "NBA" | "NHL" | "Tennis";
  picks: CommunityPick[];
  likes: number;
  copies: number;
  tag?: string; // "🔥 Hot" | "✅ Capper" | "📈 +ROI"
}

interface CommunityPick {
  player: string;
  team: string;
  market: string;
  line: number;
  side: "Over" | "Under";
  sport: string;
}

interface AiPick {
  id: number;
  player: string;
  team: string;
  sport: string;
  market: string;
  line: number;
  side: string;
  confidence: number;
  ev: number;
  edge: string;
  reasoning?: string;
  category?: string;
}

// ─────────────────────────────────────────────
// Simulated community posts pool
// ─────────────────────────────────────────────
const COMMUNITY_POOL: CommunityPost[] = [
  {
    id: "c1",
    username: "SharpBettor_Kyle",
    platform: "reddit",
    avatar: "SK",
    timeAgo: "2m ago",
    sport: "MLB",
    picks: [
      { player: "Freddie Freeman", team: "LAD", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
      { player: "Aaron Judge", team: "NYY", market: "Home Runs", line: 0.5, side: "Over", sport: "MLB" },
    ],
    likes: 47,
    copies: 19,
    tag: "🔥 Hot",
  },
  {
    id: "c2",
    username: "PropzDaily",
    platform: "twitter",
    avatar: "PD",
    timeAgo: "5m ago",
    sport: "MLB",
    picks: [
      { player: "Shohei Ohtani", team: "LAD", market: "Total Bases", line: 2.5, side: "Over", sport: "MLB" },
      { player: "Mookie Betts", team: "LAD", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
      { player: "Mike Trout", team: "LAA", market: "Hits", line: 0.5, side: "Over", sport: "MLB" },
    ],
    likes: 83,
    copies: 41,
    tag: "✅ Capper",
  },
  {
    id: "c3",
    username: "MLB_Edges",
    platform: "discord",
    avatar: "ME",
    timeAgo: "8m ago",
    sport: "MLB",
    picks: [
      { player: "Gerrit Cole", team: "NYY", market: "Strikeouts", line: 7.5, side: "Over", sport: "MLB" },
      { player: "Blake Snell", team: "LAD", market: "Strikeouts", line: 6.5, side: "Over", sport: "MLB" },
    ],
    likes: 31,
    copies: 12,
  },
  {
    id: "c4",
    username: "BetViewPro",
    platform: "betview",
    avatar: "BV",
    timeAgo: "11m ago",
    sport: "MLB",
    picks: [
      { player: "Julio Rodriguez", team: "SEA", market: "Stolen Bases", line: 0.5, side: "Over", sport: "MLB" },
      { player: "Corey Seager", team: "TEX", market: "RBI", line: 0.5, side: "Over", sport: "MLB" },
    ],
    likes: 22,
    copies: 8,
    tag: "📈 +ROI",
  },
  {
    id: "c5",
    username: "SlateKing99",
    platform: "reddit",
    avatar: "SK",
    timeAgo: "14m ago",
    sport: "Tennis",
    picks: [
      { player: "Jannik Sinner", team: "ITA", market: "Aces", line: 6.5, side: "Over", sport: "Tennis" },
      { player: "Carlos Alcaraz", team: "ESP", market: "Games Won", line: 9.5, side: "Over", sport: "Tennis" },
    ],
    likes: 38,
    copies: 16,
    tag: "🔥 Hot",
  },
  {
    id: "c6",
    username: "WimbledonInsider",
    platform: "twitter",
    avatar: "WI",
    timeAgo: "17m ago",
    sport: "Tennis",
    picks: [
      { player: "Aryna Sabalenka", team: "BLR", market: "Aces", line: 4.5, side: "Over", sport: "Tennis" },
      { player: "Coco Gauff", team: "USA", market: "Games Won", line: 8.5, side: "Over", sport: "Tennis" },
    ],
    likes: 29,
    copies: 11,
  },
  {
    id: "c7",
    username: "DFS_Commander",
    platform: "discord",
    avatar: "DC",
    timeAgo: "21m ago",
    sport: "MLB",
    picks: [
      { player: "Juan Soto", team: "NYY", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
      { player: "Bryce Harper", team: "PHI", market: "Total Bases", line: 1.5, side: "Over", sport: "MLB" },
      { player: "Pete Alonso", team: "NYM", market: "RBI", line: 0.5, side: "Over", sport: "MLB" },
    ],
    likes: 55,
    copies: 23,
    tag: "✅ Capper",
  },
  {
    id: "c8",
    username: "PropEdge_Fan",
    platform: "betview",
    avatar: "PF",
    timeAgo: "25m ago",
    sport: "MLB",
    picks: [
      { player: "Vladimir Guerrero Jr.", team: "TOR", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
      { player: "Bo Bichette", team: "TOR", market: "Hits", line: 0.5, side: "Over", sport: "MLB" },
    ],
    likes: 18,
    copies: 7,
  },
  {
    id: "c9",
    username: "GrassCourt_Guru",
    platform: "reddit",
    avatar: "GG",
    timeAgo: "29m ago",
    sport: "Tennis",
    picks: [
      { player: "Novak Djokovic", team: "SRB", market: "Aces", line: 7.5, side: "Over", sport: "Tennis" },
    ],
    likes: 44,
    copies: 20,
    tag: "📈 +ROI",
  },
  {
    id: "c10",
    username: "BrooklynSharps",
    platform: "twitter",
    avatar: "BS",
    timeAgo: "33m ago",
    sport: "MLB",
    picks: [
      { player: "Manny Machado", team: "SD", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
      { player: "Fernando Tatis Jr.", team: "SD", market: "Total Bases", line: 2.5, side: "Over", sport: "MLB" },
    ],
    likes: 36,
    copies: 14,
  },
  {
    id: "c11",
    username: "StatEdgePro",
    platform: "discord",
    avatar: "SE",
    timeAgo: "38m ago",
    sport: "MLB",
    picks: [
      { player: "Ronald Acuña Jr.", team: "ATL", market: "Stolen Bases", line: 0.5, side: "Over", sport: "MLB" },
      { player: "Ozzie Albies", team: "ATL", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
    ],
    likes: 27,
    copies: 10,
    tag: "🔥 Hot",
  },
  {
    id: "c12",
    username: "LineBreaker_V",
    platform: "betview",
    avatar: "LB",
    timeAgo: "44m ago",
    sport: "Tennis",
    picks: [
      { player: "Daniil Medvedev", team: "RUS", market: "Aces", line: 5.5, side: "Over", sport: "Tennis" },
      { player: "Jannik Sinner", team: "ITA", market: "Games Won", line: 10.5, side: "Over", sport: "Tennis" },
    ],
    likes: 33,
    copies: 13,
  },
];

// New entries that cycle in every 15s
const FRESH_POSTS: CommunityPost[] = [
  {
    id: "f1",
    username: "PrizePicks_King",
    platform: "twitter",
    avatar: "PP",
    timeAgo: "just now",
    sport: "MLB",
    picks: [
      { player: "Yordan Alvarez", team: "HOU", market: "Total Bases", line: 2.5, side: "Over", sport: "MLB" },
      { player: "Alex Bregman", team: "HOU", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
    ],
    likes: 12,
    copies: 4,
    tag: "🔥 Hot",
  },
  {
    id: "f2",
    username: "TennisBetAlgo",
    platform: "reddit",
    avatar: "TB",
    timeAgo: "just now",
    sport: "Tennis",
    picks: [
      { player: "Carlos Alcaraz", team: "ESP", market: "Aces", line: 8.5, side: "Over", sport: "Tennis" },
    ],
    likes: 8,
    copies: 3,
  },
  {
    id: "f3",
    username: "SmartMoneyMLB",
    platform: "discord",
    avatar: "SM",
    timeAgo: "just now",
    sport: "MLB",
    picks: [
      { player: "Freddie Freeman", team: "LAD", market: "RBI", line: 0.5, side: "Over", sport: "MLB" },
      { player: "Will Smith", team: "LAD", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
    ],
    likes: 15,
    copies: 6,
    tag: "✅ Capper",
  },
  {
    id: "f4",
    username: "EVPositive",
    platform: "betview",
    avatar: "EV",
    timeAgo: "just now",
    sport: "MLB",
    picks: [
      { player: "Gunnar Henderson", team: "BAL", market: "Hits", line: 1.5, side: "Over", sport: "MLB" },
      { player: "Adley Rutschman", team: "BAL", market: "RBI", line: 0.5, side: "Over", sport: "MLB" },
    ],
    likes: 9,
    copies: 2,
  },
];

// ─────────────────────────────────────────────
// Helper: platform color/icon
// ─────────────────────────────────────────────
const PLATFORM_META: Record<string, { label: string; bg: string; text: string }> = {
  reddit: { label: "Reddit", bg: "hsl(22 100% 52% / 0.15)", text: "hsl(22 100% 65%)" },
  twitter: { label: "Twitter/X", bg: "hsl(205 80% 55% / 0.15)", text: "hsl(205 80% 70%)" },
  discord: { label: "Discord", bg: "hsl(235 86% 65% / 0.15)", text: "hsl(235 86% 78%)" },
  betview: { label: "BetView", bg: "hsl(150 80% 45% / 0.15)", text: "hsl(150 80% 65%)" },
};

const SPORT_COLOR: Record<string, string> = {
  MLB: "hsl(4 90% 60%)",
  NBA: "hsl(33 100% 55%)",
  NHL: "hsl(200 90% 55%)",
  Tennis: "hsl(85 90% 55%)",
};

// ─────────────────────────────────────────────
// Format pick as PrizePicks line
// ─────────────────────────────────────────────
function formatPickText(pick: CommunityPick): string {
  return `${pick.player} ${pick.side} ${pick.line} ${pick.market}`;
}

function formatPostForCopy(post: CommunityPost): string {
  return post.picks.map(p => formatPickText(p)).join("\n");
}

// ─────────────────────────────────────────────
// CommunityCard component
// ─────────────────────────────────────────────
function CommunityCard({ post, isNew }: { post: CommunityPost; isNew?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { addToSlip } = useSlip();
  const { toast } = useToast();
  const platform = PLATFORM_META[post.platform];

  const handleCopy = async () => {
    const text = formatPostForCopy(post);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
    }
    setCopied(true);
    toast({ title: "Picks copied!", description: `${post.picks.length} pick${post.picks.length > 1 ? "s" : ""} ready to paste` });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAll = () => {
    post.picks.forEach(pick => {
      addToSlip({
        id: `${post.id}-${pick.player}`,
        player: pick.player,
        team: pick.team,
        market: pick.market,
        line: pick.line,
        side: pick.side,
        sport: pick.sport as any,
        confidence: 65,
        ev: 5.2,
      });
    });
    toast({ title: "Added to slip!", description: `${post.picks.length} picks added` });
  };

  return (
    <div
      data-testid={`community-card-${post.id}`}
      className={`rounded-xl border transition-all duration-300 ${
        isNew
          ? "border-[hsl(258_90%_66%/0.5)] shadow-[0_0_12px_hsl(258_90%_66%/0.15)]"
          : "border-border"
      }`}
      style={{ background: "hsl(222 47% 7%)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: platform.bg, color: platform.text }}
          >
            {post.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-foreground truncate">{post.username}</span>
              {post.tag && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: "hsl(258 90% 66% / 0.1)", color: "hsl(258 90% 75%)" }}>
                  {post.tag}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-[9px] px-1.5 py-px rounded-sm font-semibold"
                style={{ background: platform.bg, color: platform.text }}
              >
                {platform.label}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-px rounded-sm"
                style={{ background: `${SPORT_COLOR[post.sport]}22`, color: SPORT_COLOR[post.sport] }}>
                {post.sport}
              </span>
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />{post.timeAgo}
              </span>
            </div>
          </div>
        </div>
        {isNew && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 animate-pulse"
            style={{ background: "hsl(85 90% 55% / 0.15)", color: "hsl(85 90% 55%)" }}>
            NEW
          </span>
        )}
      </div>

      {/* Picks list */}
      <div className="px-4 pb-2 space-y-1">
        {post.picks.slice(0, expanded ? undefined : 2).map((pick, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg"
            style={{ background: "hsl(222 47% 10%)" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] text-muted-foreground font-mono w-3 shrink-0">{i + 1}.</span>
              <span className="text-xs font-semibold text-foreground truncate">{pick.player}</span>
              <span className="text-[10px] text-muted-foreground">{pick.team}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className={`text-[10px] font-bold px-1.5 py-px rounded ${
                pick.side === "Over" ? "text-lime-400 bg-lime-400/10" : "text-red-400 bg-red-400/10"
              }`}>
                {pick.side}
              </span>
              <span className="text-xs font-mono text-foreground">{pick.line}</span>
              <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">{pick.market}</span>
            </div>
          </div>
        ))}
        {post.picks.length > 2 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Show less" : `+${post.picks.length - 2} more`}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-border/50 mt-1">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>❤️ {post.likes}</span>
          <span>📋 {post.copies}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleAddAll}
            data-testid={`add-slip-${post.id}`}
          >
            <Plus className="w-3 h-3" /> Slip
          </Button>
          <Button
            size="sm"
            className="h-6 px-2.5 text-[10px] gap-1 font-semibold"
            style={{
              background: copied ? "hsl(150 80% 45% / 0.2)" : "hsl(258 90% 66% / 0.15)",
              color: copied ? "hsl(150 80% 65%)" : "hsl(258 90% 75%)",
              border: copied ? "1px solid hsl(150 80% 45% / 0.3)" : "1px solid hsl(258 90% 66% / 0.3)",
            }}
            onClick={handleCopy}
            data-testid={`copy-post-${post.id}`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy All"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AiPickCard component
// ─────────────────────────────────────────────
function AiPickCard({ pick, isNew }: { pick: AiPick; isNew?: boolean }) {
  const [copied, setCopied] = useState(false);
  const { addToSlip } = useSlip();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const edgeColor = {
    elite: { bg: "hsl(258 90% 66% / 0.15)", text: "hsl(258 90% 75%)", border: "hsl(258 90% 66% / 0.3)" },
    high:  { bg: "hsl(85 90% 55% / 0.12)",  text: "hsl(85 90% 55%)",  border: "hsl(85 90% 55% / 0.3)" },
    mid:   { bg: "hsl(200 90% 55% / 0.12)", text: "hsl(200 90% 65%)", border: "hsl(200 90% 55% / 0.3)" },
    low:   { bg: "hsl(215 20% 30% / 0.3)",  text: "hsl(215 20% 60%)", border: "hsl(215 20% 40% / 0.3)" },
  }[pick.edge] ?? { bg: "hsl(215 20% 30% / 0.3)", text: "hsl(215 20% 60%)", border: "hsl(215 20% 40% / 0.3)" };

  const pickText = `${pick.player} ${pick.side} ${pick.line} ${pick.market}`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(pickText); } catch {}
    setCopied(true);
    toast({ title: "AI Pick copied!", description: pickText });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSlip = () => {
    addToSlip({
      id: `ai-${pick.id}`,
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
      data-testid={`ai-pick-card-${pick.id}`}
      className={`rounded-xl border transition-all duration-300 ${
        isNew
          ? "border-[hsl(85_90%_55%/0.5)] shadow-[0_0_12px_hsl(85_90%_55%/0.15)]"
          : "border-border"
      }`}
      style={{ background: "hsl(222 47% 7%)" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 rounded-t-xl"
        style={{ background: edgeColor.bg, borderBottom: `1px solid ${edgeColor.border}` }}
      >
        <div className="flex items-center gap-1.5">
          <Bot className="w-3 h-3" style={{ color: edgeColor.text }} />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: edgeColor.text }}>
            PEMF AI · {pick.edge.toUpperCase()} EDGE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold" style={{ color: "hsl(85 90% 55%)" }}>
            +{pick.ev}% EV
          </span>
          <span className="text-[10px] font-bold" style={{ color: edgeColor.text }}>
            {pick.confidence}%
          </span>
          {isNew && (
            <span className="text-[9px] px-1.5 py-px rounded-full font-bold animate-pulse"
              style={{ background: "hsl(85 90% 55% / 0.2)", color: "hsl(85 90% 55%)" }}>
              NEW
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        {/* Sport badge */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] px-1.5 py-px rounded-sm font-bold"
            style={{ background: `${SPORT_COLOR[pick.sport] ?? "hsl(258 90% 66%)"}22`, color: SPORT_COLOR[pick.sport] ?? "hsl(258 90% 75%)" }}>
            {pick.sport}
          </span>
          {pick.category && (
            <span className="text-[9px] text-muted-foreground">{pick.category}</span>
          )}
        </div>

        {/* Player + pick */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-foreground leading-none">{pick.player}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{pick.team}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                pick.side === "Over" ? "text-lime-400 bg-lime-400/10" : "text-red-400 bg-red-400/10"
              }`}>{pick.side}</span>
              <span className="text-sm font-mono font-bold text-foreground">{pick.line}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{pick.market}</div>
          </div>
        </div>

        {/* Reasoning toggle */}
        {pick.reasoning && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
              AI reasoning
            </button>
            {expanded && (
              <div className="mt-1.5 p-2 rounded-lg text-[10px] text-muted-foreground leading-relaxed"
                style={{ background: "hsl(222 47% 10%)" }}>
                {pick.reasoning}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Zap className="w-3 h-3 text-lime-400" />
          <span>Auto-generated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleAddSlip}
            data-testid={`ai-add-slip-${pick.id}`}
          >
            <Plus className="w-3 h-3" /> Slip
          </Button>
          <Button
            size="sm"
            className="h-6 px-2.5 text-[10px] gap-1 font-semibold"
            style={{
              background: copied ? "hsl(150 80% 45% / 0.2)" : "hsl(85 90% 55% / 0.12)",
              color: copied ? "hsl(150 80% 65%)" : "hsl(85 90% 55%)",
              border: copied ? "1px solid hsl(150 80% 45% / 0.3)" : "1px solid hsl(85 90% 55% / 0.3)",
            }}
            onClick={handleCopy}
            data-testid={`ai-copy-${pick.id}`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function SocialFeedPage() {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(COMMUNITY_POOL.slice(0, 8));
  const [newCommunityIds, setNewCommunityIds] = useState<Set<string>>(new Set());
  const [newAiIds, setNewAiIds] = useState<Set<number>>(new Set());
  const [freshPoolIndex, setFreshPoolIndex] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [countdown, setCountdown] = useState(15);

  // ── AI picks from API ──
  const { data: rawAiPicks = [], refetch: refetchAi } = useQuery<AiPick[]>({
    queryKey: ["/api/picks"],
    queryFn: () => apiRequest("GET", "/api/picks?limit=20").then(r => r.json()),
    refetchInterval: 15000,
  });

  // Track newest AI picks (top 12, sorted by id desc)
  const aiPicks = rawAiPicks.slice(0, 12);

  // ── Countdown timer ──
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) return 15;
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Refresh cycle every 15s ──
  useEffect(() => {
    const interval = setInterval(() => {
      // Add a fresh community post at the top
      const freshPost = FRESH_POSTS[freshPoolIndex % FRESH_POSTS.length];
      const newId = freshPost.id + "-" + Date.now();
      const entry = { ...freshPost, id: newId, timeAgo: "just now" };

      setCommunityPosts(prev => {
        // Shift oldest post out, insert new one at top
        const updated = [entry, ...prev.slice(0, 9)];
        return updated;
      });

      setNewCommunityIds(ids => {
        const next = new Set(ids);
        next.add(newId);
        setTimeout(() => setNewCommunityIds(s => { const n = new Set(s); n.delete(newId); return n; }), 5000);
        return next;
      });

      setFreshPoolIndex(i => i + 1);
      setLastRefresh(Date.now());
      refetchAi();
    }, 15000);

    return () => clearInterval(interval);
  }, [freshPoolIndex, refetchAi]);

  // Mark newest AI picks
  const prevAiIdsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (!aiPicks.length) return;
    const currentIds = new Set(aiPicks.map(p => p.id));
    const added = aiPicks.filter(p => !prevAiIdsRef.current.has(p.id)).map(p => p.id);
    if (added.length > 0) {
      setNewAiIds(ids => {
        const next = new Set([...ids, ...added]);
        setTimeout(() => setNewAiIds(s => {
          const n = new Set(s);
          added.forEach(id => n.delete(id));
          return n;
        }), 5000);
        return next;
      });
    }
    prevAiIdsRef.current = currentIds;
  }, [aiPicks]);

  const timeAgo = useCallback((ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 10) return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "hsl(222 47% 5%)" }}>
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 border-b border-border backdrop-blur-sm"
        style={{ background: "hsl(222 47% 5% / 0.95)" }}>
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight" style={{ fontFamily: "Cabinet Grotesk, sans-serif" }}>
              Social Feed
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Community picks + AI predictions · refreshes every 15s
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Countdown pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "hsl(258 90% 66% / 0.1)", border: "1px solid hsl(258 90% 66% / 0.2)" }}>
              <RefreshCw className="w-3 h-3 animate-spin" style={{ color: "hsl(258 90% 75%)", animationDuration: "3s" }} />
              <span className="text-xs font-mono font-bold" style={{ color: "hsl(258 90% 75%)" }}>
                {countdown}s
              </span>
            </div>
            {/* Last refresh */}
            <div className="text-[10px] text-muted-foreground hidden sm:block">
              Updated {timeAgo(lastRefresh)}
            </div>
          </div>
        </div>
        {/* Column labels */}
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="flex items-center gap-2 px-6 py-2"
            style={{ background: "hsl(222 47% 7%)" }}>
            <Users className="w-3.5 h-3.5" style={{ color: "hsl(258 90% 75%)" }} />
            <span className="text-xs font-bold" style={{ color: "hsl(258 90% 75%)" }}>Community Feed</span>
            <span className="text-[9px] px-1.5 py-px rounded-full ml-1"
              style={{ background: "hsl(258 90% 66% / 0.1)", color: "hsl(258 90% 75%)" }}>
              Reddit · Twitter · Discord · BetView
            </span>
          </div>
          <div className="flex items-center gap-2 px-6 py-2"
            style={{ background: "hsl(222 47% 7%)" }}>
            <Bot className="w-3.5 h-3.5 text-lime-400" />
            <span className="text-xs font-bold text-lime-400">AI Picks</span>
            <span className="text-[9px] px-1.5 py-px rounded-full ml-1"
              style={{ background: "hsl(85 90% 55% / 0.1)", color: "hsl(85 90% 55%)" }}>
              PEMF Algorithm · Auto-generated
            </span>
          </div>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border min-h-[calc(100vh-120px)]">

        {/* ── Left: Community Feed ── */}
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          <div className="p-4 space-y-3">
            {communityPosts.map(post => (
              <CommunityCard
                key={post.id}
                post={post}
                isNew={newCommunityIds.has(post.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Right: AI Picks ── */}
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          <div className="p-4 space-y-3">
            {aiPicks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bot className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">AI is generating picks…</p>
                <p className="text-xs text-muted-foreground mt-1">Check back in a few seconds</p>
              </div>
            ) : (
              aiPicks.map(pick => (
                <AiPickCard
                  key={pick.id}
                  pick={pick}
                  isNew={newAiIds.has(pick.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
