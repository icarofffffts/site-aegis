import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAuth } from "@/lib/auth-check";
import fs from "node:fs";
import path from "node:path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const ALLOWED_FIELDS = [
  "server_name",
  "alert_log_channel_id",
  "moderation_log_channel_id",
  "welcome_channel_id",
  "welcome_message",
  "welcome_enabled",
  "welcome_message_type",
  "auto_kick_on_critical",
  "auto_mute_duration",
  "require_approval_for_alerts",
  "max_warnings_before_kick",
  "disclosure_detection_enabled",
  "raid_threshold",
  "account_min_age_days",
  "grace_period_seconds",
  "instant_ban_hours",
  "whitelabel_enabled",
  "whitelabel_logo_url",
  "whitelabel_banner_url",
  "whitelabel_bot_name",
  "whitelabel_bot_footer",
  "whitelabel_embed_color",
  "whitelabel_hide_watermark",
];

const WHITELABEL_FIELDS = [
  "whitelabel_enabled",
  "whitelabel_logo_url",
  "whitelabel_banner_url",
  "whitelabel_bot_name",
  "whitelabel_bot_footer",
  "whitelabel_embed_color",
  "whitelabel_hide_watermark",
];

const INTEGER_FIELDS = [
  "raid_threshold",
  "account_min_age_days",
  "auto_mute_duration",
  "max_warnings_before_kick",
  "grace_period_seconds",
  "instant_ban_hours",
];

function getBotWhitelabelPath() {
  return path.join(process.cwd(), "..", "bot", "src", "database", "data", "whitelabel.json");
}

function syncWhitelabelToBot(guildId: string, fields: Record<string, unknown>) {
  try {
    const whitelabelPath = getBotWhitelabelPath();
    const dir = path.dirname(whitelabelPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let data: { entries: Record<string, unknown> } = { entries: {} };
    if (fs.existsSync(whitelabelPath)) {
      data = JSON.parse(fs.readFileSync(whitelabelPath, "utf-8"));
    }

    const current = (data.entries[guildId] ?? {}) as Record<string, unknown>;

    const updates: Record<string, unknown> = {};
    if ("whitelabel_enabled" in fields) {
      updates.detectionEnabled = fields.whitelabel_enabled;
    }
    if ("whitelabel_logo_url" in fields) {
      updates.botAvatar = fields.whitelabel_logo_url;
    }
    if ("whitelabel_banner_url" in fields) {
      updates.bannerUrl = fields.whitelabel_banner_url;
    }
    if ("whitelabel_bot_name" in fields) {
      updates.botName = fields.whitelabel_bot_name;
    }
    if ("whitelabel_bot_footer" in fields) {
      updates.botFooter = fields.whitelabel_bot_footer;
    }
    if ("whitelabel_embed_color" in fields) {
      updates.embedColor =
        typeof fields.whitelabel_embed_color === "string"
          ? parseInt(fields.whitelabel_embed_color.replace("#", ""), 16)
          : fields.whitelabel_embed_color;
    }
    if ("whitelabel_hide_watermark" in fields) {
      updates.hideWatermark = fields.whitelabel_hide_watermark;
    }

    data.entries[guildId] = { ...current, ...updates };
    fs.writeFileSync(whitelabelPath, JSON.stringify(data, null, 2));

    console.log(`[whitelabel-sync] Guild ${guildId}: campos sincronizados com o bot`);
  } catch (err) {
    console.error("[whitelabel-sync] Erro ao sincronizar com o bot:", err);
  }
}

export const Route = createFileRoute("/api/guild-config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { result } = await checkAuth(request);
        if (!result.authenticated)
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });

        const url = new URL(request.url);
        const guildId = url.searchParams.get("guildId");
        if (!guildId)
          return new Response(JSON.stringify({ error: "guildId required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });

        const { data } = await supabase
          .schema("aegis")
          .from("arx_server_config")
          .select("*")
          .eq("discord_guild_id", guildId)
          .single();

        const { data: patterns } = await supabase
          .schema("aegis")
          .from("arx_detection_patterns")
          .select("*")
          .eq("discord_guild_id", guildId)
          .eq("is_active", true);

        return new Response(JSON.stringify({ config: data ?? null, patterns: patterns ?? [] }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      PATCH: async ({ request }) => {
        const { result } = await checkAuth(request);
        if (!result.authenticated)
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });

        const body = (await request.json()) as { guildId: string; config: Record<string, unknown> };
        const { guildId, config } = body;
        if (!guildId)
          return new Response(JSON.stringify({ error: "guildId required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });

        // Filtrar apenas campos validos da tabela arx_server_config
        const safeConfig: Record<string, unknown> = {};
        for (const field of ALLOWED_FIELDS) {
          if (Object.prototype.hasOwnProperty.call(config, field)) {
            let value = config[field];
            // Converter campos inteiros com parseInt
            if (
              INTEGER_FIELDS.includes(field) &&
              value !== null &&
              value !== undefined &&
              value !== ""
            ) {
              const parsed = parseInt(String(value), 10);
              value = isNaN(parsed) ? null : parsed;
            }
            safeConfig[field] = value;
          }
        }

        const { data: existing } = await supabase
          .schema("aegis")
          .from("arx_server_config")
          .select("id")
          .eq("discord_guild_id", guildId)
          .single();

        let res;
        if (existing) {
          res = await supabase
            .schema("aegis")
            .from("arx_server_config")
            .update({ ...safeConfig, updated_at: new Date().toISOString() })
            .eq("discord_guild_id", guildId)
            .select()
            .single();
        } else {
          res = await supabase
            .schema("aegis")
            .from("arx_server_config")
            .insert({ discord_guild_id: guildId, ...safeConfig })
            .select()
            .single();
        }

        if (res.error)
          return new Response(JSON.stringify({ error: res.error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });

        const hasWhitelabelFields = Object.keys(safeConfig).some((k) =>
          WHITELABEL_FIELDS.includes(k),
        );
        if (hasWhitelabelFields) {
          syncWhitelabelToBot(guildId, safeConfig);
        }

        return new Response(JSON.stringify({ ok: true, config: res.data }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
