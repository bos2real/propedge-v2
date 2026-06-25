import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TickerItem {
  id: number;
  title: string;
  sport: string;
  type: string;
  urgent: number;
}

const SPORT_STYLE: Record<string, { color: string; emoji: string }> = {
  MLB:    { color: "hsl(4 92% 68%)",   emoji: "⚾" },
  NBA:    { color: "hsl(32 100% 62%)", emoji: "🏀" },
  NHL:    { color: "hsl(198 92% 64%)", emoji: "🏒" },
  Tennis: { color: "hsl(82 92% 60%)",  emoji: "🎾" },
};

const TYPE_ICON: Record<string, string> = {
  new_pick: "🎯", result: "📊", line_move: "📈", hot_streak: "🔥", injury: "⚠️",
};

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  const { data: initialEvents } = useQuery({
    queryKey: ["/api/feed"],
    queryFn: () => apiRequest("GET", "/api/feed?limit=20").then(r => r.json()),
  });

  useEffect(() => {
    if (initialEvents?.length) {
      setItems(initialEvents.slice(0, 15).map((e: any) => ({
        id: e.id, title: e.title, sport: e.sport, type: e.type, urgent: e.urgent,
      })));
    }
  }, [initialEvents]);

  useEffect(() => {
    const apiBase = (window as any).__API_BASE__ || "";
    const ev = new EventSource(`${apiBase}/api/feed/stream`);
    ev.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event) {
          setItems(prev => [{
            id: data.event.id, title: data.event.title,
            sport: data.event.sport, type: data.event.type, urgent: data.event.urgent,
          }, ...prev].slice(0, 20));
        }
      } catch {}
    };
    return () => ev.close();
  }, []);

  if (!items.length) return null;

  return (
    <div className="relative h-9 overflow-hidden flex items-center border-b"
      style={{
        background: "hsl(220 40% 5%)",
        borderColor: "hsl(220 28% 11%)",
      }}>
      {/* Gradient fade left/right */}
      <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, hsl(220 40% 5%), transparent)" }} />
      <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, hsl(220 40% 5%), transparent)" }} />

      {/* Live badge */}
      <div className="shrink-0 flex items-center gap-1.5 px-3 border-r h-full z-20 relative"
        style={{ background: "hsl(260 95% 68% / 0.1)", borderColor: "hsl(220 28% 14%)" }}>
        <span className="live-dot" />
        <span className="text-[9px] font-black uppercase tracking-widest"
          style={{ color: "hsl(260 95% 78%)" }}>Live</span>
      </div>

      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden">
        <div className="ticker-inner">
          {[...items, ...items].map((item, i) => {
            const ss = SPORT_STYLE[item.sport];
            const icon = TYPE_ICON[item.type] ?? "📌";
            return (
              <span key={`${item.id}-${i}`}
                className="inline-flex items-center gap-2 px-4"
                style={{ color: item.urgent ? "hsl(260 95% 80%)" : "hsl(220 12% 56%)" }}>
                <span className="text-[11px]">{icon}</span>
                {ss && (
                  <span className="text-[10px] font-black" style={{ color: ss.color }}>
                    {ss.emoji} {item.sport}
                  </span>
                )}
                <span className="text-[10px] font-medium">{item.title}</span>
                <span style={{ color: "hsl(220 28% 18%)" }}>◦</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
