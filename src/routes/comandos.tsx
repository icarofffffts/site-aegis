import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Shield } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { CommandsSkeleton } from "@/components/skeletons/CommandsSkeleton";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(id);
  }, []);

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
      <section className="bg-[#0d1117] border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-medium text-[#7d8590]">
            <Shield className="h-3.5 w-3.5 text-blue-500" /> {COMMANDS.length} comandos disponíveis
          </span>
          <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">Comandos do <span className="text-blue-500">Aegis</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#7d8590]">
            Lista técnica de comandos para moderação, segurança e automação.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-[#0d1117]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d8590]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar comando…"
              className="h-10 border-[#30363d] bg-[#0d1117] pl-10 text-white placeholder:text-[#7d8590] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["Todos", ...COMMAND_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-md border px-4 py-1.5 text-xs font-semibold transition-all",
                  active === c
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-[#30363d] bg-[#161b22] text-[#7d8590] hover:border-[#8b949e] hover:text-white",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <CommandsSkeleton count={9} />
        ) : (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((cmd) => (
                <div
                  key={cmd.name}
                  className="group rounded-xl border border-[#30363d] bg-[#161b22] p-6 transition-all hover:border-[#8b949e] relative"
                >
                  {cmd.new && (
                    <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      Novo
                    </span>
                  )}
                  <div className="flex items-center gap-2 pr-12">
                    <code className="font-mono text-base font-bold text-blue-400">/{cmd.name}</code>
                  </div>
                  <span className="mt-2 inline-block rounded-full border border-[#30363d] bg-[#0d1117] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7d8590]">
                    {cmd.category}
                  </span>
                  <p className="mt-3 text-sm text-[#7d8590] line-clamp-2">{cmd.description}</p>
                  <pre className="mt-4 overflow-x-auto rounded-lg border border-[#30363d] bg-[#0d1117] p-3 font-mono text-xs text-[#c9d1d9]">
                    {cmd.syntax}
                  </pre>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-[#8b949e]">
                      Permissão: <span className="text-white font-medium">{cmd.permission}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-16 rounded-xl border border-dashed border-[#30363d] p-16 text-center text-[#7d8590]">
                Nenhum comando encontrado para "{query}".
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}
