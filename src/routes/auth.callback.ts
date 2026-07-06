import { createFileRoute } from "@tanstack/react-router";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const REDIRECT_URI = "https://aegis.arxdevs.xyz/auth/callback";
const ADMIN_IDS = (process.env.ADMIN_DISCORD_IDS ?? "").split(",").map((id) => id.trim());

export const Route = createFileRoute("/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        // Usuário negou o acesso
        if (error || !code) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login?error=access_denied" },
          });
        }

        // 1. Trocar o code pelo access token do Discord
        let tokenData: { access_token: string; token_type: string };
        try {
          const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: DISCORD_CLIENT_ID,
              client_secret: DISCORD_CLIENT_SECRET,
              grant_type: "authorization_code",
              code,
              redirect_uri: REDIRECT_URI,
            }),
          });

          if (!tokenRes.ok) {
            console.error("[auth/callback] Token exchange failed:", await tokenRes.text());
            return new Response(null, {
              status: 302,
              headers: { Location: "/login?error=token_exchange" },
            });
          }

          tokenData = await tokenRes.json();
        } catch (err) {
          console.error("[auth/callback] Token exchange error:", err);
          return new Response(null, {
            status: 302,
            headers: { Location: "/login?error=server_error" },
          });
        }

        // 2. Buscar dados do usuário no Discord
        let discordUser: {
          id: string;
          username: string;
          avatar: string | null;
          discriminator: string;
        };
        try {
          const userRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });

          if (!userRes.ok) {
            return new Response(null, {
              status: 302,
              headers: { Location: "/login?error=user_fetch" },
            });
          }

          discordUser = await userRes.json();
        } catch (err) {
          console.error("[auth/callback] User fetch error:", err);
          return new Response(null, {
            status: 302,
            headers: { Location: "/login?error=server_error" },
          });
        }

        // 3. Verificar se o usuário é admin autorizado
        if (!ADMIN_IDS.includes(discordUser.id)) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login?error=unauthorized" },
          });
        }

        // 4. Criar sessão — cookie seguro com dados do usuário (base64 simples)
        const sessionPayload = Buffer.from(
          JSON.stringify({
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            accessToken: tokenData.access_token,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
          }),
        ).toString("base64");

        return new Response(null, {
          status: 302,
          headers: {
            Location: "/dashboard",
            "Set-Cookie": `aegis_session=${sessionPayload}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
          },
        });
      },
    },
  },
});
