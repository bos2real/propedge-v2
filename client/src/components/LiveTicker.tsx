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

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const lastIdRef = useRef<number>(0);

  const { data: initialEvents } = useQuery({
    queryKey: ["/api/feed"],
    queryFn: () => apiRequest("GET", "/api/feed?limit=20").then(r => r.json()),
  });

  // Seed ticker from initial events
  useEffect(() => {
    if (initialEvents?.length) {
      const mapped = initialEvents.slice(0, 12).map((e: any) => ({
        id: e.id,
        title: e.title,
        sport: e.sport,
        type: e.type,
        urgent: e.urgent,
      }));
      setItems(mapped);
      lastIdRef.current = initialEvents[0]?.id ?? 0;
    }
  }, [initialEvents]);

  // SSE for live updates
  useEffect(() => {
    const apiBase = (window as any).__API_BASE__ || "";
    const url = `${apiBase}/api/feed/stream`.replace("__PORT_5000__", window.location.origin);
    const ev = new EventSource(url);

    ev.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event) {
          setItems(prev => {
            const newItem: TickerItem = {
              id: data.event.id,
              title: data.event.title,
              sport: data.event.sport,
              type: data.event.type,
              urgent: data.event.urgent,
            };
            return [newItem, ...prev].slice(0, 20);
          });
        }
      } catch {}
    };

    return () => ev.close();
  }, []);

  if (!items.length) return null;

  const sportColor: Record<string, string> = {
    MLB: "text-red-400",
    NBA: "text-orange-400",
    NHL: "text-sky-400",
    Tennis: "text-lime-400",
  };

  return (
    <div className="h-8 bg-secondary/50 border-b border-border overflow-hidden flex items-center">
      <div className="shrink-0 flex items-center gap-2 px-3 border-r border-border h-full" style={{background:"hsl(258 90% 66% / 0.08)"}}>
        <span className="live-dot" />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:"hsl(258 90% 78%)"}}>Live</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="ticker-inner text-xs text-muted-foreground">
          {[...items, ...items].map((item, i) => (
            <span key={`${item.id}-${i}`} className="flex items-center gap-2">
              <span className={`font-semibold ${sportColor[item.sport] || "text-muted-foreground"}`}>
                [{item.sport}]
              </span>
              <span className={item.urgent ? "font-medium" : ""} style={item.urgent ? {color:"hsl(258 90% 78%)"} : undefined}>{item.title}</span>
              <span className="text-border">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
