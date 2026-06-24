import { Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Home, TrendingUp, Bookmark, Calendar, 
  ChevronRight, Zap, Circle
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/games", label: "Live Games", icon: Calendar },
  { href: "/saved", label: "Saved Picks", icon: Bookmark },
];

const SPORTS = [
  { href: "/mlb", label: "MLB", color: "text-red-400", dot: "bg-red-400" },
  { href: "/nba", label: "NBA", color: "text-orange-400", dot: "bg-orange-400" },
  { href: "/nhl", label: "NHL", color: "text-blue-400", dot: "bg-blue-400" },
  { href: "/tennis", label: "Tennis", color: "text-green-400", dot: "bg-green-400" },
];

export default function Sidebar() {
  const [location] = useHashLocation();

  const { data: summary } = useQuery({
    queryKey: ["/api/summary"],
    queryFn: () => apiRequest("GET", "/api/summary").then(r => r.json()),
    refetchInterval: 30000,
  });

  return (
    <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2Z" fill="#0A0A0F" stroke="none"/>
              <path d="M9 12l2 2 4-4" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm text-foreground leading-none" style={{fontFamily:'Cabinet Grotesk,sans-serif'}}>PropEdge</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">AI Intelligence</div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {summary && (
        <div className="px-4 py-3 border-b border-border grid grid-cols-2 gap-2">
          <div className="bg-amber-400/10 rounded-lg p-2 text-center">
            <div className="stat-number text-amber-400 text-base">{summary.winRate}%</div>
            <div className="text-[10px] text-muted-foreground">Win Rate</div>
          </div>
          <div className="bg-green-400/10 rounded-lg p-2 text-center">
            <div className="stat-number text-green-400 text-base">{summary.eliteCount}</div>
            <div className="text-[10px] text-muted-foreground">Elite Picks</div>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3 mb-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <a className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors cursor-pointer
                ${location === href ? "nav-active" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <Icon className="w-4 h-4" />
                {label}
              </a>
            </Link>
          ))}
        </div>

        {/* Sports */}
        <div className="px-3 mt-3">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Sports</div>
          {SPORTS.map(({ href, label, color, dot }) => (
            <Link key={href} href={href}>
              <a className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors cursor-pointer
                ${location === href ? "nav-active" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                  <span className={location === href ? "" : color}>{label}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </a>
            </Link>
          ))}
        </div>

        {/* Live indicator */}
        <div className="px-6 mt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="live-dot" />
            <span>AI generating picks</span>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground text-center">
          Auto-refreshes every 45s
        </div>
      </div>
    </aside>
  );
}
