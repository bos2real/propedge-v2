import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Trophy, TrendingUp, TrendingDown, Minus, Zap,
  Flame, Crown, Star, Shield, Award, Target,
} from "lucide-react";

interface LeaderboardUser {
  rank: number; username: string; avatar: string; points: number;
  streak: number; winRate: number; totalPicks: number; badge: string;
  tier: "Legend" | "Diamond" | "Gold" | "Silver" | "Bronze";
  sport: string; change: number; isYou?: boolean;
}

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; icon: any; glow: string }> = {
  Legend:  { bg: "hsl(263 100% 70% / 0.15)", text: "hsl(263 100% 75%)",  border: "hsl(263 100% 70% / 0.5)",  icon: Crown,  glow: "hsl(263 100% 70%)" },
  Diamond: { bg: "hsl(190 92% 60% / 0.12)",  text: "hsl(190 92% 65%)",   border: "hsl(190 92% 60% / 0.4)",   icon: Star,   glow: "hsl(190 92% 60%)" },
  Gold:    { bg: "hsl(38 100% 65% / 0.12)",   text: "hsl(38 100% 70%)",   border: "hsl(38 100% 65% / 0.35)",  icon: Trophy, glow: "hsl(38 100% 65%)" },
  Silver:  { bg: "hsl(220 15% 55% / 0.10)",   text: "hsl(220 15% 70%)",   border: "hsl(220 15% 55% / 0.3)",   icon: Shield, glow: "hsl(220 15% 55%)" },
  Bronze:  { bg: "hsl(20 70% 55% / 0.10)",    text: "hsl(20 70% 65%)",    border: "hsl(20 70% 55% / 0.3)",    icon: Award,  glow: "hsl(20 70% 55%)" },
};

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const SPORTS = ["All", "MLB", "NBA", "NHL", "Tennis"];

function Avatar({ initials, tier, isYou }: { initials: string; tier: string; isYou?: boolean }) {
  const style = TIER_STYLES[tier] || TIER_STYLES.Bronze;
  return (
    <div className="relative w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
      style={{
        background: style.bg, border: `2px solid ${style.border}`,
        boxShadow: isYou ? `0 0 16px ${style.glow}60` : `0 0 8px ${style.glow}30`,
        color: style.text,
      }}>
      {initials}
      {isYou && (
        <span className="absolute -bottom-1 -right-1 text-[9px] bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center leading-none font-black">
          ★
        </span>
      )}
    </div>
  );
}

function WinRateBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? "hsl(80 96% 58%)" : rate >= 60 ? "hsl(190 92% 60%)" : rate >= 50 ? "hsl(263 100% 72%)" : "hsl(38 100% 65%)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(220 20% 14%)", minWidth: "50px" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: color }} />
      </div>
      <span className="text-xs font-black w-9 text-right" style={{ color }}>{rate}%</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [sport, setSport] = useState("All");
  const [tab, setTab] = useState<"global" | "movers" | "streaks">("global");

  const { data: users = [], isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard", sport],
    queryFn: () => apiRequest("GET", sport === "All" ? "/api/leaderboard" : `/api/leaderboard?sport=${sport}`).then(r => r.json()),
    refetchInterval: 30000,
  });

  const you = users.find(u => u.isYou);
  const top3 = users.slice(0, 3);
  const movers = [...users].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 8);
  const streakers = [...users].sort((a, b) => b.streak - a.streak).slice(0, 8);

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6" style={{ background: "hsl(216 42% 3%)" }}>

      {/* Header */}
      <div className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(38 100% 20%) 0%, hsl(216 42% 6%) 100%)", border: "1px solid hsl(38 100% 65% / 0.25)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(38 100% 65%), transparent)", transform: "translate(-40%, -40%)" }} />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-8" style={{ background: "radial-gradient(circle, hsl(263 100% 70%), transparent)", transform: "translate(30%, 30%)" }} />
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} style={{ color: "hsl(38 100% 65%)" }} />
              <span className="label-caps" style={{ color: "hsl(38 100% 65%)" }}>Zero-Money Social Leaderboard</span>
            </div>
            <h1 className="text-xl font-black text-white mb-1">Global Rankings</h1>
            <p className="text-sm" style={{ color: "hsl(220 15% 55%)" }}>
              {users.length} pickers · All picks free-to-play · Updates live
            </p>
          </div>
          {you && (
            <div className="rounded-2xl p-4 text-center"
              style={{ background: "hsl(263 100% 70% / 0.12)", border: "1px solid hsl(263 100% 70% / 0.3)" }}>
              <div className="label-caps text-[9px] mb-0.5" style={{ color: "hsl(263 100% 70% / 0.7)" }}>YOUR RANK</div>
              <div className="text-3xl font-black" style={{ color: "hsl(263 100% 72%)" }}>#{you.rank}</div>
              <div className="text-[11px] mt-1" style={{ color: "hsl(220 15% 50%)" }}>
                {you.points.toLocaleString()} pts · {you.winRate}% win
              </div>
              {you.change !== 0 && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  {you.change > 0
                    ? <TrendingUp size={11} style={{ color: "hsl(80 96% 58%)" }} />
                    : <TrendingDown size={11} style={{ color: "hsl(5 96% 64%)" }} />
                  }
                  <span className="text-[10px] font-bold"
                    style={{ color: you.change > 0 ? "hsl(80 96% 58%)" : "hsl(5 96% 64%)" }}>
                    {you.change > 0 ? "+" : ""}{you.change} today
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Podium — top 3 */}
      {!isLoading && top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[top3[1], top3[0], top3[2]].map((u, idx) => {
            const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const style = TIER_STYLES[u.tier] || TIER_STYLES.Bronze;
            const heights = ["h-24", "h-32", "h-20"];
            const TierIcon = style.icon;
            return (
              <div key={u.username} className="flex flex-col items-center gap-2">
                <Avatar initials={u.avatar} tier={u.tier} />
                <div className="text-center">
                  <div className="font-bold text-xs text-white truncate max-w-[90px]">{u.username}</div>
                  <div className="text-[10px]" style={{ color: "hsl(220 15% 50%)" }}>{u.points.toLocaleString()} pts</div>
                </div>
                <div className={`w-full ${heights[idx]} rounded-t-xl flex flex-col items-center justify-end pb-3 relative`}
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  <div className="text-2xl mb-1">{RANK_MEDALS[actualRank]}</div>
                  <TierIcon size={14} style={{ color: style.text }} />
                  <div className="label-caps text-[9px] mt-0.5" style={{ color: style.text }}>{u.tier}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters + Tabs */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {SPORTS.map(s => (
            <button key={s} onClick={() => setSport(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={sport === s ? { background: "hsl(38 100% 65%)", color: "#000" } : { background: "hsl(220 20% 10%)", color: "hsl(220 15% 55%)", border: "1px solid hsl(220 20% 18%)" }}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1" style={{ background: "hsl(220 20% 8%)", padding: "4px", borderRadius: "10px" }}>
          {([
            { id: "global", label: "Rankings", icon: Trophy },
            { id: "movers", label: "Movers", icon: TrendingUp },
            { id: "streaks", label: "Streaks", icon: Flame },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={tab === t.id ? { background: "hsl(38 100% 65%)", color: "#000" } : { color: "hsl(220 15% 55%)" }}>
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(220 20% 14%)" }}>
          {/* Table header */}
          <div className="grid items-center px-4 py-2.5"
            style={{ background: "hsl(220 20% 8%)", gridTemplateColumns: "40px 1fr 80px 80px 60px 60px" }}>
            {["#", "Player", "Points", "Win Rate", "Streak", "Picks"].map(h => (
              <div key={h} className="label-caps text-[9px]" style={{ color: "hsl(220 15% 35%)" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {(tab === "global" ? users : tab === "movers" ? movers : streakers).map((u) => {
            const ts = TIER_STYLES[u.tier] || TIER_STYLES.Bronze;
            return (
              <div key={u.username}
                data-testid={`leaderboard-row-${u.rank}`}
                className="grid items-center px-4 py-3 transition-all hover:bg-white/[0.02] cursor-default"
                style={{
                  gridTemplateColumns: "40px 1fr 80px 80px 60px 60px",
                  borderTop: "1px solid hsl(220 20% 11%)",
                  background: u.isYou ? "hsl(263 100% 70% / 0.05)" : "transparent",
                  outline: u.isYou ? "1px solid hsl(263 100% 70% / 0.2)" : "none",
                }}>
                {/* Rank */}
                <div className="font-black text-sm" style={{ color: u.rank <= 3 ? "hsl(38 100% 65%)" : "hsl(220 15% 50%)" }}>
                  {RANK_MEDALS[u.rank] || `#${u.rank}`}
                </div>

                {/* Player info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar initials={u.avatar} tier={u.tier} isYou={u.isYou} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white truncate">{u.username}</span>
                      {u.isYou && <span className="label-caps text-[8px] px-1 rounded" style={{ background: "hsl(263 100% 70% / 0.2)", color: "hsl(263 100% 72%)" }}>YOU</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px]" style={{ color: ts.text }}>{u.badge}</span>
                      <span className="text-[9px]" style={{ color: "hsl(220 15% 35%)" }}>· {u.sport}</span>
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="font-black text-sm" style={{ color: "hsl(80 96% 58%)" }}>
                  {u.points.toLocaleString()}
                </div>

                {/* Win rate */}
                <div><WinRateBar rate={u.winRate} /></div>

                {/* Streak */}
                <div className="flex items-center gap-1">
                  {u.streak >= 5 ? <Flame size={12} style={{ color: "hsl(5 96% 64%)" }} /> :
                   u.streak >= 3 ? <Zap size={12} style={{ color: "hsl(80 96% 58%)" }} /> :
                   <Target size={12} style={{ color: "hsl(220 15% 45%)" }} />}
                  <span className="font-bold text-xs"
                    style={{ color: u.streak >= 5 ? "hsl(5 96% 64%)" : u.streak >= 3 ? "hsl(80 96% 58%)" : "hsl(220 15% 55%)" }}>
                    {u.streak}W
                  </span>
                </div>

                {/* Picks + change */}
                <div>
                  <div className="text-xs font-semibold text-white">{u.totalPicks}</div>
                  {u.change !== 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {u.change > 0
                        ? <TrendingUp size={9} style={{ color: "hsl(80 96% 58%)" }} />
                        : <TrendingDown size={9} style={{ color: "hsl(5 96% 64%)" }} />
                      }
                      <span className="text-[9px]"
                        style={{ color: u.change > 0 ? "hsl(80 96% 58%)" : "hsl(5 96% 64%)" }}>
                        {u.change > 0 ? "+" : ""}{u.change}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tier legend */}
      <div className="rounded-2xl p-4" style={{ background: "hsl(220 20% 7%)", border: "1px solid hsl(220 20% 13%)" }}>
        <div className="label-caps text-[10px] mb-3" style={{ color: "hsl(220 15% 35%)" }}>TIER SYSTEM</div>
        <div className="flex flex-wrap gap-3">
          {(["Legend", "Diamond", "Gold", "Silver", "Bronze"] as const).map(t => {
            const s = TIER_STYLES[t];
            const TI = s.icon;
            return (
              <div key={t} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <TI size={14} style={{ color: s.text }} />
                <span className="text-xs font-bold" style={{ color: s.text }}>{t}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
