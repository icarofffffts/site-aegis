import { createFileRoute } from "@tanstack/react-router";
import { exchangeCodeForToken, verifyArxJwt, buildArxSessionCookie } from "@/lib/arx-auth";

const SITE_URL = process.env.NEXTAUTH_URL || "https://aegis.arxdevs.xyz";
const ADMIN_IDS = (process.env.ADMIN_DISCORD_IDS ?? "").split(",").map((id) => id.trim());

export const Route = createFileRoute("/auth/arx-callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login?error=no_auth_code" },
          });
        }

        const callbackUri = `${SITE_URL}/auth/arx-callback`;

        const token = await exchangeCodeForToken(code, callbackUri);

        if (!token) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login?error=token_exchange" },
          });
        }

        const user = await verifyArxJwt(token);

        if (!user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login?error=invalid_token" },
          });
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: state || "/dashboard",
            "Set-Cookie": buildArxSessionCookie(token, 86400),
          },
        });
      },
    },
  },
});
