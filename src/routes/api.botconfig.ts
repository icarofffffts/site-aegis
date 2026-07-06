import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAuth } from "@/lib/auth-check";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const Route = createFileRoute("/api/botconfig")({
  server: {
    handlers: {
      // GET — busca alertas de um usuário específico
      GET: async ({ request }) => {
        const { result } = await checkAuth(request);
        if (!result.authenticated)
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });

        const url = new URL(request.url);
        const userId = url.searchParams.get("userId");

        if (userId) {
          const { data: alerts } = await supabase
            .schema("aegis")
            .from("arx_alerts")
            .select("*")
            .eq("discord_user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20);

          return new Response(JSON.stringify({ alerts: alerts ?? [] }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        const { data: flagged } = await supabase
          .schema("aegis")
          .from("arx_alerts")
          .select("discord_user_id, severity, alert_type, created_at, message")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(50);

        const users: Record<
          string,
          { count: number; maxSeverity: string; types: string[]; lastSeen: string }
        > = {};
        const severityOrder = ["critical", "high", "medium", "low"];
        for (const a of flagged ?? []) {
          if (!users[a.discord_user_id]) {
            users[a.discord_user_id] = {
              count: 0,
              maxSeverity: "low",
              types: [],
              lastSeen: a.created_at,
            };
          }
          users[a.discord_user_id].count++;
          if (!users[a.discord_user_id].types.includes(a.alert_type)) {
            users[a.discord_user_id].types.push(a.alert_type);
          }
          const cur = severityOrder.indexOf(users[a.discord_user_id].maxSeverity);
          const next = severityOrder.indexOf(a.severity);
          if (next < cur) users[a.discord_user_id].maxSeverity = a.severity;
        }

        return new Response(JSON.stringify({ flaggedUsers: users }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      // DELETE — desativa todos os alertas de um usuário
      DELETE: async ({ request }) => {
        const { result } = await checkAuth(request);
        if (!result.authenticated)
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });

        const url = new URL(request.url);
        const userId = url.searchParams.get("userId");
        if (!userId)
          return new Response(JSON.stringify({ error: "userId required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });

        const { error } = await supabase
          .schema("aegis")
          .from("arx_alerts")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("discord_user_id", userId)
          .eq("is_active", true);

        if (error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
