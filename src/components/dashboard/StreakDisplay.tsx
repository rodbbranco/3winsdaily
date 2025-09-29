import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Streak {
  current_streak: number;
  longest_streak: number;
}

export const StreakDisplay = () => {
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) setStreak(data);
    } catch (error) {
      console.error("Error loading streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneMessage = (days: number) => {
    if (days === 0) return "Start your journey";
    if (days < 3) return "Great start!";
    if (days < 7) return "Building momentum!";
    if (days < 14) return "On fire! 🔥";
    if (days < 30) return "Incredible consistency!";
    if (days < 100) return "You're unstoppable!";
    return "Legendary streak! 🏆";
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
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-success opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
          </div>
          <p className="text-4xl font-bold text-success mb-1">
            {streak.current_streak}
          </p>
          <p className="text-sm text-muted-foreground">
            {getMilestoneMessage(streak.current_streak)}
          </p>
        </div>
      </Card>

      <Card className="p-6 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-warm opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Best Streak</h3>
          </div>
          <p className="text-4xl font-bold text-primary mb-1">
            {streak.longest_streak}
          </p>
          <p className="text-sm text-muted-foreground">
            {streak.longest_streak === streak.current_streak && streak.current_streak > 0
              ? "Matching your record!"
              : "Your personal best"}
          </p>
        </div>
      </Card>
    </div>
  );
};
