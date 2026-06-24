import { createContext, useContext, useState, ReactNode } from "react";
import { SlipPick } from "@/components/LineupSlip";

interface SlipCtx {
  slipPicks: SlipPick[];
  addToSlip: (pick: SlipPick) => void;
  removeFromSlip: (id: number) => void;
  clearSlip: () => void;
  isInSlip: (id: number) => boolean;
}

const SlipContext = createContext<SlipCtx | null>(null);

export function SlipProvider({ children }: { children: ReactNode }) {
  const [slipPicks, setSlipPicks] = useState<SlipPick[]>([]);

  const addToSlip = (pick: SlipPick) => {
    setSlipPicks(prev => {
      if (prev.find(p => p.id === pick.id)) return prev;
      if (prev.length >= 6) return prev; // max 6
      return [...prev, pick];
    });
  };

  const removeFromSlip = (id: number) => {
    setSlipPicks(prev => prev.filter(p => p.id !== id));
  };

  const clearSlip = () => setSlipPicks([]);

  const isInSlip = (id: number) => slipPicks.some(p => p.id === id);

  return (
    <SlipContext.Provider value={{ slipPicks, addToSlip, removeFromSlip, clearSlip, isInSlip }}>
      {children}
    </SlipContext.Provider>
  );
}

export function useSlip() {
  const ctx = useContext(SlipContext);
  if (!ctx) throw new Error("useSlip must be used within SlipProvider");
  return ctx;
}
