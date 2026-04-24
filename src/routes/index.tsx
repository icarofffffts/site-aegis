import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Zap, Eye, Users, Lock, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PLATFORMS, PlatformBadge } from "@/components/PlatformBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aegis — Proteção avançada para sua comunidade" },
      {
        name: "description",
        content:
          "Aegis é o bot de moderação e segurança de nível premium para Discord — anti-raid, anti-spam, auto-mod inteligente e logs detalhados em uma única solução.",
      },
      { property: "og:title", content: "Aegis — Proteção avançada para sua comunidade" },
      {
        property: "og:description",
        content: "Bot de moderação e segurança premium para Discord, com arquitetura multi-plataforma.",
      },
    ],
  }),
  component: HomePage,
});

const FEATURES = [
  { icon: Shield, title: "Anti-Raid avançado", desc: "Detecção em tempo real de ataques coordenados, com lockdown automático e mitigação inteligente." },
  { icon: Zap, title: "Anti-Spam instantâneo", desc: "Filtros adaptativos contra flood, menções em massa, links maliciosos e contas descartáveis." },
  { icon: Eye, title: "Auto-Mod inteligente", desc: "Regras personalizáveis com ações automáticas: avisos, mute, kick ou ban — tudo sob seu controle." },
  { icon: Activity, title: "Logs detalhados", desc: "Registro completo de ações de moderação, edições, deleções e entradas com histórico pesquisável." },
  { icon: Users, title: "Verificação de membros", desc: "Captcha e verificação progressiva para barrar bots antes que eles cheguem aos seus canais." },
  { icon: Lock, title: "Permissões granulares", desc: "Configure quem pode usar cada comando com base em cargos, canais ou contexto." },
];

const STATS = [
  { value: "12k+", label: "Servidores protegidos" },
  { value: "4.2M", label: "Membros sob proteção" },
  { value: "98M", label: "Ações automáticas" },
  { value: "99.9%", label: "Uptime garantido" },
];

const STEPS = [
  { n: "01", title: "Adicione o Aegis", desc: "Convide o bot ao seu servidor com um clique e permissões mínimas." },
  { n: "02", title: "Configure em minutos", desc: "Painel guiado de configuração — anti-raid, logs e auto-mod prontos." },
  { n: "03", title: "Proteja sua comunidade", desc: "Aegis monitora 24/7 e aplica as regras que você definiu, automaticamente." },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-x-0 -top-32 mx-auto h-64 w-[60%] rounded-full bg-primary/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              Proteção de nível empresarial
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Proteção avançada para a sua{" "}
              <span className="text-gradient-primary">comunidade</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Aegis é o escudo definitivo contra raids, spam e ataques. Moderação automatizada, logs profundos e configuração simples — pronto para escalar entre múltiplas plataformas.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow hover:opacity-90">
                <a href="#" rel="noopener">
                  Adicionar ao Discord
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border bg-surface/40 hover:bg-surface">
                <Link to="/comandos">Ver comandos</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {PLATFORMS.map((p) => (
                <PlatformBadge key={p.name} platform={p} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-surface/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-gradient-gold sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Tudo que sua comunidade precisa</h2>
          <p className="mt-4 text-muted-foreground">
            Um conjunto completo de ferramentas de segurança e moderação, projetado para funcionar fora da caixa e crescer com você.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 transition-all hover:border-primary/40 hover:bg-surface"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/30">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Pronto em 3 passos</h2>
            <p className="mt-4 text-muted-foreground">Sem configuração complicada. Aegis chega protegendo desde o primeiro minuto.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <div className="font-display text-3xl font-bold text-gradient-primary">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-surface to-background p-10 text-center shadow-elegant">
          <div className="absolute -top-20 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Ative o escudo na sua comunidade hoje</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Mais de 12 mil servidores já confiam no Aegis. Comece grátis em segundos.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow">
                <a href="#" rel="noopener">Adicionar ao Discord</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border bg-surface/40">
                <Link to="/precos">Ver planos</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Grátis para começar</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Sem cartão</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Setup em 2 minutos</span>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
