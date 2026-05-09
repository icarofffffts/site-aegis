import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Lê o heartbeat do bot (arquivo gerado pelo AegisBot a cada 30s)
function getBotStatus() {
  try {
    const heartbeatPath = path.join(
      process.cwd(),
      "..",
      "AegisBot",
      "src",
      "database",
      "data",
      "heartbeat.json",
    );
    if (!fs.existsSync(heartbeatPath)) return { online: false, uptime: null };
    const data = JSON.parse(fs.readFileSync(heartbeatPath, "utf-8"));
    const age = Date.now() - new Date(data.timestamp).getTime();
    return { online: age < 90000, lastSeen: data.timestamp, pid: data.pid };
  } catch {
    return { online: false, uptime: null };
  }
}

export const Route = createFileRoute("/api/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Verificar sessão
        const cookieHeader = request.headers.get("cookie") ?? "";
        const match = cookieHeader.match(/aegis_session=([^;]+)/);
        if (!match) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const session = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));
          if (Date.now() > session.expiresAt) {
            return new Response(JSON.stringify({ error: "session_expired" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch {
          return new Response(JSON.stringify({ error: "invalid_session" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          // 1. Total de alertas ativos
          const { count: totalAlerts } = await supabase
            .from("arx_alerts")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true);

          // 2. Alertas críticos ativos
          const { count: criticalAlerts } = await supabase
            .from("arx_alerts")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .eq("severity", "critical");

          // 3. Usuários únicos flagados
          const { data: flaggedData } = await supabase
            .from("arx_alerts")
            .select("discord_user_id")
            .eq("is_active", true);
          const flaggedUsers = new Set(flaggedData?.map((r) => r.discord_user_id) ?? []).size;

          // 4. Ações recentes (últimas 10)
          const { data: recentActions } = await supabase
            .from("arx_action_log")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

          // 5. Alertas das últimas 24h (para calcular "ataques bloqueados hoje")
          const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count: alertsToday } = await supabase
            .from("arx_alerts")
            .select("*", { count: "exact", head: true })
            .gte("created_at", since24h);

          // 6. Fila de denúncias pendentes (tabela reports do Lotters Radar)
          const { data: pendingReports } = await supabase
            .from("reports")
            .select("id, target_discord_id, reason, severity, created_at")
            .eq("status", "pending")
            .order("created_at", { ascending: true })
            .limit(20);

          // 7. Status do bot via heartbeat
          const botStatus = getBotStatus();

          return new Response(
            JSON.stringify({
              stats: {
                totalAlerts: totalAlerts ?? 0,
                criticalAlerts: criticalAlerts ?? 0,
                flaggedUsers,
                alertsToday: alertsToday ?? 0,
                botOnline: botStatus.online,
                botLastSeen: botStatus.lastSeen ?? null,
              },
              recentActions: recentActions ?? [],
              pendingReports: pendingReports ?? [],
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          console.error("[api/dashboard] Error:", err);
          return new Response(JSON.stringify({ error: "internal_error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
