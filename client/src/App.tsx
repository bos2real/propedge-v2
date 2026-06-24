import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "./components/Sidebar";
import LiveTicker from "./components/LiveTicker";
import Home from "./pages/Home";
import SportPage from "./pages/SportPage";
import GamesPage from "./pages/GamesPage";
import SavedPage from "./pages/SavedPage";
import NotFound from "./pages/not-found";
import { SlipProvider, useSlip } from "./context/SlipContext";
import LineupSlip from "./components/LineupSlip";

function AppLayout() {
  const { slipPicks, removeFromSlip, clearSlip } = useSlip();
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <LiveTicker />
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/mlb" component={() => <SportPage sport="MLB" />} />
            <Route path="/nba" component={() => <SportPage sport="NBA" />} />
            <Route path="/nhl" component={() => <SportPage sport="NHL" />} />
            <Route path="/tennis" component={() => <SportPage sport="Tennis" />} />
            <Route path="/games" component={GamesPage} />
            <Route path="/saved" component={SavedPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      {/* Floating lineup slip */}
      <LineupSlip
        picks={slipPicks}
        onRemove={removeFromSlip}
        onClear={clearSlip}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SlipProvider>
        {/* Router wraps EVERYTHING including Sidebar so Links work */}
        <Router hook={useHashLocation}>
          <AppLayout />
          <Toaster />
        </Router>
      </SlipProvider>
    </QueryClientProvider>
  );
}
