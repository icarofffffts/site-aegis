import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function getSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/aegis_session=([^;]+)/);
  if (!match) return null;
  try {
    const session = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));
    if (Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/reports")({
  server: {
    handlers: {
      // PATCH /api/reports?id=xxx&action=approve|reject
      PATCH: async ({ request }) => {
        const session = getSession(request);
        if (!session) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const action = url.searchParams.get("action");

        if (!id || !["approve", "reject"].includes(action ?? "")) {
          return new Response(JSON.stringify({ error: "invalid_params" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const newStatus = action === "approve" ? "approved" : "rejected";

        const { data, error } = await supabase
          .schema("shield").from("reports")
          .update({
            status: newStatus,
            reviewed_by: session.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ ok: true, report: data }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
