import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      app: {
        server: {
          preset: "node-server",
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
  preview: {
    allowedHosts: ["aegis.arxdevs.xyz"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
