import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/logout")({
  server: {
    handlers: {
      GET: async () => {
        // Limpa o cookie de sessão e redireciona para home
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": "aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
          },
        });
      },
    },
  },
});
