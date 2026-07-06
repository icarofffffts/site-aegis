import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";

export const Route = createFileRoute("/api/health-check")({
  server: {
    handlers: {
      GET: async () => {
        // Simulação de quedas via flag de manutenção
        const maintenanceFlag = path.join(process.cwd(), "maintenance.flag");

        if (fs.existsSync(maintenanceFlag)) {
          return new Response(
            JSON.stringify({
              status: "maintenance",
              timestamp: new Date().toISOString(),
              message: "O ecossistema Aegis está em manutenção programada.",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify({
            status: "operational",
            timestamp: new Date().toISOString(),
            service: "aegis-site",
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
