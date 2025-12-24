// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { Card, CardContent } from "@/components/ui/card";
// import { Navigation } from "@/components/Navigation";
// import { useAuth } from "@/contexts/AuthContext";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2 } from "lucide-react";
// import { useSettings } from "@/contexts/SettingsContext";

// export default function Dashboard() {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const { darkMode } = useSettings();

//   const isAdminEmail = import.meta.env.VITE_ADMIN_USER_EMAIL;

//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalLikes: 0,
//     totalFeedback: 0,
//     todayUsers: 0,
//   });

//   useEffect(() => {
//     async function fetchStats() {
//       if (!user || user.email !== isAdminEmail) return;

//       try {
//         const { count: totalUsers } = await supabase
//           .from("profiles")
//           .select("id", { count: "exact", head: true });

//         const { count: totalLikes } = await supabase
//           .from("app_likes")
//           .select("id", { count: "exact", head: true });

//         const { count: totalFeedback } = await supabase
//           .from("app_feedback")
//           .select("id", { count: "exact", head: true });

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const { count: todayUsers } = await supabase
//           .from("profiles")
//           .select("id", { count: "exact", head: true })
//           .gte("last_extraction", today.toISOString());

//         setStats({
//           totalUsers: totalUsers || 0,
//           totalLikes: totalLikes || 0,
//           totalFeedback: totalFeedback || 0,
//           todayUsers: todayUsers || 0,
//         });
//       } catch (err) {
//         toast({ title: "Error", description: "Failed to load dashboard" });
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, [user]);

//   if (!user || user.email !== isAdminEmail) {
//     return (
//       <div className={darkMode ? "dark" : ""}>
//         <div className="min-h-screen bg-background flex items-center justify-center">
//           <div className="text-center text-xl font-bold text-red-500">
//             Access Denied
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-background">
//         <Navigation />

//         <main className="container mx-auto px-4 py-10 max-w-4xl">
//           <h1 className="text-3xl font-bold mb-8 text-foreground">
//             Admin Dashboard
//           </h1>

//           {loading ? (
//             <div className="flex justify-center items-center py-20">
//               <Loader2 className="animate-spin h-10 w-10 text-primary" />
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               <Card>
//                 <CardContent className="p-6 text-center">
//                   <h2 className="text-lg font-semibold text-foreground">
//                     Total Users
//                   </h2>
//                   <p className="text-3xl font-bold mt-2 text-foreground">
//                     {stats.totalUsers}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6 text-center">
//                   <h2 className="text-lg font-semibold text-foreground">
//                     Total Likes
//                   </h2>
//                   <p className="text-3xl font-bold mt-2 text-foreground">
//                     {stats.totalLikes}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6 text-center">
//                   <h2 className="text-lg font-semibold text-foreground">
//                     Feedback Messages
//                   </h2>
//                   <p className="text-3xl font-bold mt-2 text-foreground">
//                     {stats.totalFeedback}
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-6 text-center">
//                   <h2 className="text-lg font-semibold text-foreground">
//                     Active Users Today
//                   </h2>
//                   <p className="text-3xl font-bold mt-2 text-foreground">
//                     {stats.todayUsers}
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function AnalyticsDashboard() {
  // const { user } = useAuth();
  const { toast } = useToast();
  const { darkMode } = useSettings();

  // const isAdminEmail = import.meta.env.VITE_ADMIN_USER_EMAIL;

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    todayVisits: 0,
  });

  useEffect(() => {
    async function fetchAnalytics() {
      // if (!user || user.email !== isAdminEmail) return;

      try {
        const res = await fetch("https://floframe.app/api/analytics");
        const json = await res.json();

        const today = new Date().toISOString().slice(0, 10);
        const todayVisits = json.data.dailyVisits[today] || 0;

        setAnalytics({
          totalVisits: json.data.totalVisits,
          todayVisits,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load analytics",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // if (!user || user.email !== isAdminEmail) {
  //   return (
  //     <div className={darkMode ? "dark" : ""}>
  //       <div className="min-h-screen bg-background flex items-center justify-center">
  //         <div className="text-xl font-bold text-red-500">Access Denied</div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-10 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 text-foreground">
            Analytics Dashboard
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin h-10 w-10 text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
