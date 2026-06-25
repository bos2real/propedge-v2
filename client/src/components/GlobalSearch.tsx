import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Search, X, Users, Building2, Zap, AlertTriangle, ChevronRight } from "lucide-react";

interface SearchPlayer {
  name: string; position: string; number: string; age: number; photoUrl: string;
  keyStats: Record<string, string>; role: string;
  injuryStatus?: string; propTip?: string;
  teamId: string; teamName: string; teamCity: string; teamAbbr: string;
  sport: string; teamColor: string; teamEmoji: string; type: "player";
}
interface SearchTeam {
  id: string; name: string; city: string; abbreviation: string;
  sport: string; division: string; primaryColor: string; logoEmoji: string;
  record: { wins: number; losses: number; pct?: number; streak?: string };
  standing: string; bettingTrend: string; propHotspot: string; type: "team";
}
interface SearchResults {
  teams: SearchTeam[]; players: SearchPlayer[];
  query: string; total: number;
}

const ROLE_COLORS: Record<string, string> = {
  Star: "hsl(80 96% 58%)", Starter: "hsl(190 92% 60%)",
  "Role Player": "hsl(263 100% 72%)", Bench: "hsl(220 15% 50%)",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}


function PlayerResultRow({ player, index, onClick }: { player: SearchPlayer; index: number; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const roleColor = ROLE_COLORS[player.role] || "hsl(220 15% 50%)";
  return (
    <button
      onClick={onClick}
      data-testid={`search-player-${index}`}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/[0.03] group"
      style={{ borderBottom: "1px solid hsl(220 20% 10%)" }}>
      <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ background: "hsl(220 20% 12%)" }}>
        {!imgErr
          ? <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
          : <span className="text-base">👤</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-sm text-white">{player.name}</span>
          <span className="label-caps text-[9px] px-1 rounded"
            style={{ background: `${roleColor}15`, color: roleColor }}>
            {player.role === "Star" ? "⭐" : player.role}
          </span>
          {player.injuryStatus && (
            <span className="flex items-center gap-0.5 label-caps text-[9px]" style={{ color: "hsl(38 100% 65%)" }}>
              <AlertTriangle size={8} />
              {player.injuryStatus}
            </span>
          )}
        </div>
        <div className="text-[10px] mt-0.5 flex items-center gap-1.5" style={{ color: "hsl(220 15% 45%)" }}>
          <span>{player.teamEmoji} {player.teamCity} {player.teamName}</span>
          <span>·</span>
          <span>#{player.number} {player.position}</span>
          <span>·</span>
          <span>{player.sport}</span>
        </div>
        <div className="flex gap-2 mt-1 flex-wrap">
          {Object.entries(player.keyStats).slice(0, 3).map(([k, v]) => (
            <span key={k} className="text-[9px]">
              <span style={{ color: "hsl(220 15% 40%)" }}>{k} </span>
              <span className="font-bold text-white">{v}</span>
            </span>
          ))}
        </div>
        {player.propTip && (
          <div className="flex items-center gap-1 mt-1">
            <Zap size={9} style={{ color: "hsl(263 100% 72%)" }} />
            <span className="text-[9px]" style={{ color: "hsl(263 100% 65%)" }}>{player.propTip}</span>
          </div>
        )}
      </div>
      <ChevronRight size={13} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: "hsl(220 15% 35%)" }} />
    </button>
  );
}

export default function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 280);

  const { data, isFetching } = useQuery<SearchResults>({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: () => apiRequest("GET", `/api/search?q=${encodeURIComponent(debouncedQuery)}`).then(r => r.json()),
    enabled: debouncedQuery.length >= 2,
    staleTime: 10000,
  });

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut: / to focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleTeamClick = (teamId: string) => {
    setOpen(false);
    setQuery("");
    navigate(`/teams`);
    // Store selected team id in sessionStorage workaround — use a custom event instead
    window.dispatchEvent(new CustomEvent("propedge:openTeam", { detail: { teamId } }));
    onClose?.();
  };

  const handlePlayerClick = (player: SearchPlayer) => {
    setOpen(false);
    setQuery("");
    navigate(`/teams`);
    window.dispatchEvent(new CustomEvent("propedge:openTeam", { detail: { teamId: player.teamId } }));
    onClose?.();
  };

  const hasResults = data && data.total > 0;
  const showDropdown = open && query.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input */}
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 pointer-events-none z-10"
          style={{ color: open ? "hsl(263 100% 72%)" : "hsl(220 15% 40%)" }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search teams, players… ( / )"
          data-testid="global-search-input"
          className="w-full pl-8 pr-8 py-2 text-xs rounded-xl outline-none transition-all"
          style={{
            background: open ? "hsl(220 20% 11%)" : "hsl(220 20% 9%)",
            border: open ? "1px solid hsl(263 100% 70% / 0.4)" : "1px solid hsl(220 20% 16%)",
            color: "hsl(220 15% 85%)",
            boxShadow: open ? "0 0 0 3px hsl(263 100% 70% / 0.08)" : "none",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); inputRef.current?.blur(); }}
            className="absolute right-2.5 z-10 transition-opacity hover:opacity-80">
            <X size={12} style={{ color: "hsl(220 15% 45%)" }} />
          </button>
        )}
        {isFetching && !query && null}
        {isFetching && (
          <div className="absolute right-8 z-10">
            <div className="w-3 h-3 rounded-full border-2 animate-spin"
              style={{ borderColor: "hsl(263 100% 70% / 0.3)", borderTopColor: "hsl(263 100% 70%)" }} />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[9999] rounded-2xl overflow-hidden shadow-2xl max-h-[70vh] overflow-y-auto"
          style={{
            background: "hsl(218 35% 7%)",
            border: "1px solid hsl(263 100% 70% / 0.25)",
            boxShadow: "0 24px 64px hsl(216 42% 2% / 0.8), 0 0 0 1px hsl(263 100% 70% / 0.1)",
          }}>

          {/* Loading state */}
          {isFetching && !data && (
            <div className="px-4 py-6 flex items-center gap-2 justify-center">
              <div className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: "hsl(263 100% 70% / 0.2)", borderTopColor: "hsl(263 100% 70%)" }} />
              <span className="text-xs" style={{ color: "hsl(220 15% 45%)" }}>Searching…</span>
            </div>
          )}

          {/* No results */}
          {!isFetching && data && data.total === 0 && (
            <div className="px-4 py-6 text-center">
              <Search size={24} className="mx-auto mb-2" style={{ color: "hsl(220 15% 28%)" }} />
              <p className="text-sm font-semibold" style={{ color: "hsl(220 15% 40%)" }}>No results for "{query}"</p>
              <p className="text-[11px] mt-1" style={{ color: "hsl(220 15% 30%)" }}>Try a player name, team city, or position</p>
            </div>
          )}

          {/* Teams section */}
          {data && data.teams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2.5 sticky top-0"
                style={{ background: "hsl(218 35% 7%)", borderBottom: "1px solid hsl(220 20% 12%)" }}>
                <Building2 size={11} style={{ color: "hsl(196 96% 62%)" }} />
                <span className="label-caps text-[9px]" style={{ color: "hsl(196 96% 62%)" }}>
                  TEAMS · {data.teams.length}
                </span>
              </div>
              {data.teams.map(team => (
                <button key={team.id}
                  onClick={() => handleTeamClick(team.id)}
                  data-testid={`search-team-${team.id}`}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/[0.03] group"
                  style={{ borderBottom: "1px solid hsl(220 20% 10%)" }}>
                  {/* Logo */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `${team.primaryColor}18`, border: `1px solid ${team.primaryColor}30` }}>
                    {team.logoEmoji}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{team.city} {team.name}</span>
                      <span className="label-caps text-[9px] px-1 rounded"
                        style={{ background: `${team.primaryColor}18`, color: team.primaryColor }}>
                        {team.abbreviation}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: "hsl(220 15% 45%)" }}>
                      {team.sport} · {team.division} · {team.record.wins}-{team.record.losses}
                      {team.record.streak && <span className="ml-2" style={{ color: team.record.streak.startsWith("W") ? "hsl(80 96% 58%)" : "hsl(5 96% 64%)" }}>{team.record.streak}</span>}
                    </div>
                  </div>
                  <ChevronRight size={13} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "hsl(220 15% 35%)" }} />
                </button>
              ))}
            </div>
          )}

          {/* Players section */}
          {data && data.players.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2.5 sticky top-0"
                style={{ background: "hsl(218 35% 7%)", borderBottom: "1px solid hsl(220 20% 12%)" }}>
                <Users size={11} style={{ color: "hsl(263 100% 72%)" }} />
                <span className="label-caps text-[9px]" style={{ color: "hsl(263 100% 72%)" }}>
                  PLAYERS · {data.players.length}
                </span>
              </div>
              {data.players.map((player, i) => (
                <PlayerResultRow key={`${player.name}-${i}`} player={player} index={i} onClick={() => handlePlayerClick(player)} />
              ))}
            </div>
          )}

          {/* Footer hint */}
          {hasResults && (
            <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap"
              style={{ background: "hsl(220 20% 6%)", borderTop: "1px solid hsl(220 20% 12%)" }}>
              <span className="text-[9px]" style={{ color: "hsl(220 15% 30%)" }}>
                {data.total} result{data.total !== 1 ? "s" : ""} · Click any result to open team page
              </span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded"
                style={{ background: "hsl(220 20% 12%)", color: "hsl(220 15% 35%)", fontFamily: "monospace" }}>
                ESC to close
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
