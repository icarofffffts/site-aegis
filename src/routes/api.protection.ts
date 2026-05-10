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

export const Route = createFileRoute("/api/protection")({
  server: {
    handlers: {
      // GET — busca config + padrões de um servidor
      GET: async ({ request }) => {
        if (!getSession(request)) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

        const url = new URL(request.url);
        const guildId = url.searchParams.get("guildId");
        if (!guildId) return new Response(JSON.stringify({ error: "guildId required" }), { status: 400, headers: { "Content-Type": "application/json" } });

        const [{ data: config }, { data: patterns }] = await Promise.all([
          supabase.schema("aegis").from("arx_server_config").select("*").eq("discord_guild_id", guildId).single(),
          supabase.schema("aegis").from("arx_detection_patterns").select("*").eq("discord_guild_id", guildId).eq("is_active", true).order("created_at", { ascending: false }),
        ]);

        return new Response(JSON.stringify({ config: config ?? null, patterns: patterns ?? [] }), { headers: { "Content-Type": "application/json" } });
      },

      // PATCH — atualiza config do servidor
      PATCH: async ({ request }) => {
        const session = getSession(request);
        if (!session) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

        const body = await request.json() as { guildId: string; config: Record<string, unknown> };
        const { guildId, config } = body;
        if (!guildId) return new Response(JSON.stringify({ error: "guildId required" }), { status: 400, headers: { "Content-Type": "application/json" } });

        const { data: existing } = await supabase.schema("aegis").from("arx_server_config").select("id").eq("discord_guild_id", guildId).single();

        let result;
        if (existing) {
          result = await supabase.schema("aegis").from("arx_server_config").update({ ...config, updated_at: new Date().toISOString() }).eq("discord_guild_id", guildId).select().single();
        } else {
          result = await supabase.schema("aegis").from("arx_server_config").insert({ discord_guild_id: guildId, ...config }).select().single();
        }

        if (result.error) return new Response(JSON.stringify({ error: result.error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ ok: true, config: result.data }), { headers: { "Content-Type": "application/json" } });
      },

      // POST — adiciona padrão de detecção
      POST: async ({ request }) => {
        const session = getSession(request);
        if (!session) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

        const body = await request.json() as { guildId: string; patternType: string; patternValue: string; severity: string; description: string };
        const { guildId, patternType, patternValue, severity, description } = body;

        const { data, error } = await supabase.schema("aegis").from("arx_detection_patterns").insert({
          discord_guild_id: guildId,
          pattern_type: patternType,
          pattern_value: patternValue,
          severity,
          description,
          created_by: session.id,
        }).select().single();

        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ ok: true, pattern: data }), { headers: { "Content-Type": "application/json" } });
      },

      // DELETE — desativa padrão
      DELETE: async ({ request }) => {
        const session = getSession(request);
        if (!session) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: { "Content-Type": "application/json" } });

        const { error } = await supabase.schema("aegis").from("arx_detection_patterns").update({ is_active: false }).eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
