import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard, Bookmark, CalendarDays, ChevronRight,
  Activity, Users2, Brain, TrendingUp, Zap, Trophy,
  Swords, BarChart3, Building2
} from "lucide-react";

const NAV = [
  { href: "/",            label: "Dashboard",      icon: LayoutDashboard, color: "hsl(263 100% 72%)", hoverBg: "hsl(263 100% 70% / 0.08)" },
  { href: "/predictions", label: "AI Predictions", icon: Brain,           color: "hsl(80 96% 62%)",  hoverBg: "hsl(80 96% 58% / 0.08)",  badge: "HOT" },
  { href: "/games",       label: "Live Games",     icon: CalendarDays,    color: "hsl(190 92% 64%)", hoverBg: "hsl(190 92% 60% / 0.08)" },
  { href: "/feed",        label: "Social Feed",    icon: Users2,          color: "hsl(315 92% 70%)", hoverBg: "hsl(315 92% 65% / 0.08)" },
  { href: "/teams",      label: "Teams",          icon: Building2,       color: "hsl(196 96% 62%)", hoverBg: "hsl(196 96% 60% / 0.08)", badge: "NEW" },
  { href: "/saved",       label: "Saved Picks",    icon: Bookmark,        color: "hsl(38 100% 66%)", hoverBg: "hsl(38 100% 60% / 0.08)" },
  { href: "/fantasy",     label: "Fantasy AI",     icon: Swords,          color: "hsl(263 100% 72%)", hoverBg: "hsl(263 100% 70% / 0.08)", badge: "NEW" },
  { href: "/leaderboard", label: "Leaderboard",    icon: Trophy,          color: "hsl(38 100% 66%)", hoverBg: "hsl(38 100% 60% / 0.08)", badge: "NEW" },
  { href: "/exchange",    label: "Prop Exchange",  icon: BarChart3,       color: "hsl(190 92% 64%)", hoverBg: "hsl(190 92% 60% / 0.08)", badge: "NEW" },
];

const SPORTS = [
  { href: "/mlb",    label: "MLB",    emoji: "⚾", hsl: "5 96% 64%",   glow: "hsl(5 96% 64% / 0.3)" },
  { href: "/nba",    label: "NBA",    emoji: "🏀", hsl: "30 100% 58%", glow: "hsl(30 100% 58% / 0.3)" },
  { href: "/nhl",    label: "NHL",    emoji: "🏒", hsl: "196 96% 60%", glow: "hsl(196 96% 60% / 0.3)" },
  { href: "/tennis", label: "Tennis", emoji: "🎾", hsl: "80 96% 58%",  glow: "hsl(80 96% 58% / 0.3)" },
];

export default function Sidebar() {
  const [location] = useLocation();

  const { data: summary } = useQuery({
    queryKey: ["/api/summary"],
    queryFn: () => apiRequest("GET", "/api/summary").then(r => r.json()),
    refetchInterval: 30000,
  });

  return (
    <aside className="w-64 flex flex-col shrink-0 h-full relative overflow-hidden"
      style={{
        background: "hsl(218 42% 4%)",
        borderRight: "1px solid hsl(218 28% 10%)",
      }}>

      {/* ── Top ambient orb ── */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(263 100% 70% / 0.15) 0%, transparent 70%)" }} />

      {/* ── Logo ── */}
      <div className="relative px-5 pt-5 pb-4 border-b" style={{ borderColor: "hsl(218 28% 10%)" }}>
        <div className="flex items-center gap-3">
          {/* Logo mark — animated gradient border */}
          <div className="relative w-11 h-11 shrink-0">
            <div className="absolute inset-0 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, hsl(263 100% 62%), hsl(190 96% 55%), hsl(80 96% 52%))",
                padding: "1.5px",
                animation: "gradient-shift 3s ease infinite",
                backgroundSize: "200% 200%",
              }}>
              <div className="w-full h-full rounded-[14px]"
                style={{ background: "hsl(218 42% 6%)" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="hsl(263,100%,78%)" />
                    <stop offset="100%" stopColor="hsl(80,96%,62%)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl -z-10"
              style={{ boxShadow: "0 0 24px hsl(263 100% 70% / 0.35)" }} />
          </div>
          <div>
            <div className="font-black text-[16px] tracking-tight leading-none text-gradient">
              PropEdge
            </div>
            <div className="text-[10px] mt-0.5 font-bold" style={{ color: "hsl(263 100% 70% / 0.65)" }}>
              v4.0 · AI Props Engine
            </div>
          </div>
        </div>
      </div>

      {/* ── Live stats strip ── */}
      {summary && (
        <div className="px-3 py-3 border-b" style={{ borderColor: "hsl(218 28% 10%)" }}>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { val: `${summary.winRate}%`, label: "Win",   hsl: "263 100% 70%", icon: Trophy },
              { val: String(summary.eliteCount), label: "Elite", hsl: "80 96% 58%",  icon: Zap },
              { val: `+${summary.avgEv}%`, label: "EV",    hsl: "190 92% 60%", icon: TrendingUp },
            ].map(({ val, label, hsl, icon: Icon }) => (
              <div key={label} className="rounded-xl p-2.5 text-center border flex flex-col items-center gap-1"
                style={{
                  background: `hsl(${hsl} / 0.07)`,
                  borderColor: `hsl(${hsl} / 0.2)`,
                  boxShadow: `0 0 12px hsl(${hsl} / 0.06)`,
                }}>
                <Icon className="w-3 h-3" style={{ color: `hsl(${hsl})` }} />
                <div className="stat-number text-sm leading-none" style={{ color: `hsl(${hsl})`, textShadow: `0 0 10px hsl(${hsl} / 0.4)` }}>{val}</div>
                <div className="label-caps" style={{ color: `hsl(${hsl} / 0.55)` }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main nav ── */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-0.5 mb-5">
          {NAV.map(({ href, label, icon: Icon, color, hoverBg, badge }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <a data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none group ${
                    active ? "nav-active" : "text-muted-foreground"
                  }`}
                  style={!active ? { ["--hover-bg" as any]: hoverBg } : undefined}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = color; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = ""; } }}
                >
                  <Icon className="w-4 h-4 shrink-0" style={active ? { color } : {}} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="text-[8px] px-1.5 py-px rounded-full font-black"
                      style={{ background: "hsl(80 96% 58% / 0.18)", color: "hsl(80 96% 66%)", border: "1px solid hsl(80 96% 58% / 0.3)", boxShadow: "0 0 6px hsl(80 96% 58% / 0.2)" }}>
                      {badge}
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 mb-4 divider" />

        {/* ── Sports ── */}
        <div className="px-3">
          <div className="px-3 mb-2.5">
            <span className="label-caps">Sports</span>
          </div>
          <div className="space-y-0.5">
            {SPORTS.map(({ href, label, emoji, hsl, glow }) => {
              const active = location === href;
              return (
                <Link key={href} href={href}>
                  <a data-testid={`sport-nav-${label.toLowerCase()}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      active ? "nav-active" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{emoji}</span>
                      <span style={active ? {} : { color: `hsl(${hsl})` }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${hsl})`, boxShadow: active ? glow : undefined }} />
                      <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live pulse indicator */}
        <div className="px-6 mt-5 flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-xs font-semibold" style={{ color: "hsl(80 96% 58% / 0.7)" }}>AI generating live</span>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "hsl(218 28% 10%)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" style={{ color: "hsl(218 18% 46%)" }} />
            <span className="text-[10px] text-muted-foreground">Refreshes every 15s</span>
          </div>
          <div className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background: "hsl(80 96% 58% / 0.12)", color: "hsl(80 96% 62%)", border: "1px solid hsl(80 96% 58% / 0.25)", boxShadow: "0 0 8px hsl(80 96% 58% / 0.15)" }}>
            LIVE
          </div>
        </div>
      </div>

      {/* ── Bottom ambient orb ── */}
      <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(80 96% 58% / 0.08) 0%, transparent 70%)" }} />
    </aside>
  );
}
