import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard, Bookmark, CalendarDays,
  TrendingUp, ChevronRight, Activity, Users2
} from "lucide-react";

const NAV = [
  { href: "/",      label: "Dashboard",   icon: LayoutDashboard },
  { href: "/games", label: "Live Games",   icon: CalendarDays },
  { href: "/feed",  label: "Social Feed",  icon: Users2 },
  { href: "/saved", label: "Saved Picks",  icon: Bookmark },
];

const SPORTS = [
  { href: "/mlb",    label: "MLB",    emoji: "⚾", colorClass: "text-red-400",    dotColor: "bg-red-500",    glow: "hsl(4 90% 60%)" },
  { href: "/nba",    label: "NBA",    emoji: "🏀", colorClass: "text-orange-400", dotColor: "bg-orange-400", glow: "hsl(33 100% 55%)" },
  { href: "/nhl",    label: "NHL",    emoji: "🏒", colorClass: "text-sky-400",    dotColor: "bg-sky-400",    glow: "hsl(200 90% 55%)" },
  { href: "/tennis", label: "Tennis", emoji: "🎾", colorClass: "text-lime-400",   dotColor: "bg-lime-400",   glow: "hsl(85 90% 55%)" },
];

export default function Sidebar() {
  const [location] = useLocation();

  const { data: summary } = useQuery({
    queryKey: ["/api/summary"],
    queryFn: () => apiRequest("GET", "/api/summary").then(r => r.json()),
    refetchInterval: 30000,
  });

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0 h-full">
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(258 90% 66%), hsl(200 90% 55%))" }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="font-black text-sm text-foreground tracking-tight leading-none" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              PropEdge
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "hsl(258 90% 75%)" }}>AI Props Engine</div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {summary && (
        <div className="px-4 py-3 border-b border-border grid grid-cols-3 gap-2">
          <div className="rounded-lg p-2 text-center" style={{ background: "hsl(258 90% 66% / 0.08)" }}>
            <div className="stat-number text-sm" style={{ color: "hsl(258 90% 75%)" }}>{summary.winRate}%</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Win</div>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: "hsl(85 90% 55% / 0.08)" }}>
            <div className="stat-number text-sm text-lime-400">{summary.eliteCount}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Elite</div>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: "hsl(195 85% 55% / 0.08)" }}>
            <div className="stat-number text-sm text-sky-400">+{summary.avgEv}%</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">Avg EV</div>
          </div>
        </div>
      )}

      {/* ── Main nav ── */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 space-y-0.5 mb-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <a data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    active ? "nav-active" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </a>
              </Link>
            );
          })}
        </div>

        {/* ── Sport links ── */}
        <div className="px-3">
          <div className="px-3 mb-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sports</span>
          </div>
          <div className="space-y-0.5">
            {SPORTS.map(({ href, label, emoji, colorClass, dotColor }) => {
              const active = location === href;
              return (
                <Link key={href} href={href}>
                  <a data-testid={`sport-nav-${label.toLowerCase()}`}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      active ? "nav-active" : `text-muted-foreground hover:text-foreground hover:bg-secondary`
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{emoji}</span>
                      <span className={active ? "" : colorClass}>{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} opacity-70`} />
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
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
            <span>AI generating picks live</span>
          </div>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Activity className="w-3 h-3" />
          <span>Auto-refreshes every 45s</span>
        </div>
      </div>
    </aside>
  );
}
