import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Zap, Eye, Users, Lock, Activity, ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { PLATFORMS, PlatformBadge } from "@/components/PlatformBadge";
import { Button } from "@/components/ui/button";
import { SITE_URLS } from "@/lib/constants";

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
      <section className="relative overflow-hidden bg-[#0d1117] py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-animated opacity-20" />
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-40 right-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-medium text-[#7d8590]">
              <Shield className="h-3.5 w-3.5" />
              Segurança de nível empresarial para Discord
            </span>

            <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Proteção avançada para sua{" "}
              <span className="text-blue-500">comunidade</span>
            </h1>

            <p className="mt-8 max-w-2xl text-xl text-[#7d8590] sm:text-2xl">
              Aegis é o escudo definitivo contra raids, spam e ataques. Moderação automatizada, logs profundos e configuração simples — tudo em uma única plataforma.
            </p>

            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-14 bg-[#1f883d] px-8 text-lg font-semibold text-white hover:bg-[#1a7a35] border border-[#1f883d]/20 shadow-none">
                <a href={SITE_URLS.botInvite} rel="noopener">
                  Adicionar ao Discord
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-[#30363d] bg-transparent px-8 text-lg font-semibold text-white hover:bg-[#161b22] hover:border-[#8b949e]">
                <Link to="/comandos">Explorar comandos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#30363d] bg-[#0d1117]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white sm:text-4xl">{s.value}</div>
              <div className="mt-2 text-sm font-medium text-[#7d8590] uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#0d1117] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Tudo que sua comunidade precisa para prosperar com segurança</h2>
            <p className="mt-4 text-lg text-[#7d8590]">
              Um conjunto robusto de ferramentas de segurança projetado para funcionar instantaneamente.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-[#30363d] bg-[#161b22] p-8 transition-all hover:border-[#8b949e] hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="mb-5 inline-flex p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-blue-500">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-[#7d8590]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[#30363d] bg-[#161b22]/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Fácil de implementar</h2>
            <p className="mt-4 text-lg text-[#7d8590]">Adicione proteção profissional ao seu servidor em menos de 5 minutos.</p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#30363d] text-white font-bold mb-4">
                  {s.n}
                </div>
                <h3 className="text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-[#7d8590]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* CTA */}
      <section className="bg-[#0d1117] py-24 px-4">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117] p-12 sm:p-20 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">Proteja sua comunidade hoje</h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-[#7d8590]">
            Junte-se a mais de 12.000 servidores que confiam no Aegis para manter seus membros seguros.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 bg-[#1f883d] px-10 text-lg font-bold text-white hover:bg-[#1a7a35] shadow-none">
              <a href={SITE_URLS.botInvite} rel="noopener">Adicionar ao Discord</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 border-[#30363d] bg-transparent px-10 text-lg font-bold text-white hover:bg-[#161b22] hover:border-[#8b949e]">
              <Link to="/precos">Conhecer planos</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[#7d8590]">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#3fb950]" /> Comece grátis</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#3fb950]" /> Setup instantâneo</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#3fb950]" /> Suporte 24/7</span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
