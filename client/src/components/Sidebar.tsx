import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard, Bookmark, CalendarDays,
  ChevronRight, Activity, Users2, Brain, TrendingUp, Zap
} from "lucide-react";

const NAV = [
  { href: "/",            label: "Dashboard",     icon: LayoutDashboard, accent: "violet" },
  { href: "/predictions", label: "AI Predictions", icon: Brain,           accent: "lime" },
  { href: "/games",       label: "Live Games",     icon: CalendarDays,    accent: "cyan" },
  { href: "/feed",        label: "Social Feed",    icon: Users2,          accent: "violet" },
  { href: "/saved",       label: "Saved Picks",    icon: Bookmark,        accent: "violet" },
];

const SPORTS = [
  { href: "/mlb",    label: "MLB",    emoji: "⚾", hsl: "4 92% 62%",   dotClass: "bg-red-500" },
  { href: "/nba",    label: "NBA",    emoji: "🏀", hsl: "32 100% 56%", dotClass: "bg-orange-400" },
  { href: "/nhl",    label: "NHL",    emoji: "🏒", hsl: "198 92% 58%", dotClass: "bg-sky-400" },
  { href: "/tennis", label: "Tennis", emoji: "🎾", hsl: "82 92% 56%",  dotClass: "bg-lime-400" },
];

const ACCENT_HOVER: Record<string, string> = {
  violet: "hover:bg-[hsl(260_95%_68%/0.08)] hover:text-[hsl(260_95%_82%)]",
  lime:   "hover:bg-[hsl(82_92%_56%/0.08)]  hover:text-[hsl(82_92%_62%)]",
  cyan:   "hover:bg-[hsl(193_88%_57%/0.08)] hover:text-[hsl(193_88%_67%)]",
};

export default function Sidebar() {
  const [location] = useLocation();

  const { data: summary } = useQuery({
    queryKey: ["/api/summary"],
    queryFn: () => apiRequest("GET", "/api/summary").then(r => r.json()),
    refetchInterval: 30000,
  });

  return (
    <aside className="w-64 flex flex-col shrink-0 h-full relative overflow-hidden"
      style={{ background: "hsl(220 40% 5%)", borderRight: "1px solid hsl(220 28% 11%)" }}>

      {/* Ambient glow behind logo */}
      <div className="absolute top-0 left-0 w-full h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 120% 80% at 40% 0%, hsl(260 95% 68% / 0.12) 0%, transparent 70%)" }} />

      {/* ── Logo ── */}
      <div className="relative px-5 py-5 border-b" style={{ borderColor: "hsl(220 28% 11%)" }}>
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative"
            style={{ background: "linear-gradient(135deg, hsl(260 95% 58%), hsl(280 90% 62%))", boxShadow: "0 4px 20px hsl(260 95% 68% / 0.4)" }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* glow ring */}
            <div className="absolute inset-0 rounded-2xl animate-ping"
              style={{ background: "hsl(260 95% 68% / 0.15)", animationDuration: "2.5s" }} />
          </div>
          <div>
            <div className="font-black text-[15px] tracking-tight leading-none"
              style={{ background: "linear-gradient(135deg, hsl(260 95% 82%), hsl(82 92% 66%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              PropEdge
            </div>
            <div className="text-[10px] mt-0.5 font-semibold" style={{ color: "hsl(260 95% 72%)" }}>
              v3.0 · AI Props Engine
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {summary && (
        <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(220 28% 11%)" }}>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-2.5 text-center border"
              style={{ background: "hsl(260 95% 68% / 0.08)", borderColor: "hsl(260 95% 68% / 0.2)" }}>
              <div className="stat-number text-sm" style={{ color: "hsl(260 95% 78%)" }}>{summary.winRate}%</div>
              <div className="label-xs mt-0.5" style={{ color: "hsl(260 95% 60% / 0.7)" }}>Win</div>
            </div>
            <div className="rounded-xl p-2.5 text-center border"
              style={{ background: "hsl(82 92% 56% / 0.08)", borderColor: "hsl(82 92% 56% / 0.2)" }}>
              <div className="stat-number text-sm" style={{ color: "hsl(82 92% 62%)" }}>{summary.eliteCount}</div>
              <div className="label-xs mt-0.5" style={{ color: "hsl(82 92% 50% / 0.7)" }}>Elite</div>
            </div>
            <div className="rounded-xl p-2.5 text-center border"
              style={{ background: "hsl(193 88% 57% / 0.08)", borderColor: "hsl(193 88% 57% / 0.2)" }}>
              <div className="stat-number text-sm" style={{ color: "hsl(193 88% 67%)" }}>+{summary.avgEv}%</div>
              <div className="label-xs mt-0.5" style={{ color: "hsl(193 88% 50% / 0.7)" }}>EV</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main nav ── */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-0.5 mb-5">
          {NAV.map(({ href, label, icon: Icon, accent }) => {
            const active = location === href;
            const hoverClass = ACCENT_HOVER[accent] ?? ACCENT_HOVER.violet;
            return (
              <Link key={href} href={href}>
                <a data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer select-none ${
                    active ? "nav-active" : `text-muted-foreground ${hoverClass}`
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {label === "AI Predictions" && (
                    <span className="ml-auto text-[9px] px-1.5 py-px rounded-full font-black"
                      style={{ background: "hsl(82 92% 56% / 0.15)", color: "hsl(82 92% 62%)", border: "1px solid hsl(82 92% 56% / 0.25)" }}>
                      NEW
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 mb-3 divider-gradient" />

        {/* ── Sport links ── */}
        <div className="px-3">
          <div className="px-3 mb-2">
            <span className="label-xs text-muted-foreground">Sports</span>
          </div>
          <div className="space-y-0.5">
            {SPORTS.map(({ href, label, emoji, hsl, dotClass }) => {
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
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} opacity-80`} />
                      <ChevronRight className="w-3.5 h-3.5 opacity-35" />
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Live indicator ── */}
        <div className="px-6 mt-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="live-dot" />
            <span className="font-medium">AI generating live</span>
          </div>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "hsl(220 28% 11%)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span>Auto-refreshes · 15s</span>
          </div>
          <div className="text-[9px] font-bold px-1.5 py-px rounded-full"
            style={{ background: "hsl(82 92% 56% / 0.1)", color: "hsl(82 92% 56%)", border: "1px solid hsl(82 92% 56% / 0.2)" }}>
            LIVE
          </div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 100% 80% at 60% 100%, hsl(82 92% 56% / 0.06) 0%, transparent 70%)" }} />
    </aside>
  );
}
