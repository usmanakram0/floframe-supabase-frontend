import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { apiUrl } from "@/lib/api";

type AnalyticsData = {
  totalVisits: number;
  totalExtracts: number;
  dailyVisits: Record<string, number>;
  dailyExtracts: Record<string, number>;
  uniqueVisitors: Record<string, string[]>;
};

type AnalyticsResponse = {
  success: boolean;
  data: AnalyticsData;
  timestamp: string;
};

type AnalyticsSummary = {
  totalVisits: number;
  todayVisits: number;
  totalExtracts: number;
  todayExtracts: number;
  uniqueVisitorsToday: number;
  lastUpdated: string;
};

const emptySummary: AnalyticsSummary = {
  totalVisits: 0,
  todayVisits: 0,
  totalExtracts: 0,
  todayExtracts: 0,
  uniqueVisitorsToday: 0,
  lastUpdated: "",
};

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const { darkMode } = useSettings();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(emptySummary);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(apiUrl("/api/analytics"));
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const json: AnalyticsResponse = await res.json();
        const today = new Date().toISOString().slice(0, 10);
        const todayVisits = json.data.dailyVisits[today] || 0;
        const todayExtracts = json.data.dailyExtracts[today] || 0;
        const uniqueVisitorsToday = json.data.uniqueVisitors[today]?.length || 0;

        setAnalytics({
          totalVisits: json.data.totalVisits,
          totalExtracts: json.data.totalExtracts,
          todayVisits,
          todayExtracts,
          uniqueVisitorsToday,
          lastUpdated: json.timestamp,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to load analytics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [toast]);

  const formattedLastUpdated = analytics.lastUpdated
    ? new Date(analytics.lastUpdated).toLocaleString()
    : "";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-10 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            {!loading && formattedLastUpdated ? (
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {formattedLastUpdated}
              </p>
            ) : null}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    Total Visits
                  </h2>
                  <p className="text-3xl font-bold mt-2 text-foreground">
                    {analytics.totalVisits}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    Visits Today
                  </h2>
                  <p className="text-3xl font-bold mt-2 text-foreground">
                    {analytics.todayVisits}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    Unique Visitors Today
                  </h2>
                  <p className="text-3xl font-bold mt-2 text-foreground">
                    {analytics.uniqueVisitorsToday}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    Total Extracts
                  </h2>
                  <p className="text-3xl font-bold mt-2 text-foreground">
                    {analytics.totalExtracts}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-semibold text-foreground">
                    Extracts Today
                  </h2>
                  <p className="text-3xl font-bold mt-2 text-foreground">
                    {analytics.todayExtracts}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
