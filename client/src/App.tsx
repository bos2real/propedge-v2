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

function AppLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <LiveTicker />
        <main className="flex-1 overflow-y-auto">
          <Router hook={useHashLocation}>
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
          </Router>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout />
      <Toaster />
    </QueryClientProvider>
  );
}
