# SiteAegis — Tech Stack

## Runtime & Language

- **Bun** (package manager, lockfile: `bun.lockb`)
- **TypeScript** 5.x — strict mode enabled, target ES2022
- **React** 19 with JSX transform (`react-jsx`)

## Core Framework & Libraries

| Library | Purpose |
|---|---|
| `@tanstack/react-start` | Full-stack React framework (SSR + file-based routing) |
| `@tanstack/react-router` | Type-safe file-based routing (auto-generated `routeTree.gen.ts`) |
| `@tanstack/react-query` | Server state management |
| `vite` v7 | Build tool |
| `tailwindcss` v4 | Utility-first CSS (via `@tailwindcss/vite` plugin) |
| `@radix-ui/*` | Headless accessible UI primitives |
| `lucide-react` | Icon library |
| `react-hook-form` + `zod` | Forms and validation |
| `recharts` | Charts and data visualization |
| `sonner` | Toast notifications |
| `clsx` + `tailwind-merge` | Conditional class merging via `cn()` utility |

## Path Alias

`@/` maps to `./src/` — always use this for internal imports.

## Code Style

- **Prettier**: `printWidth: 100`, double quotes, semicolons, trailing commas
- **ESLint**: typescript-eslint + react-hooks + react-refresh + prettier integration
- Format: `npm run format` / Lint: `npm run lint`

## Common Commands

```bash
# Development server
npm run dev        # or: bun run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint

# Format
npm run format
```

## Build & Deployment

- Build output: `dist/` (static) and `.output/` (SSR server)
- Server preset: `node-server` (configured in `vite.config.ts`)
- Deployed to VPS behind **Nginx** reverse proxy at `aegis.arxdevs.xyz`
- Deploy script: `push-deploy-site.ps1` (PowerShell, SFTP sync)
- Process managed by **PM2** — use `pm2 reload aegis-site` for zero-downtime
- Never sync `node_modules` to VPS

## Environment Variables

- Development: `.env.local`
- Production: `.env.production.local` (never commit)
- Build-time vars in TanStack Start require a full rebuild to take effect
