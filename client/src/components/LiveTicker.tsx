import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TickerItem {
  id: number; title: string; sport: string; type: string; urgent: number;
}

const SPORT_CFG: Record<string, { color: string; emoji: string }> = {
  MLB:    { color: "hsl(5 96% 70%)",   emoji: "⚾" },
  NBA:    { color: "hsl(30 100% 64%)", emoji: "🏀" },
  NHL:    { color: "hsl(196 96% 66%)", emoji: "🏒" },
  Tennis: { color: "hsl(80 96% 62%)",  emoji: "🎾" },
};

const TYPE_ICON: Record<string, string> = {
  new_pick: "🎯", result: "📊", line_move: "📈", hot_streak: "🔥", injury: "⚠️",
};

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  const { data } = useQuery({
    queryKey: ["/api/feed"],
    queryFn: () => apiRequest("GET", "/api/feed?limit=20").then(r => r.json()),
  });

  useEffect(() => {
    if (data?.length) {
      setItems(data.slice(0, 16).map((e: any) => ({
        id: e.id, title: e.title, sport: e.sport, type: e.type, urgent: e.urgent,
      })));
    }
  }, [data]);

  useEffect(() => {
    const apiBase = (window as any).__API_BASE__ || "";
    const ev = new EventSource(`${apiBase}/api/feed/stream`);
    ev.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.event) {
          setItems(prev => [{ id: d.event.id, title: d.event.title, sport: d.event.sport, type: d.event.type, urgent: d.event.urgent }, ...prev].slice(0, 20));
        }
      } catch {}
    };
    return () => ev.close();
  }, []);

  if (!items.length) return null;

  return (
    <div className="relative h-10 flex items-center border-b overflow-hidden"
      style={{ background: "hsl(218 42% 4%)", borderColor: "hsl(218 28% 10%)" }}>

      {/* Live badge */}
      <div className="shrink-0 flex items-center gap-2 px-4 h-full border-r z-10 relative"
        style={{ background: "linear-gradient(135deg, hsl(263 100% 70% / 0.12), hsl(80 96% 58% / 0.06))", borderColor: "hsl(218 28% 12%)" }}>
        <span className="live-dot" />
        <span className="text-[9px] font-black uppercase tracking-[0.15em]"
          style={{ color: "hsl(263 100% 82%)" }}>Live</span>
      </div>

      {/* Fade masks */}
      <div className="absolute left-[88px] top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, hsl(218 42% 4%), transparent)" }} />
      <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, hsl(218 42% 4%), transparent)" }} />

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden">
        <div className="ticker-inner">
          {[...items, ...items].map((item, i) => {
            const cfg = SPORT_CFG[item.sport];
            const icon = TYPE_ICON[item.type] ?? "📌";
            return (
              <span key={`${item.id}-${i}`}
                className="inline-flex items-center gap-2 px-5 text-[11px]"
                style={{ color: item.urgent ? "hsl(263 100% 82%)" : "hsl(218 14% 54%)" }}>
                <span>{icon}</span>
                {cfg && (
                  <span className="font-black" style={{ color: cfg.color }}>
                    {cfg.emoji} {item.sport}
                  </span>
                )}
                <span className="font-medium">{item.title}</span>
                <span className="opacity-20">◆</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
