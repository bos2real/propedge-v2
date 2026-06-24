import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import PickCard from "@/components/PickCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
  const { data: saved = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/saved"],
    queryFn: () => apiRequest("GET", "/api/saved").then(r => r.json()),
    refetchInterval: 30000,
  });

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-400" />
          Saved Picks
        </h1>
        <p className="text-sm text-muted-foreground">Your bookmarked AI picks</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No saved picks yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Tap the bookmark icon on any pick card to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {saved.map(pick => (
            <PickCard key={pick.id} pick={pick} isSaved />
          ))}
        </div>
      )}
    </div>
  );
}
