import { createFileRoute } from "@tanstack/react-router";

async function tryFetch(host: string, port: string, path: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`http://${host}:${port}${path}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false };
  } catch {
    clearTimeout(timeoutId);
    return { ok: false };
  }
}

export const Route = createFileRoute("/api/bot-status")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const port = process.env.BOT_CONTAINER_PORT || "3000";

          // Try multiple hosts in order
          const hosts = process.env.BOT_CONTAINER_HOST
            ? [process.env.BOT_CONTAINER_HOST, "aegis-bot"]
            : ["aegis-bot"];

          for (const host of hosts) {
            const result = await tryFetch(host, port, "/status");
            if (result.ok && result.data.online) {
              return new Response(
                JSON.stringify({
                  status: "operational",
                  uptime: result.data.uptime,
                  service: "AegisBot",
                  checkTime: new Date().toISOString(),
                  host,
                }),
                {
                  headers: { "Content-Type": "application/json" },
                },
              );
            }
          }

          return new Response(
            JSON.stringify({
              status: "offline",
              reason: "Nenhum host do bot respondeu.",
              service: "AegisBot",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err: unknown) {
          const reason = err instanceof Error ? err.message : "Erro desconhecido";
          return new Response(
            JSON.stringify({
              status: "offline",
              reason: "Erro interno: " + reason,
              service: "AegisBot",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
