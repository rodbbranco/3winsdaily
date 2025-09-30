import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Header } from "@/components/layout/Header";
import { WinsEntryForm } from "@/components/dashboard/WinsEntryForm";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { RecentWins } from "@/components/dashboard/RecentWins";
import { StatsOverview } from "@/components/dashboard/StatsOverview";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleWinsSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-moody">
      <Header />
      
      <main className="container py-8 space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <WinsEntryForm key={`form-${refreshKey}`} onWinsSaved={handleWinsSaved} />
            <RecentWins key={`recent-${refreshKey}`} />
          </div>
          
          <div className="space-y-6">
            <StreakDisplay key={`streak-${refreshKey}`} />
            <StatsOverview key={`stats-${refreshKey}`} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
