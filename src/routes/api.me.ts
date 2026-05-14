import { createFileRoute } from "@tanstack/react-router";
import { verifyArxJwt } from "@/lib/arx-auth";

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
            return new Response(
              JSON.stringify({
                authenticated: true,
                user: {
                  id: user.openId,
                  username: user.name || user.email,
                  email: user.email,
                  avatar: null,
                },
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }
          // Token expired/invalid — clear it
          return new Response(
            JSON.stringify({ authenticated: false, reason: "expired" }),
            {
              status: 401,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie":
                  "arx_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
              },
            }
          );
        }

        // Fallback: legacy Discord session (base64 cookie)
        const legacyMatch = cookieHeader.match(/aegis_session=([^;]+)/);

        if (!legacyMatch) {
          return new Response(JSON.stringify({ authenticated: false }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const session = JSON.parse(
            Buffer.from(legacyMatch[1], "base64").toString("utf-8")
          );

          if (Date.now() > session.expiresAt) {
            return new Response(
              JSON.stringify({ authenticated: false, reason: "expired" }),
              {
                status: 401,
                headers: {
                  "Content-Type": "application/json",
                  "Set-Cookie":
                    "aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
                },
              }
            );
          }

          return new Response(
            JSON.stringify({
              authenticated: true,
              user: {
                id: session.id,
                username: session.username,
                discriminator: session.discriminator,
                avatar: session.avatar
                  ? `https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png`
                  : `https://cdn.discordapp.com/embed/avatars/0.png`,
              },
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch {
          return new Response(
            JSON.stringify({ authenticated: false, reason: "invalid_session" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
