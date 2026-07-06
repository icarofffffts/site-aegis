import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAuth } from "@/lib/auth-check";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Lê o heartbeat do bot (arquivo gerado pelo AegisBot a cada 30s)
const BOT_STATUS_URL = process.env.BOT_STATUS_URL || "http://aegis-bot:3000/status";

async function getBotStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(BOT_STATUS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return { online: false, uptime: null };
    const data = await res.json();
    return { online: data.online, uptime: data.uptime, lastSeen: new Date().toISOString() };
  } catch {
    return { online: false, uptime: null };
  }
}

export const Route = createFileRoute("/api/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { result, clearHeaders } = await checkAuth(request);
        if (!result.authenticated) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              ...(clearHeaders || {}),
            },
          });
        }

        try {
          // 1. Total de alertas ativos
          const { count: totalAlerts } = await supabase
            .schema("aegis")
            .from("arx_alerts")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true);

          // 2. Alertas críticos ativos
          const { count: criticalAlerts } = await supabase
            .schema("aegis")
            .from("arx_alerts")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .eq("severity", "critical");

          // 3. Usuários únicos flagados
          const { data: flaggedData } = await supabase
            .schema("aegis")
            .from("arx_alerts")
            .select("discord_user_id")
            .eq("is_active", true);
          const flaggedUsers = new Set(flaggedData?.map((r) => r.discord_user_id) ?? []).size;

          // 4. Ações recentes (últimas 10)
          const { data: recentActions } = await supabase
            .schema("aegis")
            .from("arx_action_log")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

          // 5. Alertas das últimas 24h (para calcular "ataques bloqueados hoje")

          // Agrupa actions pelo usuário e tipo de ação para não poluir a tela
          const groupedActions = [];
          const actionMap = new Map();

          for (const action of recentActions || []) {
            const key = action.discord_user_id + "-" + action.action_type;
            if (actionMap.has(key)) {
              actionMap.get(key).count++;
            } else {
              const newAction = { ...action, count: 1 };
              actionMap.set(key, newAction);
              groupedActions.push(newAction);
            }
          }
          const finalRecentActions = groupedActions.slice(0, 15);

          const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count: alertsToday } = await supabase
            .schema("aegis")
            .from("arx_alerts")
            .select("*", { count: "exact", head: true })
            .gte("created_at", since24h);

          // 6. Fila de denúncias pendentes (tabela reports do Lotters Radar)
          const { data: pendingReports } = await supabase
            .schema("shield")
            .from("reports")
            .select("id, target_discord_id, reason, severity, created_at")
            .eq("status", "pending")
            .order("created_at", { ascending: true })
            .limit(20);

          // 7. Status do bot via heartbeat
          const botStatus = await getBotStatus();

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
              recentActions: finalRecentActions,
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
