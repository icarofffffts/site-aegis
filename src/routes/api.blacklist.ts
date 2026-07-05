import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const Route = createFileRoute("/api/blacklist")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const guildId = url.searchParams.get("guildId") || "";
        const { data, error } = await supabase
          .schema("aegis").from("arx_blacklist")
          .select("*")
          .eq("guild_id", guildId)
          .order("added_at", { ascending: false });
        return new Response(JSON.stringify({ data: data ?? [], error }), {
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        const { guildId, value, isRegex, addedBy } = await request.json();
        if (!value) return new Response(JSON.stringify({ error: "value is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        const { data, error } = await supabase
          .schema("aegis").from("arx_blacklist")
          .upsert({ guild_id: guildId || "", value, is_regex: !!isRegex, added_by: addedBy || "dashboard" })
          .select()
          .single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ data }), { headers: { "Content-Type": "application/json" } });
      },
      DELETE: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return new Response(JSON.stringify({ error: "id is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        const { error } = await supabase
          .schema("aegis").from("arx_blacklist")
          .delete().eq("id", id);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});
