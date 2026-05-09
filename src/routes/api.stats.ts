import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function getSession(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/aegis_session=([^;]+)/);
  if (!match) return null;
  try {
    const s = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));
    return Date.now() > s.expiresAt ? null : s;
  } catch { return null; }
}

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!getSession(request)) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

        // Alertas por dia nos últimos 14 dias
        const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const { data: alertsByDay } = await supabase
          .from("arx_alerts")
          .select("created_at, severity")
          .gte("created_at", since14d)
          .order("created_at", { ascending: true });

        // Agrupar por dia
        const byDay: Record<string, { total: number; critical: number; high: number; medium: number; low: number }> = {};
        for (const alert of alertsByDay ?? []) {
          const day = alert.created_at.slice(0, 10);
          if (!byDay[day]) byDay[day] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
          byDay[day].total++;
          byDay[day][alert.severity as keyof typeof byDay[string]]++;
        }

        // Distribuição por tipo de alerta
        const { data: byType } = await supabase
          .from("arx_alerts")
          .select("alert_type")
          .eq("is_active", true);

        const typeCount: Record<string, number> = {};
        for (const a of byType ?? []) {
          typeCount[a.alert_type] = (typeCount[a.alert_type] ?? 0) + 1;
        }

        // Distribuição por severidade
        const { data: bySeverity } = await supabase
          .from("arx_alerts")
          .select("severity")
          .eq("is_active", true);

        const severityCount: Record<string, number> = {};
        for (const a of bySeverity ?? []) {
          severityCount[a.severity] = (severityCount[a.severity] ?? 0) + 1;
        }

        // Ações dos últimos 14 dias
        const { data: actionsByDay } = await supabase
          .from("arx_action_log")
          .select("created_at, action_type")
          .gte("created_at", since14d)
          .order("created_at", { ascending: true });

        const actionsByDayMap: Record<string, number> = {};
        for (const a of actionsByDay ?? []) {
          const day = a.created_at.slice(0, 10);
          actionsByDayMap[day] = (actionsByDayMap[day] ?? 0) + 1;
        }

        return new Response(JSON.stringify({
          alertsByDay: byDay,
          actionsByDay: actionsByDayMap,
          byType: typeCount,
          bySeverity: severityCount,
        }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
