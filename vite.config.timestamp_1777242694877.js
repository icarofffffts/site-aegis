// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
var vite_config_default = defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      app: {
        server: {
          preset: "node-server"
        }
      }
    }),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
