import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, ExternalLink, X, Star } from "lucide-react";

interface StatLine {
  label: string;
  value: string;
  highlight?: boolean;
}

interface PlayerProfile {
  name: string;
  sport: string;
  team: string;
  number: string;
  position: string;
  photoUrl: string;
  age: number;
  height: string;
  weight: string;
  nationality: string;
  stats: StatLine[];
  season: string;
  lastGame?: string;
  trend: "hot" | "cold" | "neutral";
  bio: string;
}

const TREND_CONFIG = {
  hot:     { icon: TrendingUp,   color: "text-lime-400",  bg: "bg-lime-400/10",  border: "border-lime-400/25",  label: "🔥 HOT" },
  cold:    { icon: TrendingDown, color: "text-red-400",   bg: "bg-red-400/10",   border: "border-red-400/25",   label: "❄️ COLD" },
  neutral: { icon: Minus,        color: "text-sky-400",   bg: "bg-sky-400/10",   border: "border-sky-400/25",   label: "→ NEUTRAL" },
};

interface Props {
  playerName: string;
  sport: string;
  onClose: () => void;
}

export default function PlayerProfilePanel({ playerName, sport, onClose }: Props) {
  const [imgError, setImgError] = useState(false);

  const { data: profile, isLoading } = useQuery<PlayerProfile>({
    queryKey: ["/api/player", playerName],
    queryFn: () =>
      apiRequest("GET", `/api/player/${encodeURIComponent(playerName)}`).then(r => r.json()),
    retry: false,
  });

  const sportAccent: Record<string, { color: string; glow: string }> = {
    MLB:    { color: "text-red-400",    glow: "hsl(4 90% 60% / 0.18)" },
    NBA:    { color: "text-orange-400", glow: "hsl(33 100% 55% / 0.18)" },
    NHL:    { color: "text-sky-400",    glow: "hsl(200 90% 55% / 0.18)" },
    Tennis: { color: "text-lime-400",   glow: "hsl(85 90% 55% / 0.18)" },
  };
  const accent = sportAccent[sport] ?? sportAccent.MLB;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "hsl(222 40% 8%)",
          border: "1px solid hsl(258 90% 66% / 0.2)",
          boxShadow: `0 0 60px ${accent.glow}, 0 20px 60px rgba(0,0,0,0.5)`,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          </div>
        ) : !profile ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-sm font-semibold text-foreground">{playerName}</p>
            <p className="text-xs text-muted-foreground mt-1">Profile coming soon</p>
            <button onClick={onClose} className="mt-4 text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
        ) : (
          <>
            {/* ── Hero section ── */}
            <div className="relative p-5 pb-4"
              style={{ background: `linear-gradient(135deg, ${accent.glow}, transparent 70%)` }}>
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                data-testid="close-player-profile"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-4 items-start">
                {/* Photo */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2"
                    style={{ borderColor: "hsl(258 90% 66% / 0.4)", background: "hsl(222 35% 12%)" }}>
                    {!imgError ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover object-top"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      /* Fallback avatar */
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-muted-foreground/30"
                        style={{ background: "hsl(222 35% 11%)" }}>
                        {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>
                  {/* Trend badge */}
                  {(() => {
                    const t = TREND_CONFIG[profile.trend];
                    const Icon = t.icon;
                    return (
                      <div className={`absolute -bottom-1.5 -right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-black ${t.color} ${t.bg} ${t.border}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {profile.trend.toUpperCase()}
                      </div>
                    );
                  })()}
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h2 className="font-black text-lg text-foreground leading-tight" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                      {profile.name}
                    </h2>
                    {profile.number && (
                      <span className="text-xs text-muted-foreground font-bold">#{profile.number}</span>
                    )}
                  </div>
                  <div className={`text-sm font-semibold mt-0.5 ${accent.color}`}>{profile.team}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{
                      background: "hsl(258 90% 66% / 0.1)",
                      color: "hsl(258 90% 78%)",
                      border: "1px solid hsl(258 90% 66% / 0.25)",
                    }}>
                      {profile.position}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{profile.nationality}</span>
                    <span className="text-[10px] text-muted-foreground">{profile.age} yrs</span>
                    <span className="text-[10px] text-muted-foreground">{profile.height} · {profile.weight}</span>
                  </div>
                  {profile.bio && (
                    <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed line-clamp-2">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Season badge ── */}
            <div className="px-5 pb-1">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3" style={{ color: "hsl(258 90% 75%)" }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "hsl(258 90% 75%)" }}>
                  {profile.season} Season Stats
                </span>
                {profile.lastGame && (
                  <span className="ml-auto text-[9px] text-muted-foreground">Last: {profile.lastGame}</span>
                )}
              </div>
            </div>

            {/* ── Stats grid ── */}
            <div className="px-5 pb-5 pt-2">
              <div className="grid grid-cols-3 gap-2">
                {profile.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-2.5 text-center transition-all"
                    style={{
                      background: stat.highlight
                        ? "hsl(258 90% 66% / 0.08)"
                        : "hsl(222 35% 11%)",
                      border: stat.highlight
                        ? "1px solid hsl(258 90% 66% / 0.2)"
                        : "1px solid hsl(222 30% 15%)",
                    }}
                  >
                    <div
                      className="text-base font-black tabular-nums leading-none mb-1"
                      style={{
                        color: stat.highlight ? "hsl(258 90% 78%)" : "hsl(210 20% 90%)",
                        fontFamily: "Cabinet Grotesk, monospace",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Source note */}
              <div className="mt-3 flex items-center gap-1.5 text-[9px] text-muted-foreground/60">
                <ExternalLink className="w-2.5 h-2.5" />
                <span>Stats from official league sources · {profile.season} season</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
