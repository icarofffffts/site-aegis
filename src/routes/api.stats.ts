import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAuth } from "@/lib/auth-check";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { result } = await checkAuth(request);
        if (!result.authenticated)
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });

        const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const { data: alertsByDay } = await supabase
          .schema("aegis")
          .from("arx_alerts")
          .select("created_at, severity")
          .gte("created_at", since14d)
          .order("created_at", { ascending: true });

        const byDay: Record<
          string,
          { total: number; critical: number; high: number; medium: number; low: number }
        > = {};
        for (const alert of alertsByDay ?? []) {
          const day = alert.created_at.slice(0, 10);
          if (!byDay[day]) byDay[day] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
          byDay[day].total++;
          byDay[day][alert.severity as keyof (typeof byDay)[string]]++;
        }

        const { data: byType } = await supabase
          .schema("aegis")
          .from("arx_alerts")
          .select("alert_type")
          .eq("is_active", true);

        const typeCount: Record<string, number> = {};
        for (const a of byType ?? []) {
          typeCount[a.alert_type] = (typeCount[a.alert_type] ?? 0) + 1;
        }

        const { data: bySeverity } = await supabase
          .schema("aegis")
          .from("arx_alerts")
          .select("severity")
          .eq("is_active", true);

        const severityCount: Record<string, number> = {};
        for (const a of bySeverity ?? []) {
          severityCount[a.severity] = (severityCount[a.severity] ?? 0) + 1;
        }

        const { data: actionsByDay } = await supabase
          .schema("aegis")
          .from("arx_action_log")
          .select("created_at, action_type")
          .gte("created_at", since14d)
          .order("created_at", { ascending: true });

        const actionsByDayMap: Record<string, number> = {};
        for (const a of actionsByDay ?? []) {
          const day = a.created_at.slice(0, 10);
          actionsByDayMap[day] = (actionsByDayMap[day] ?? 0) + 1;
        }

        return new Response(
          JSON.stringify({
            alertsByDay: byDay,
            actionsByDay: actionsByDayMap,
            byType: typeCount,
            bySeverity: severityCount,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
