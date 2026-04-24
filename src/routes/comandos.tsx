import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Shield } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { COMMAND_CATEGORIES, COMMANDS, type CommandCategory } from "@/data/commands";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/comandos")({
  head: () => ({
    meta: [
      { title: "Comandos — Aegis" },
      {
        name: "description",
        content: "Lista completa dos comandos do Aegis: moderação, anti-raid, configuração, logs e utilidades.",
      },
      { property: "og:title", content: "Comandos — Aegis" },
      { property: "og:description", content: "Explore todos os comandos do bot Aegis filtrados por categoria." },
    ],
  }),
  component: CommandsPage,
});

function CommandsPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CommandCategory | "Todos">("Todos");

  const filtered = useMemo(() => {
    return COMMANDS.filter((c) => {
      const matchesCat = active === "Todos" || c.category === active;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, active]);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Shield className="h-3.5 w-3.5" /> {COMMANDS.length} comandos disponíveis
          </span>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">Todos os comandos do <span className="text-gradient-primary">Aegis</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Pesquise, filtre por categoria e veja a sintaxe exata de cada comando. Em breve, comandos para outras plataformas além do Discord.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar comando…"
              className="h-11 border-border bg-surface/60 pl-9 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["Todos", ...COMMAND_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cmd) => (
            <div
              key={cmd.name}
              className="rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between gap-2">
                <code className="font-mono text-base font-semibold text-foreground">/{cmd.name}</code>
                <span className="rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {cmd.category}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{cmd.description}</p>
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background/60 p-2.5 font-mono text-xs text-foreground">
                {cmd.syntax}
              </pre>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                  Permissão: <span className="text-foreground">{cmd.permission}</span>
                </span>
                {cmd.platforms.map((p) => (
                  <span key={p} className="rounded bg-primary/15 px-2 py-0.5 text-primary">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Nenhum comando encontrado para "{query}".
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
