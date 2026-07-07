import { createFileRoute } from "@tanstack/react-router";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

export const Route = createFileRoute("/api/guilds")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie") ?? "";
        const legacyMatch = cookieHeader.match(/aegis_session=([^;]+)/);

        if (!legacyMatch) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        let accessToken: string;
        try {
          const session = JSON.parse(Buffer.from(legacyMatch[1], "base64").toString("utf-8"));
          if (Date.now() > session.expiresAt)
            return new Response(JSON.stringify({ error: "expired" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          accessToken = session.accessToken;
        } catch {
          return new Response(JSON.stringify({ error: "invalid_session" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const userGuildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!userGuildsRes.ok) throw new Error("Failed fetch user guilds");
          const userGuilds: any[] = await userGuildsRes.json();

          const botGuildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
          });
          if (!botGuildsRes.ok) throw new Error("Failed fetch bot guilds");
          const botGuilds: any[] = await botGuildsRes.json();

          const botGuildIds = new Set(botGuilds.map((g: any) => g.id));

          const mutual: any[] = [];
          const notAdded: any[] = [];

          for (const guild of userGuilds) {
            const g = {
              id: guild.id,
              name: guild.name,
              icon: guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : null,
              owner: guild.owner,
              permissions: guild.permissions,
            };
            if (botGuildIds.has(guild.id)) {
              mutual.push(g);
            } else if ((BigInt(guild.permissions) & 0x20n) !== 0n) {
              notAdded.push(g);
            }
          }

          return new Response(JSON.stringify({ mutual, notAdded }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("[api/guilds] Error:", err.message);
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
