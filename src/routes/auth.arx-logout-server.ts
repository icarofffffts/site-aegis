import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/arx-logout-server")({
  server: {
    handlers: {
      POST: async () => {
        return new Response(null, {
          status: 200,
          headers: {
            "Set-Cookie":
              "arx_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0, aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
          },
        });
      },
    },
  },
});
