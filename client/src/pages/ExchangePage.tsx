import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Zap, TrendingUp, Activity, CheckCircle2, Clock,
  BarChart3, ArrowUp, ArrowDown, Flame, Trophy,
  RefreshCw, Lock,
} from "lucide-react";

interface ExchangeProp {
  id: number; player: string; team: string; sport: string; market: string;
  line: number; overOdds: number; underOdds: number;
  overCount: number; underCount: number;
  aiSide: "Over" | "Under"; aiConfidence: number;
  totalVolume: number; closes: string;
  status: "open" | "live" | "settled"; result?: "Over" | "Under";
  trending: boolean;
}

interface UserPickRecord {
  propId: number; side: "Over" | "Under";
  timestamp: number; result?: "win" | "loss" | "pending"; points: number;
}

interface MyRecord {
  wins: number; losses: number; pending: number; total: number; picks: UserPickRecord[];
}

const SPORT_COLORS: Record<string, string> = {
  MLB: "hsl(5 96% 64%)", NBA: "hsl(30 100% 58%)",
  NHL: "hsl(196 96% 60%)", Tennis: "hsl(80 96% 58%)",
};
const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  open:     { label: "OPEN",     color: "hsl(80 96% 58%)",  bg: "hsl(80 96% 58% / 0.12)" },
  live:     { label: "LIVE",     color: "hsl(5 96% 64%)",   bg: "hsl(5 96% 64% / 0.12)" },
  settled:  { label: "SETTLED",  color: "hsl(220 15% 50%)", bg: "hsl(220 15% 50% / 0.1)" },
};

const SPORTS = ["All", "MLB", "Tennis"];

function VoteBar({ over, under }: { over: number; under: number }) {
  const total = over + under || 1;
  const overPct = Math.round((over / total) * 100);
  const underPct = 100 - overPct;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold">
        <span style={{ color: "hsl(80 96% 58%)" }}>OVER {overPct}%</span>
        <span style={{ color: "hsl(263 100% 72%)" }}>UNDER {underPct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "hsl(220 20% 14%)" }}>
        <div className="h-full rounded-l-full transition-all"
          style={{ width: `${overPct}%`, background: "linear-gradient(90deg, hsl(80 96% 58%), hsl(190 92% 60%))" }} />
        <div className="h-full rounded-r-full transition-all flex-1"
          style={{ background: "linear-gradient(90deg, hsl(263 100% 60%), hsl(263 100% 50%))" }} />
      </div>
      <div className="flex justify-between text-[9px]" style={{ color: "hsl(220 15% 40%)" }}>
        <span>{over.toLocaleString()} picks</span>
        <span>{under.toLocaleString()} picks</span>
      </div>
    </div>
  );
}

export default function ExchangePage() {
  const [sport, setSport] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "live">("all");
  const [pickedProps, setPickedProps] = useState<Map<number, "Over" | "Under">>(new Map());
  const [activeTab, setActiveTab] = useState<"market" | "myrecord">("market");
  const qc = useQueryClient();

  const { data: props = [], isLoading, refetch } = useQuery<ExchangeProp[]>({
    queryKey: ["/api/exchange/props", sport, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (sport !== "All") params.set("sport", sport);
      if (statusFilter !== "all") params.set("status", statusFilter);
      return apiRequest("GET", `/api/exchange/props?${params}`).then(r => r.json());
    },
    refetchInterval: 15000,
  });

  const { data: record, isLoading: loadingRecord } = useQuery<MyRecord>({
    queryKey: ["/api/exchange/record"],
    queryFn: () => apiRequest("GET", "/api/exchange/record").then(r => r.json()),
    refetchInterval: 15000,
  });

  const pickMutation = useMutation<{ success: boolean; pick: UserPickRecord }, Error, { propId: number; side: string }>({
    mutationFn: (body) => apiRequest("POST", "/api/exchange/pick", body).then(r => r.json()),
    onSuccess: (data, variables) => {
      if (data.success) {
        setPickedProps(prev => new Map(prev).set(variables.propId, variables.side as "Over" | "Under"));
      }
      qc.invalidateQueries({ queryKey: ["/api/exchange/record"] });
      qc.invalidateQueries({ queryKey: ["/api/exchange/props"] });
    },
  });

  const trendingProps = props.filter(p => p.trending);
  const winRate = record && record.total > 0 ? Math.round(((record.wins) / (record.wins + record.losses || 1)) * 100) : 0;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6" style={{ background: "hsl(216 42% 3%)" }}>

      {/* Header */}
      <div className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(190 92% 12%) 0%, hsl(216 42% 6%) 100%)", border: "1px solid hsl(190 92% 60% / 0.25)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(190 92% 60%), transparent)", transform: "translate(40%, -40%)" }} />
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={20} style={{ color: "hsl(190 92% 60%)" }} />
              <span className="label-caps" style={{ color: "hsl(190 92% 60%)" }}>Prop Prediction Market</span>
            </div>
            <h1 className="text-xl font-black text-white mb-1">Player Prop Exchange</h1>
            <p className="text-sm" style={{ color: "hsl(220 15% 55%)" }}>
              {props.length} active markets · Community + AI powered · Free to play
            </p>
          </div>
          {/* Record summary */}
          {record && (
            <div className="flex gap-3">
              {[
                { label: "Wins", val: record.wins, color: "hsl(80 96% 58%)" },
                { label: "Losses", val: record.losses, color: "hsl(5 96% 64%)" },
                { label: "Pending", val: record.pending, color: "hsl(38 100% 65%)" },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-4 py-2.5 text-center"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                  <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
                  <div className="label-caps text-[9px]" style={{ color: `${s.color}88` }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending strip */}
      {trendingProps.length > 0 && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3 overflow-hidden"
          style={{ background: "hsl(5 96% 64% / 0.06)", border: "1px solid hsl(5 96% 64% / 0.2)" }}>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Flame size={14} style={{ color: "hsl(5 96% 64%)" }} />
            <span className="label-caps text-[10px]" style={{ color: "hsl(5 96% 64%)" }}>Trending</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 flex-1">
            {trendingProps.map(p => (
              <div key={p.id} className="flex-shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                style={{ background: "hsl(220 20% 9%)", border: "1px solid hsl(220 20% 16%)" }}>
                <span className="text-xs font-semibold text-white whitespace-nowrap">{p.player.split(" ").pop()}</span>
                <span className="text-[10px]" style={{ color: "hsl(220 15% 50%)" }}>{p.market} {p.line}</span>
                <span className="label-caps text-[9px]"
                  style={{ color: p.aiSide === "Over" ? "hsl(80 96% 58%)" : "hsl(263 100% 72%)" }}>
                  AI {p.aiSide}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters + tabs */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {SPORTS.map(s => (
            <button key={s} onClick={() => setSport(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={sport === s
                ? { background: "hsl(190 92% 60%)", color: "#000" }
                : { background: "hsl(220 20% 10%)", color: "hsl(220 15% 55%)", border: "1px solid hsl(220 20% 18%)" }}>
              {s}
            </button>
          ))}
          <div style={{ width: "1px", background: "hsl(220 20% 16%)" }} />
          {(["all", "open", "live"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
              style={statusFilter === s
                ? { background: STATUS_BADGE[s === "all" ? "open" : s]?.bg || "hsl(220 20% 14%)", color: STATUS_BADGE[s === "all" ? "open" : s]?.color || "#fff", border: "none" }
                : { background: "hsl(220 20% 10%)", color: "hsl(220 15% 55%)", border: "1px solid hsl(220 20% 18%)" }}>
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1" style={{ background: "hsl(220 20% 8%)", padding: "4px", borderRadius: "10px" }}>
          <button onClick={() => setActiveTab("market")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={activeTab === "market" ? { background: "hsl(190 92% 60%)", color: "#000" } : { color: "hsl(220 15% 55%)" }}>
            <BarChart3 size={12} /> Market
          </button>
          <button onClick={() => setActiveTab("myrecord")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={activeTab === "myrecord" ? { background: "hsl(190 92% 60%)", color: "#000" } : { color: "hsl(220 15% 55%)" }}>
            <Trophy size={12} /> My Record
          </button>
          <button onClick={() => refetch()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ color: "hsl(220 15% 55%)" }}
            data-testid="refresh-exchange">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* ── Market Tab ── */}
      {activeTab === "market" && (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />
            ))}
          </div>
        ) : props.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: "hsl(220 20% 7%)", border: "1px solid hsl(220 20% 13%)" }}>
            <BarChart3 size={40} className="mx-auto mb-3" style={{ color: "hsl(220 15% 30%)" }} />
            <p style={{ color: "hsl(220 15% 45%)" }}>No props match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {props.map(prop => {
              const sportColor = SPORT_COLORS[prop.sport] || "hsl(263 100% 72%)";
              const statusInfo = STATUS_BADGE[prop.status];
              const myPick = pickedProps.get(prop.id);
              const alreadyPicked = !!myPick;
              const isSettled = prop.status === "settled";

              return (
                <div key={prop.id}
                  data-testid={`exchange-prop-${prop.id}`}
                  className="rounded-2xl p-4 flex flex-col gap-3 transition-all"
                  style={{
                    background: "hsl(220 20% 7%)",
                    border: alreadyPicked ? `1px solid hsl(190 92% 60% / 0.4)` : "1px solid hsl(220 20% 13%)",
                    boxShadow: prop.trending ? `0 0 20px hsl(5 96% 64% / 0.1)` : "none",
                  }}>
                  {/* Card header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-sm text-white">{prop.player}</span>
                        {prop.trending && <Flame size={12} style={{ color: "hsl(5 96% 64%)" }} />}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="label-caps text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: `${sportColor}18`, color: sportColor }}>
                          {prop.sport}
                        </span>
                        <span className="text-[10px]" style={{ color: "hsl(220 15% 50%)" }}>
                          {prop.team} · {prop.market}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="label-caps text-[9px] px-1.5 py-0.5 rounded"
                        style={{ background: statusInfo.bg, color: statusInfo.color }}>
                        {prop.status === "live" && <span className="live-dot mr-1" />}
                        {statusInfo.label}
                      </span>
                      <span className="text-[10px]" style={{ color: "hsl(220 15% 40%)" }}>{prop.closes}</span>
                    </div>
                  </div>

                  {/* Line display */}
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{prop.line}</div>
                    <div className="label-caps text-[9px]" style={{ color: "hsl(220 15% 40%)" }}>{prop.market} line</div>
                  </div>

                  {/* Community vote bar */}
                  <VoteBar over={prop.overCount} under={prop.underCount} />

                  {/* AI badge */}
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "hsl(263 100% 70% / 0.08)", border: "1px solid hsl(263 100% 70% / 0.15)" }}>
                    <Zap size={12} style={{ color: "hsl(263 100% 72%)" }} />
                    <span className="text-[10px] font-semibold" style={{ color: "hsl(263 100% 72%)" }}>
                      AI picks
                    </span>
                    <span className="font-black text-xs"
                      style={{ color: prop.aiSide === "Over" ? "hsl(80 96% 58%)" : "hsl(263 100% 72%)" }}>
                      {prop.aiSide}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full mx-1" style={{ background: "hsl(220 20% 14%)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${prop.aiConfidence}%`, background: "hsl(263 100% 70%)" }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: "hsl(263 100% 72%)" }}>
                      {prop.aiConfidence}%
                    </span>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Activity size={10} style={{ color: "hsl(220 15% 40%)" }} />
                      <span className="text-[10px]" style={{ color: "hsl(220 15% 45%)" }}>
                        {prop.totalVolume.toLocaleString()} total picks
                      </span>
                    </div>
                    {alreadyPicked && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={11} style={{ color: "hsl(190 92% 60%)" }} />
                        <span className="text-[10px] font-semibold" style={{ color: "hsl(190 92% 60%)" }}>
                          You picked {myPick}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pick buttons */}
                  {!isSettled && (
                    <div className="grid grid-cols-2 gap-2">
                      {(["Over", "Under"] as const).map(side => {
                        const isMyPick = myPick === side;
                        const isOver = side === "Over";
                        const btnColor = isOver ? "hsl(80 96% 58%)" : "hsl(263 100% 70%)";
                        const odds = isOver ? prop.overOdds : prop.underOdds;
                        return (
                          <button
                            key={side}
                            onClick={() => !alreadyPicked && pickMutation.mutate({ propId: prop.id, side })}
                            disabled={alreadyPicked || pickMutation.isPending}
                            data-testid={`pick-${side.toLowerCase()}-${prop.id}`}
                            className="flex flex-col items-center py-2.5 px-3 rounded-xl font-bold text-xs transition-all"
                            style={{
                              background: isMyPick ? `${btnColor}22` : alreadyPicked ? "hsl(220 20% 9%)" : `${btnColor}12`,
                              border: isMyPick ? `1.5px solid ${btnColor}` : `1px solid ${btnColor}25`,
                              color: isMyPick ? btnColor : alreadyPicked ? "hsl(220 15% 35%)" : btnColor,
                              cursor: alreadyPicked ? "default" : "pointer",
                              opacity: alreadyPicked && !isMyPick ? 0.4 : 1,
                            }}>
                            <div className="flex items-center gap-1">
                              {isOver ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                              <span>{side}</span>
                            </div>
                            <span className="text-[9px] font-normal opacity-70 mt-0.5">{odds}% implied</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isSettled && (
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
                      style={{ background: "hsl(220 20% 9%)", border: "1px solid hsl(220 20% 16%)" }}>
                      <Lock size={12} style={{ color: "hsl(220 15% 40%)" }} />
                      <span className="text-xs font-semibold" style={{ color: "hsl(220 15% 45%)" }}>
                        Settled · Result: {prop.result}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── My Record Tab ── */}
      {activeTab === "myrecord" && (
        <div className="space-y-4 max-w-2xl">
          {loadingRecord ? (
            <div className="h-48 rounded-2xl animate-pulse" style={{ background: "hsl(220 20% 8%)" }} />
          ) : record ? (
            <>
              {/* Summary card */}
              <div className="rounded-2xl p-5"
                style={{ background: "hsl(220 20% 7%)", border: "1px solid hsl(190 92% 60% / 0.2)" }}>
                <div className="label-caps text-[10px] mb-3" style={{ color: "hsl(220 15% 35%)" }}>MY RECORD</div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Wins", val: record.wins, color: "hsl(80 96% 58%)" },
                    { label: "Losses", val: record.losses, color: "hsl(5 96% 64%)" },
                    { label: "Pending", val: record.pending, color: "hsl(38 100% 65%)" },
                    { label: "Total", val: record.total, color: "hsl(263 100% 72%)" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center"
                      style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                      <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
                      <div className="label-caps text-[9px] mt-0.5" style={{ color: `${s.color}88` }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {record.total > 0 && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span style={{ color: "hsl(80 96% 58%)" }}>Win Rate</span>
                      <span style={{ color: "hsl(80 96% 58%)" }}>{winRate}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(220 20% 14%)" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${winRate}%`, background: "linear-gradient(90deg, hsl(80 96% 58%), hsl(190 92% 60%))" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Pick history */}
              {record.picks.length > 0 ? (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(220 20% 14%)" }}>
                  <div className="px-4 py-2.5 label-caps text-[10px]"
                    style={{ background: "hsl(220 20% 8%)", color: "hsl(220 15% 35%)" }}>
                    PICK HISTORY
                  </div>
                  {record.picks.map((pick, i) => {
                    const resultColor = pick.result === "win" ? "hsl(80 96% 58%)" : pick.result === "loss" ? "hsl(5 96% 64%)" : "hsl(38 100% 65%)";
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-3"
                        style={{ borderTop: "1px solid hsl(220 20% 11%)" }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: resultColor, boxShadow: `0 0 6px ${resultColor}` }} />
                        <div className="flex-1">
                          <span className="text-xs text-white font-semibold">Prop #{pick.propId}</span>
                          <span className="text-[10px] ml-2" style={{ color: "hsl(220 15% 50%)" }}>
                            {pick.side} · {new Date(pick.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="label-caps text-[9px] px-2 py-0.5 rounded"
                          style={{ background: `${resultColor}15`, color: resultColor }}>
                          {pick.result === "pending" ? <Clock size={10} className="inline mr-0.5" /> : null}
                          {pick.result?.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl p-10 text-center"
                  style={{ background: "hsl(220 20% 7%)", border: "1px solid hsl(220 20% 13%)" }}>
                  <TrendingUp size={36} className="mx-auto mb-3" style={{ color: "hsl(220 15% 28%)" }} />
                  <p className="font-semibold text-sm" style={{ color: "hsl(220 15% 40%)" }}>No picks yet</p>
                  <p className="text-xs mt-1" style={{ color: "hsl(220 15% 30%)" }}>Head to the Market tab and make your first pick</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
