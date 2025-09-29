import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, Heart, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface WinEntry {
  work_win: string;
  personal_win: string;
  growth_win: string;
}

interface WinsEntryFormProps {
  onWinsSaved: () => void;
}

const MAX_CHARS = 280;

export const WinsEntryForm = ({ onWinsSaved }: WinsEntryFormProps) => {
  const [wins, setWins] = useState<WinEntry>({
    work_win: "",
    personal_win: "",
    growth_win: "",
  });
  const [loading, setLoading] = useState(false);
  const [existingEntry, setExistingEntry] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    loadTodaysWins();
  }, []);

  const loadTodaysWins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("daily_wins")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWins({
          work_win: data.work_win || "",
          personal_win: data.personal_win || "",
          growth_win: data.growth_win || "",
        });
        setExistingEntry(true);
      }
    } catch (error) {
      console.error("Error loading wins:", error);
    }
  };

  const handleChange = (field: keyof WinEntry, value: string) => {
    if (value.length <= MAX_CHARS) {
      setWins({ ...wins, [field]: value });
    }
  };

  const hasAnyWin = wins.work_win || wins.personal_win || wins.growth_win;

  const handleSave = async () => {
    if (!hasAnyWin) {
      toast.error("Please enter at least one win");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: winsError } = await supabase
        .from("daily_wins")
        .upsert({
          user_id: user.id,
          date: today,
          work_win: wins.work_win || null,
          personal_win: wins.personal_win || null,
          growth_win: wins.growth_win || null,
        }, {
          onConflict: "user_id,date",
        });

      if (winsError) throw winsError;

      // Update streak
      const { data: streak } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (streak) {
        const lastDate = streak.last_entry_date ? new Date(streak.last_entry_date) : null;
        const todayDate = new Date(today);
        
        let newStreak = streak.current_streak;
        
        if (!lastDate || lastDate.toISOString().split('T')[0] !== today) {
          if (lastDate) {
            const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
              newStreak += 1;
            } else if (daysDiff > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          const { error: streakError } = await supabase
            .from("streaks")
            .update({
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, streak.longest_streak),
              last_entry_date: today,
            })
            .eq("user_id", user.id);

          if (streakError) throw streakError;
        }
      }

      toast.success(
        existingEntry ? "Wins updated! 🎉" : "Today's wins saved! 🎉",
        {
          description: "Keep the momentum going!",
        }
      );
      
      setExistingEntry(true);
      onWinsSaved();
    } catch (error) {
      console.error("Error saving wins:", error);
      toast.error("Failed to save wins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </h2>
        <p className="text-muted-foreground">What went well today?</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="work" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-work/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-work" />
              </div>
              Work Win
            </Label>
            <span className="text-xs text-muted-foreground">
              {wins.work_win.length}/{MAX_CHARS}
            </span>
          </div>
          <Textarea
            id="work"
            placeholder="What did you accomplish at work today?"
            value={wins.work_win}
            onChange={(e) => handleChange("work_win", e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="personal" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-personal/10 flex items-center justify-center">
                <Heart className="w-4 h-4 text-personal" />
              </div>
              Personal Win
            </Label>
            <span className="text-xs text-muted-foreground">
              {wins.personal_win.length}/{MAX_CHARS}
            </span>
          </div>
          <Textarea
            id="personal"
            placeholder="What made you smile today?"
            value={wins.personal_win}
            onChange={(e) => handleChange("personal_win", e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="growth" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-growth/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-growth" />
              </div>
              Growth Win
            </Label>
            <span className="text-xs text-muted-foreground">
              {wins.growth_win.length}/{MAX_CHARS}
            </span>
          </div>
          <Textarea
            id="growth"
            placeholder="What did you learn today?"
            value={wins.growth_win}
            onChange={(e) => handleChange("growth_win", e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasAnyWin || loading}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : existingEntry ? "Update Today's Wins" : "Save Today's Wins"}
        </Button>
      </div>
    </Card>
  );
};
