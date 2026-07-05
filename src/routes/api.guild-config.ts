import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAuth } from "@/lib/auth-check";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const ALLOWED_FIELDS = [
  "alert_log_channel_id",
  "welcome_channel_id",
  "moderation_log_channel_id",
  "welcome_message",
  "auto_kick_on_critical",
  "auto_mute_duration",
  "require_approval_for_alerts",
  "max_warnings_before_kick",
  "disclosure_detection_enabled",
  "raid_threshold",
  "account_min_age_days",
  "server_name",
];

const INTEGER_FIELDS = ["raid_threshold", "account_min_age_days", "auto_mute_duration", "max_warnings_before_kick"];

export const Route = createFileRoute("/api/guild-config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { result } = await checkAuth(request);
        if (!result.authenticated)
          return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

        const url = new URL(request.url);
        const guildId = url.searchParams.get("guildId");
        if (!guildId) return new Response(JSON.stringify({ error: "guildId required" }), { status: 400, headers: { "Content-Type": "application/json" } });

        const { data } = await supabase.schema("aegis").from("arx_server_config").select("*").eq("discord_guild_id", guildId).single();
        return new Response(JSON.stringify({ config: data ?? null }), { headers: { "Content-Type": "application/json" } });
      },

      PATCH: async ({ request }) => {
        const { result } = await checkAuth(request);
        if (!result.authenticated)
          return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

        const body = await request.json() as { guildId: string; config: Record<string, unknown> };
        const { guildId, config } = body;
        if (!guildId) return new Response(JSON.stringify({ error: "guildId required" }), { status: 400, headers: { "Content-Type": "application/json" } });

        // Filtrar apenas campos validos da tabela arx_server_config
        const safeConfig: Record<string, unknown> = {};
        for (const field of ALLOWED_FIELDS) {
          if (Object.prototype.hasOwnProperty.call(config, field)) {
            let value = config[field];
            // Converter campos inteiros com parseInt
            if (INTEGER_FIELDS.includes(field) && value !== null && value !== undefined && value !== "") {
              const parsed = parseInt(String(value), 10);
              value = isNaN(parsed) ? null : parsed;
            }
            safeConfig[field] = value;
          }
        }

        const { data: existing } = await supabase.schema("aegis").from("arx_server_config").select("id").eq("discord_guild_id", guildId).single();

        let res;
        if (existing) {
          res = await supabase.schema("aegis").from("arx_server_config").update({ ...safeConfig, updated_at: new Date().toISOString() }).eq("discord_guild_id", guildId).select().single();
        } else {
          res = await supabase.schema("aegis").from("arx_server_config").insert({ discord_guild_id: guildId, ...safeConfig }).select().single();
        }

        if (res.error) return new Response(JSON.stringify({ error: res.error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ ok: true, config: res.data }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
