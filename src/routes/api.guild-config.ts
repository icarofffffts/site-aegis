import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAuth } from "@/lib/auth-check";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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

        const { data: existing } = await supabase.schema("aegis").from("arx_server_config").select("id").eq("discord_guild_id", guildId).single();

        let res;
        if (existing) {
          res = await supabase.schema("aegis").from("arx_server_config").update({ ...config, updated_at: new Date().toISOString() }).eq("discord_guild_id", guildId).select().single();
        } else {
          res = await supabase.schema("aegis").from("arx_server_config").insert({ discord_guild_id: guildId, ...config }).select().single();
        }

        if (res.error) return new Response(JSON.stringify({ error: res.error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ ok: true, config: res.data }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
