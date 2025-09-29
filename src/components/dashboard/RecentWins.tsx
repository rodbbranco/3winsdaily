import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Briefcase, Heart, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DailyWin {
  id: string;
  date: string;
  work_win: string | null;
  personal_win: string | null;
  growth_win: string | null;
}

export const RecentWins = () => {
  const [wins, setWins] = useState<DailyWin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentWins();
  }, []);

  const loadRecentWins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("daily_wins")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(7);

      if (error) throw error;
      if (data) setWins(data);
    } catch (error) {
      console.error("Error loading recent wins:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Recent Wins</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-1"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (wins.length === 0) {
    return (
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Recent Wins</h3>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No wins recorded yet. Start tracking your victories today!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Recent Wins</h3>
      <div className="space-y-6">
        {wins.map((win) => (
          <div key={win.id} className="border-l-2 border-primary/20 pl-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(win.date), "EEEE, MMM d")}
            </div>
            
            {win.work_win && (
              <div className="flex gap-2">
                <Briefcase className="w-4 h-4 text-work mt-0.5 flex-shrink-0" />
                <p className="text-sm">{win.work_win}</p>
              </div>
            )}
            
            {win.personal_win && (
              <div className="flex gap-2">
                <Heart className="w-4 h-4 text-personal mt-0.5 flex-shrink-0" />
                <p className="text-sm">{win.personal_win}</p>
              </div>
            )}
            
            {win.growth_win && (
              <div className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-growth mt-0.5 flex-shrink-0" />
                <p className="text-sm">{win.growth_win}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
