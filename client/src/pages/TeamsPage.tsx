import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  ChevronLeft, MapPin, Trophy, TrendingUp, Calendar,
  Users, BarChart3, Zap, Activity, Clock, Tv,
  Star, Target, Flame, Shield, ChevronRight,
  Search, X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface TeamSummary {
  id: string; name: string; city: string; abbreviation: string;
  sport: string; division: string; conference?: string;
  primaryColor: string; logoEmoji: string;
  record: { wins: number; losses: number; pct?: number; streak?: string; lastTen?: string; divRank?: number };
  standing: string; bettingTrend: "Hot" | "Cold" | "Neutral"; propHotspot: string;
}

interface TeamPlayer {
  name: string; position: string; number: string; age: number; photoUrl: string;
  keyStats: Record<string, string>; role: "Star" | "Starter" | "Role Player" | "Bench";
  injuryStatus?: string; propTip?: string;
}
interface UpcomingGame {
  date: string; time: string; opponent: string; home: boolean;
  venue: string; tvNetwork: string; gameType: string; propOdds?: string;
}
interface TeamDetail {
  id: string; name: string; city: string; abbreviation: string;
  sport: string; division: string; primaryColor: string; secondaryColor: string;
  logoEmoji: string; stadium: string; established: number;
  record: { wins: number; losses: number; pct?: number; streak?: string; lastTen?: string; divRank?: number };
  standing: string; bettingTrend: "Hot" | "Cold" | "Neutral";
  teamStats: { offenseRank?: number; defenseRank?: number; label1: string; val1: string; label2: string; val2: string; label3: string; val3: string; label4: string; val4: string; label5?: string; val5?: string; label6?: string; val6?: string };
  roster: TeamPlayer[]; upcomingGames: UpcomingGame[];
  aiNote: string; propHotspot: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SPORTS = [
  { key: "MLB", emoji: "⚾", color: "hsl(5 96% 64%)", label: "MLB" },
  { key: "NBA", emoji: "🏀", color: "hsl(30 100% 58%)", label: "NBA" },
  { key: "NHL", emoji: "🏒", color: "hsl(196 96% 60%)", label: "NHL" },
  { key: "Tennis", emoji: "🎾", color: "hsl(80 96% 58%)", label: "Tennis" },
] as const;

const ROLE_COLORS: Record<string, string> = {
  Star: "hsl(80 96% 58%)", Starter: "hsl(190 92% 60%)",
  "Role Player": "hsl(263 100% 72%)", Bench: "hsl(220 15% 50%)",
};

const TREND_CONFIG = {
  Hot:     { color: "hsl(5 96% 64%)",  bg: "hsl(5 96% 64% / 0.12)",  icon: Flame,     label: "Hot" },
  Neutral: { color: "hsl(38 100% 65%)", bg: "hsl(38 100% 65% / 0.10)", icon: Activity,  label: "Neutral" },
  Cold:    { color: "hsl(190 92% 60%)", bg: "hsl(190 92% 60% / 0.10)", icon: Shield,    label: "Cold" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3 flex flex-col gap-0.5" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <span className="label-caps text-[9px]" style={{ color: `${color}99` }}>{label}</span>
      <span className="font-black text-sm" style={{ color }}>{value}</span>
    </div>
  );
}

function PlayerCard({ player }: { player: TeamPlayer }) {
  const [imgErr, setImgErr] = useState(false);
  const roleColor = ROLE_COLORS[player.role] || "hsl(220 15% 50%)";
  return (
    <div className="rounded-2xl p-4 flex gap-3 transition-all hover:scale-[1.01]"
      style={{ background: "hsl(220 20% 8%)", border: `1px solid ${player.role === "Star" ? "hsl(80 96% 58% / 0.25)" : "hsl(220 20% 14%)"}` }}>
      {/* Photo */}
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: "hsl(220 20% 12%)" }}>
        {!imgErr ? (
          <img src={player.photoUrl} alt={player.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        ) : (
          <span className="text-2xl">👤</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {/* Name + role */}
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-black text-sm text-white truncate">{player.name}</span>
          <span className="label-caps text-[9px] px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: `${roleColor}18`, color: roleColor }}>
            {player.role === "Star" ? "⭐ " : ""}{player.role}
          </span>
          {player.injuryStatus && (
            <span className="label-caps text-[9px] px-1.5 rounded flex-shrink-0"
              style={{ background: "hsl(38 100% 65% / 0.15)", color: "hsl(38 100% 65%)" }}>
              ⚠ {player.injuryStatus}
            </span>
          )}
        </div>
        <div className="text-[10px] mb-2" style={{ color: "hsl(220 15% 50%)" }}>
          #{player.number} · {player.position} · Age {player.age}
        </div>
        {/* Key stats */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Object.entries(player.keyStats).map(([k, v]) => (
            <div key={k} className="rounded px-1.5 py-0.5 text-[10px]"
              style={{ background: "hsl(220 20% 12%)" }}>
              <span style={{ color: "hsl(220 15% 45%)" }}>{k}: </span>
              <span className="font-bold text-white">{v}</span>
            </div>
          ))}
        </div>
        {/* Prop tip */}
        {player.propTip && (
          <div className="flex items-start gap-1.5 rounded-lg px-2.5 py-1.5"
            style={{ background: "hsl(263 100% 70% / 0.08)", borderLeft: "2px solid hsl(263 100% 70% / 0.4)" }}>
            <Zap size={10} className="flex-shrink-0 mt-0.5" style={{ color: "hsl(263 100% 72%)" }} />
            <p className="text-[10px] leading-tight" style={{ color: "hsl(263 100% 72%)" }}>
              {player.propTip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GameRow({ game, sportColor }: { game: UpcomingGame; sportColor: string }) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: "hsl(220 20% 8%)", border: "1px solid hsl(220 20% 13%)" }}>
      {/* Date block */}
      <div className="rounded-lg px-2.5 py-2 text-center flex-shrink-0 min-w-[52px]"
        style={{ background: `${sportColor}12`, border: `1px solid ${sportColor}25` }}>
        <div className="label-caps text-[9px]" style={{ color: `${sportColor}88` }}>
          {game.date.split(" ")[0].toUpperCase()}
        </div>
        <div className="font-black text-sm" style={{ color: sportColor }}>
          {game.date.split(" ")[1] || game.date}
        </div>
      </div>
      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="label-caps text-[9px] px-1 rounded"
            style={{ background: game.home ? "hsl(80 96% 58% / 0.15)" : "hsl(220 20% 12%)", color: game.home ? "hsl(80 96% 58%)" : "hsl(220 15% 50%)" }}>
            {game.home ? "HOME" : "AWAY"}
          </span>
          <span className="font-semibold text-xs text-white truncate">vs {game.opponent}</span>
          {game.gameType === "Playoff" && (
            <span className="label-caps text-[9px] px-1 rounded flex-shrink-0"
              style={{ background: "hsl(38 100% 65% / 0.15)", color: "hsl(38 100% 65%)" }}>
              🏆 Playoff
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: "hsl(220 15% 45%)" }}>
          <span className="flex items-center gap-1"><Clock size={9} />{game.time}</span>
          <span className="flex items-center gap-1"><Tv size={9} />{game.tvNetwork}</span>
          <span className="flex items-center gap-1"><MapPin size={9} />{game.venue}</span>
        </div>
        {game.propOdds && (
          <div className="mt-1.5 flex items-center gap-1">
            <Target size={9} style={{ color: "hsl(80 96% 58%)" }} />
            <span className="text-[9px]" style={{ color: "hsl(80 96% 58%)" }}>{game.propOdds}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team Detail View ──────────────────────────────────────────────────────────
function TeamDetail({ teamId, onBack, sportColor }: { teamId: string; onBack: () => void; sportColor: string }) {
  const [tab, setTab] = useState<"overview" | "roster" | "schedule">("overview");

  const { data: team, isLoading } = useQuery<TeamDetail>({
    queryKey: ["/api/teams", teamId],
    queryFn: () => apiRequest("GET", `/api/teams/${teamId}`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 rounded-xl animate-pulse" style={{ background: "hsl(220 20% 10%)" }} />
        <div className="h-48 rounded-2xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />)}
        </div>
      </div>
    );
  }

  if (!team) return null;

  const trendCfg = TREND_CONFIG[team.bettingTrend];
  const TrendIcon = trendCfg.icon;
  const allStats = [
    { label: team.teamStats.label1, val: team.teamStats.val1 },
    { label: team.teamStats.label2, val: team.teamStats.val2 },
    { label: team.teamStats.label3, val: team.teamStats.val3 },
    { label: team.teamStats.label4, val: team.teamStats.val4 },
    ...(team.teamStats.label5 ? [{ label: team.teamStats.label5, val: team.teamStats.val5! }] : []),
    ...(team.teamStats.label6 ? [{ label: team.teamStats.label6, val: team.teamStats.val6! }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:opacity-80"
        style={{ color: "hsl(220 15% 55%)" }}
        data-testid="team-back-btn">
        <ChevronLeft size={16} />
        All Teams
      </button>

      {/* Team hero */}
      <div className="relative rounded-2xl p-5 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${team.primaryColor}30 0%, hsl(216 42% 5%) 100%)`, border: `1px solid ${team.primaryColor}40` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${team.primaryColor}, transparent)`, transform: "translate(30%, -30%)" }} />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: `${team.primaryColor}20`, border: `2px solid ${team.primaryColor}40` }}>
              {team.logoEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="text-xl font-black text-white">{team.city} {team.name}</h1>
                <span className="label-caps text-[10px] px-2 py-0.5 rounded"
                  style={{ background: `${team.primaryColor}25`, color: team.primaryColor }}>
                  {team.abbreviation}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: sportColor }}>{team.standing}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: "hsl(220 15% 50%)" }}>
                <span className="flex items-center gap-1"><MapPin size={10} />{team.stadium}</span>
                <span>Est. {team.established}</span>
                <span>{team.division}</span>
              </div>
            </div>
          </div>

          {/* Record + trend */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <div className="rounded-xl p-3 text-center min-w-[64px]"
              style={{ background: "hsl(220 20% 10%)", border: "1px solid hsl(220 20% 18%)" }}>
              <div className="text-xl font-black text-white">{team.record.wins}-{team.record.losses}</div>
              <div className="label-caps text-[9px]" style={{ color: "hsl(220 15% 40%)" }}>Record</div>
            </div>
            {team.record.streak && (
              <div className="rounded-xl p-3 text-center min-w-[56px]"
                style={{ background: "hsl(220 20% 10%)", border: "1px solid hsl(220 20% 18%)" }}>
                <div className="text-lg font-black" style={{ color: team.record.streak.startsWith("W") ? "hsl(80 96% 58%)" : "hsl(5 96% 64%)" }}>
                  {team.record.streak}
                </div>
                <div className="label-caps text-[9px]" style={{ color: "hsl(220 15% 40%)" }}>Streak</div>
              </div>
            )}
            <div className="rounded-xl p-3 text-center flex flex-col items-center gap-1 min-w-[72px]"
              style={{ background: trendCfg.bg, border: `1px solid ${trendCfg.color}30` }}>
              <TrendIcon size={14} style={{ color: trendCfg.color }} />
              <div className="label-caps text-[9px]" style={{ color: trendCfg.color }}>Betting {trendCfg.label}</div>
            </div>
          </div>
        </div>

        {/* Prop hotspot */}
        <div className="relative z-10 mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 flex-wrap"
          style={{ background: "hsl(263 100% 70% / 0.08)", border: "1px solid hsl(263 100% 70% / 0.2)" }}>
          <Zap size={13} style={{ color: "hsl(263 100% 72%)" }} />
          <span className="label-caps text-[9px]" style={{ color: "hsl(263 100% 72%)" }}>Top Prop Target</span>
          <span className="text-xs font-bold text-white">{team.propHotspot}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1" style={{ background: "hsl(220 20% 8%)", padding: "4px", borderRadius: "12px", width: "fit-content" }}>
        {([
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "roster", label: "Roster", icon: Users },
          { id: "schedule", label: "Schedule", icon: Calendar },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === t.id ? { background: sportColor, color: "#000" } : { color: "hsl(220 15% 55%)" }}
            data-testid={`team-tab-${t.id}`}>
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* AI Note */}
          <div className="rounded-2xl p-4" style={{ background: "hsl(220 20% 7%)", border: "1px solid hsl(220 20% 13%)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} style={{ color: "hsl(263 100% 72%)" }} />
              <span className="label-caps text-[10px]" style={{ color: "hsl(263 100% 72%)" }}>AI Scout Report</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(220 15% 65%)" }}>{team.aiNote}</p>
          </div>

          {/* Team stats grid */}
          <div>
            <div className="label-caps text-[10px] mb-2" style={{ color: "hsl(220 15% 35%)" }}>TEAM STATISTICS</div>
            {(team.teamStats.offenseRank || team.teamStats.defenseRank) && (
              <div className="flex gap-2 mb-3">
                {team.teamStats.offenseRank && (
                  <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                    style={{ background: "hsl(80 96% 58% / 0.1)", border: "1px solid hsl(80 96% 58% / 0.2)" }}>
                    <TrendingUp size={12} style={{ color: "hsl(80 96% 58%)" }} />
                    <span className="text-xs font-bold" style={{ color: "hsl(80 96% 58%)" }}>Offense #{team.teamStats.offenseRank}</span>
                  </div>
                )}
                {team.teamStats.defenseRank && (
                  <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                    style={{ background: "hsl(190 92% 60% / 0.1)", border: "1px solid hsl(190 92% 60% / 0.2)" }}>
                    <Shield size={12} style={{ color: "hsl(190 92% 60%)" }} />
                    <span className="text-xs font-bold" style={{ color: "hsl(190 92% 60%)" }}>Defense #{team.teamStats.defenseRank}</span>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allStats.map(s => (
                <StatPill key={s.label} label={s.label} value={s.val} color={sportColor} />
              ))}
            </div>
          </div>

          {/* Star players preview */}
          <div>
            <div className="label-caps text-[10px] mb-2" style={{ color: "hsl(220 15% 35%)" }}>KEY PLAYERS</div>
            <div className="space-y-2">
              {team.roster.filter(p => p.role === "Star").map(p => (
                <PlayerCard key={p.name} player={p} />
              ))}
            </div>
          </div>

          {/* Next game preview */}
          {team.upcomingGames.length > 0 && (
            <div>
              <div className="label-caps text-[10px] mb-2" style={{ color: "hsl(220 15% 35%)" }}>NEXT GAME</div>
              <GameRow game={team.upcomingGames[0]} sportColor={sportColor} />
            </div>
          )}
        </div>
      )}

      {/* ── Roster ── */}
      {tab === "roster" && (
        <div className="space-y-3">
          {(["Star", "Starter", "Role Player"] as const).map(role => {
            const players = team.roster.filter(p => p.role === role);
            if (!players.length) return null;
            return (
              <div key={role}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_COLORS[role] }} />
                  <span className="label-caps text-[10px]" style={{ color: ROLE_COLORS[role] }}>{role}S</span>
                </div>
                <div className="space-y-2">
                  {players.map(p => <PlayerCard key={p.name} player={p} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Schedule ── */}
      {tab === "schedule" && (
        <div className="space-y-2">
          {team.upcomingGames.map((g, i) => (
            <GameRow key={i} game={g} sportColor={sportColor} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team Card (grid view) ─────────────────────────────────────────────────────
function TeamCard({ team, onClick }: { team: TeamSummary; onClick: () => void }) {
  const trendCfg = TREND_CONFIG[team.bettingTrend];
  const TrendIcon = trendCfg.icon;
  return (
    <button onClick={onClick}
      data-testid={`team-card-${team.id}`}
      className="w-full text-left rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] group"
      style={{ background: "hsl(220 20% 7%)", border: `1px solid ${team.primaryColor}30` }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${team.primaryColor}18`, border: `1.5px solid ${team.primaryColor}40` }}>
          {team.logoEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm text-white truncate">{team.city} {team.name}</div>
          <div className="text-[10px]" style={{ color: "hsl(220 15% 45%)" }}>{team.division}</div>
        </div>
        <ChevronRight size={15} className="flex-shrink-0 transition-transform group-hover:translate-x-1"
          style={{ color: "hsl(220 15% 40%)" }} />
      </div>

      {/* Record */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="font-black text-lg text-white">{team.record.wins}-{team.record.losses}</span>
          {team.record.pct && <span className="text-xs ml-1.5" style={{ color: "hsl(220 15% 50%)" }}>({(team.record.pct * 100).toFixed(0)}%)</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {team.record.streak && (
            <span className="label-caps text-[9px] px-1.5 py-0.5 rounded"
              style={{
                background: team.record.streak.startsWith("W") ? "hsl(80 96% 58% / 0.12)" : "hsl(5 96% 64% / 0.12)",
                color: team.record.streak.startsWith("W") ? "hsl(80 96% 58%)" : "hsl(5 96% 64%)",
              }}>
              {team.record.streak}
            </span>
          )}
          <span className="label-caps text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1"
            style={{ background: trendCfg.bg, color: trendCfg.color }}>
            <TrendIcon size={9} />
            {trendCfg.label}
          </span>
        </div>
      </div>

      {/* Standing */}
      <div className="text-[10px] mb-2 truncate" style={{ color: "hsl(220 15% 55%)" }}>{team.standing}</div>

      {/* Prop hotspot */}
      <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
        style={{ background: "hsl(263 100% 70% / 0.07)" }}>
        <Zap size={9} style={{ color: "hsl(263 100% 72%)" }} />
        <span className="text-[9px] truncate" style={{ color: "hsl(263 100% 65%)" }}>{team.propHotspot}</span>
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TeamsPage() {
  const [sport, setSport] = useState<"MLB" | "NBA" | "NHL" | "Tennis">("MLB");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [inlineSearch, setInlineSearch] = useState("");

  // Listen for deep-link events from GlobalSearch
  useEffect(() => {
    function handleOpenTeam(e: Event) {
      const teamId = (e as CustomEvent).detail?.teamId as string;
      if (!teamId) return;
      setSelectedTeamId(teamId);
      // Auto-switch sport tab to match the team
      apiRequest("GET", `/api/teams/${teamId}`)
        .then(r => r.json())
        .then((t: any) => { if (t.sport) setSport(t.sport as any); })
        .catch(() => {});
    }
    window.addEventListener("propedge:openTeam", handleOpenTeam);
    return () => window.removeEventListener("propedge:openTeam", handleOpenTeam);
  }, []);

  const sportCfg = SPORTS.find(s => s.key === sport)!;

  const { data: teams = [], isLoading } = useQuery<TeamSummary[]>({
    queryKey: ["/api/teams", sport],
    queryFn: () => apiRequest("GET", `/api/teams?sport=${sport}`).then(r => r.json()),
    staleTime: 60000,
  });

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "hsl(216 42% 3%)" }}>

      {/* Page header */}
      {!selectedTeamId && (
        <>
          <div className="relative rounded-2xl p-5 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${sportCfg.color}18 0%, hsl(216 42% 6%) 100%)`, border: `1px solid ${sportCfg.color}30` }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-56 h-56 rounded-full opacity-8"
                style={{ background: `radial-gradient(circle, ${sportCfg.color}, transparent)`, transform: "translate(-40%, -40%)" }} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{sportCfg.emoji}</span>
                <span className="label-caps" style={{ color: sportCfg.color }}>Teams Explorer</span>
              </div>
              <h1 className="text-xl font-black text-white mb-1">
                {sport} Teams
              </h1>
              <p className="text-sm" style={{ color: "hsl(220 15% 50%)" }}>
                Tap any team to see roster, stats, upcoming games &amp; prop tips
              </p>
            </div>
          </div>

          {/* Sport picker */}
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map(s => (
              <button key={s.key} onClick={() => setSport(s.key)}
                data-testid={`sport-tab-${s.key.toLowerCase()}`}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold text-xs transition-all"
                style={sport === s.key ? { background: `${s.color}20`, border: `2px solid ${s.color}`, color: s.color } : { background: "hsl(220 20% 9%)", border: "2px solid hsl(220 20% 16%)", color: "hsl(220 15% 55%)" }}>
                <span className="text-xl">{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Inline search bar — visible only when team grid is shown */}
      {!selectedTeamId && (
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: "hsl(220 15% 40%)" }} />
          <input
            value={inlineSearch}
            onChange={e => setInlineSearch(e.target.value)}
            placeholder={`Filter ${sport} teams by name or city…`}
            data-testid="team-inline-search"
            className="w-full pl-8 pr-8 py-2.5 text-xs rounded-xl outline-none transition-all"
            style={{
              background: "hsl(220 20% 9%)",
              border: inlineSearch ? "1px solid hsl(263 100% 70% / 0.35)" : "1px solid hsl(220 20% 16%)",
              color: "hsl(220 15% 85%)",
            }}
          />
          {inlineSearch && (
            <button onClick={() => setInlineSearch("")} className="absolute right-3">
              <X size={12} style={{ color: "hsl(220 15% 45%)" }} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {selectedTeamId ? (
        <TeamDetail
          teamId={selectedTeamId}
          onBack={() => setSelectedTeamId(null)}
          sportColor={sportCfg.color}
        />
      ) : (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />
              ))}
            </div>
          ) : (() => {
            const q = inlineSearch.toLowerCase().trim();
            const filtered = q
              ? teams.filter(t =>
                  t.name.toLowerCase().includes(q) ||
                  t.city.toLowerCase().includes(q) ||
                  t.abbreviation.toLowerCase().includes(q) ||
                  t.division.toLowerCase().includes(q)
                )
              : teams;
            if (filtered.length === 0) return (
              <div className="rounded-2xl p-12 text-center" style={{ background: "hsl(220 20% 7%)", border: "1px solid hsl(220 20% 13%)" }}>
                <Search size={36} className="mx-auto mb-3" style={{ color: "hsl(220 15% 28%)" }} />
                <p className="font-semibold" style={{ color: "hsl(220 15% 40%)" }}>
                  {q ? `No ${sport} teams match "${inlineSearch}"` : `No teams found for ${sport}`}
                </p>
                {q && <button onClick={() => setInlineSearch("")} className="mt-2 text-xs" style={{ color: "hsl(263 100% 70%)" }}>Clear filter</button>}
              </div>
            );
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(t => (
                  <TeamCard key={t.id} team={t} onClick={() => setSelectedTeamId(t.id)} />
                ))}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
