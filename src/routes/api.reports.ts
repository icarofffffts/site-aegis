import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { checkAuth } from "@/lib/auth-check";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const Route = createFileRoute("/api/reports")({
  server: {
    handlers: {
      // PATCH /api/reports?id=xxx&action=approve|reject
      PATCH: async ({ request }) => {
        const { result, clearHeaders } = await checkAuth(request);
        if (!result.authenticated) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              ...(clearHeaders || {}),
            },
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
          .schema("shield")
          .from("reports")
          .update({
            status: newStatus,
            reviewed_by: result.userId,
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
