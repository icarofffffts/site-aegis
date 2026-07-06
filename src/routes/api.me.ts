import { createFileRoute } from "@tanstack/react-router";
import { verifyArxJwt } from "@/lib/arx-auth";

const ADMIN_IDS = (process.env.ADMIN_DISCORD_IDS ?? "").split(",").map((id) => id.trim());

function getDiscordIdFromSessionCookie(cookieHeader: string): string | null {
  const legacyMatch = cookieHeader.match(/aegis_session=([^;]+)/);
  if (!legacyMatch) return null;
  try {
    const session = JSON.parse(Buffer.from(legacyMatch[1], "base64").toString("utf-8"));
    if (Date.now() < session.expiresAt) {
      return session.id;
    }
  } catch {}
  return null;
}

function checkIsPremium(id: string): boolean {
  return ADMIN_IDS.includes(id);
}

export const Route = createFileRoute("/api/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie") ?? "";

        // Check for ArxAuthPortal JWT token first
        const arxMatch = cookieHeader.match(/arx_token=([^;]+)/);
        if (arxMatch) {
          const user = await verifyArxJwt(arxMatch[1]);
          if (user) {
            // Also check for Discord session cookie to determine premium
            const discordId = getDiscordIdFromSessionCookie(cookieHeader);
            const isPremium = discordId ? checkIsPremium(discordId) : false;

            return new Response(
              JSON.stringify({
                authenticated: true,
                isPremium,
                user: {
                  id: user.openId,
                  discordId,
                  username: user.name || user.email,
                  email: user.email,
                  avatar: null,
                },
              }),
              { headers: { "Content-Type": "application/json; charset=utf-8" } },
            );
          }
          // Token expired/invalid — clear it
          return new Response(JSON.stringify({ authenticated: false, reason: "expired" }), {
            status: 401,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Set-Cookie": "arx_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
            },
          });
        }

        // Fallback: legacy Discord session (base64 cookie)
        const legacyMatch = cookieHeader.match(/aegis_session=([^;]+)/);

        if (!legacyMatch) {
          return new Response(JSON.stringify({ authenticated: false }), {
            status: 401,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }

        try {
          const session = JSON.parse(Buffer.from(legacyMatch[1], "base64").toString("utf-8"));

          if (Date.now() > session.expiresAt) {
            return new Response(JSON.stringify({ authenticated: false, reason: "expired" }), {
              status: 401,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Set-Cookie": "aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
              },
            });
          }

          return new Response(
            JSON.stringify({
              authenticated: true,
              isPremium: checkIsPremium(session.id),
              user: {
                id: session.id,
                username: session.username,
                discriminator: session.discriminator,
                avatar: session.avatar
                  ? `https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png`
                  : `https://cdn.discordapp.com/embed/avatars/0.png`,
              },
            }),
            { headers: { "Content-Type": "application/json; charset=utf-8" } },
          );
        } catch {
          return new Response(JSON.stringify({ authenticated: false, reason: "invalid_session" }), {
            status: 401,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }
      },
    },
  },
});
