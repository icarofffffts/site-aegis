import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookieHeader = request.headers.get("cookie") ?? "";
        const match = cookieHeader.match(/aegis_session=([^;]+)/);

        if (!match) {
          return new Response(JSON.stringify({ authenticated: false }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const session = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));

          // Verificar expiração
          if (Date.now() > session.expiresAt) {
            return new Response(JSON.stringify({ authenticated: false, reason: "expired" }), {
              status: 401,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": "aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
              },
            });
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
            { headers: { "Content-Type": "application/json" } },
          );
        } catch {
          return new Response(JSON.stringify({ authenticated: false, reason: "invalid_session" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
