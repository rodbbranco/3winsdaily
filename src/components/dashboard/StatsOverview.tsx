import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  total_wins: number;
  work_count: number;
  personal_count: number;
  growth_count: number;
}

export const StatsOverview = () => {
  const [stats, setStats] = useState<Stats>({
    total_wins: 0,
    work_count: 0,
    personal_count: 0,
    growth_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("daily_wins")
        .select("work_win, personal_win, growth_win")
        .eq("user_id", user.id);

      if (error) throw error;

      if (data) {
        const stats = {
          total_wins: data.length,
          work_count: data.filter(w => w.work_win).length,
          personal_count: data.filter(w => w.personal_win).length,
          growth_count: data.filter(w => w.growth_win).length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMostActiveCategory = () => {
    const { work_count, personal_count, growth_count } = stats;
    const max = Math.max(work_count, personal_count, growth_count);
    
    if (max === 0) return "None yet";
    if (work_count === max) return "Work";
    if (personal_count === max) return "Personal";
    return "Growth";
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-card">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 shadow-card">
        <div className="flex lg:flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold">{stats.total_wins}</p>
            <p className="text-sm text-muted-foreground">Total Wins</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex lg:flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-accent/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-accent flex-shrink-0" />
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold">{getMostActiveCategory()}</p>
            <p className="text-sm text-muted-foreground">Top Category</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex lg:flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success flex-shrink-0" />
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold">
              {stats.total_wins > 0 ? "Active" : "Start"}
            </p>
            <p className="text-sm text-muted-foreground">Status</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
