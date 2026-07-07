import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { PricingSkeleton } from "@/components/skeletons/PricingSkeleton";
const PLANS = [
  {
    name: "Free",
    tagline: "Proteção básica para iniciar.",
    badge: "Com anúncios",
    monthly: 0,
    yearly: 0,
    cta: "Adicionar ao Discord",
    features: ["Proteção Anti-Raid ML padrão", "Whitelist (básico)", "Dashboard visão geral"],
    limitations: [
      "Máximo 1 servidor gerenciado",
      "Máximo 20 termos na Blacklist",
      "Sem alertas em tempo real",
      "Sem AutoMod AI e Comandos Pro",
    ],
    highlight: false,
  },
  {
    name: "Premium",
    tagline: "Segurança total sem limites.",
    badge: "Sem anúncios",
    monthly: 14.99,
    yearly: 149.9,
    cta: "Assinar Premium",
    features: [
      "Zero anúncios na Dashboard",
      "Servidores ilimitados",
      "Blacklist sem restrição (Infinito)",
      "Alertas em tempo real",
      "AutoMod AI (Inteligência Artificial)",
      "Estatísticas e relatórios detalhados",
      "Comandos avançados desbloqueados",
      "Suporte prioritário",
    ],
    limitations: [],
    highlight: true,
  },
];
import { cn } from "@/lib/utils";
import { SITE_URLS } from "@/lib/constants";

export const Route = createFileRoute("/precos")({
  head: () => ({
    meta: [
      { title: "Precos - Aegis" },
      {
        name: "description",
        content:
          "Planos do Aegis: Free, Premium e Enterprise. Comece gratis e desbloqueie protecao avancada quando precisar.",
      },
      { property: "og:title", content: "Precos - Aegis" },
      {
        property: "og:description",
        content: "Planos transparentes para proteger comunidades de qualquer tamanho.",
      },
    ],
  }),
  component: PricingPage,
});

const FAQ = [
  {
    q: "Posso usar grátis para sempre?",
    a: "Sim. O plano Free tem todos os comandos essenciais de moderação e nunca expira.",
  },
  {
    q: "Como funciona a cobrança?",
    a: "Mensal ou anual, com desconto no anual. Cancele quando quiser, sem multa.",
  },
  {
    q: "Vocês oferecem reembolso?",
    a: "Sim — reembolso integral em até 14 dias após a primeira cobrança.",
  },
  {
    q: "O Aegis vai funcionar em outras plataformas?",
    a: "Sim. Estamos expandindo para Telegram, Slack e Revolt. Assinantes Premium e Enterprise terão acesso prioritário.",
  },
];

function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <SiteLayout>
      <section className="bg-[#0d1117] border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-semibold text-yellow-500">
            <Sparkles className="h-3.5 w-3.5" /> Comece grátis, escale quando precisar
          </span>
          <h1 className="mt-6 text-4xl font-bold text-white sm:text-6xl">
            Planos para sua <span className="text-yellow-500">comunidade</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#7d8590]">
            Proteção profissional para servidores de qualquer tamanho. Sem taxas ocultas.
          </p>

          <div className="mt-10 inline-flex items-center gap-1 rounded-lg border border-[#30363d] bg-[#010409] p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-md px-5 py-2 text-sm font-semibold transition-all",
                !yearly ? "bg-[#30363d] text-white" : "text-[#7d8590] hover:text-white",
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-md px-5 py-2 text-sm font-semibold transition-all",
                yearly ? "bg-[#30363d] text-white" : "text-[#7d8590] hover:text-white",
              )}
            >
              Anual <span className="ml-1 text-xs text-yellow-500">-17%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <PricingSkeleton count={3} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const price = yearly ? plan.yearly : plan.monthly;
              const isHighlight = plan.highlight;
              return (
                <div
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col rounded-xl border p-8 transition-all",
                    isHighlight
                      ? "border-yellow-500/50 bg-[#161b22] ring-1 ring-yellow-500/20 shadow-lg shadow-yellow-500/5"
                      : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]",
                  )}
                >
                  {isHighlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                      Mais popular
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="mt-2 text-sm text-[#7d8590]">{plan.tagline}</p>
                    </div>
                    {plan.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full",
                          plan.badge === "Sem anúncios"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-[#30363d] text-[#7d8590]",
                        )}
                      >
                        {plan.badge === "Com anúncios" ? "📢 " : "✨ "}
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-8 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {price === 0 ? "Grátis" : `R$ ${price.toFixed(2).replace(".", ",")}`}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-[#7d8590]">/{yearly ? "ano" : "mes"}</span>
                    )}
                  </div>

                  <Button
                    asChild
                    className={cn(
                      "mt-8 h-12 text-sm font-bold shadow-none",
                      isHighlight
                        ? "bg-yellow-500 text-black hover:bg-yellow-400"
                        : "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] hover:border-[#8b949e]",
                    )}
                  >
                    <a
                      href={
                        plan.cta === "Adicionar ao Discord"
                          ? SITE_URLS.botInvite
                          : `/checkout?plan=${plan.name.toLowerCase()}`
                      }
                    >
                      {plan.cta}
                    </a>
                  </Button>

                  <ul className="mt-10 space-y-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3fb950]" />
                        <span className="text-[#e6edf3]">{f}</span>
                      </li>
                    ))}
                    {plan.limitations && plan.limitations.length > 0 && (
                      <>
                        <li className="pt-2 border-t border-[#30363d]" />
                        {plan.limitations.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#484f58]" />
                            <span className="text-[#484f58]">{f}</span>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-[#0d1117] border-t border-[#30363d]">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-white">Perguntas frequentes</h2>
          <div className="mt-12 divide-y divide-[#30363d] overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22]">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-6 transition-colors hover:bg-[#1c2128]">
                <summary className="cursor-pointer list-none text-base font-semibold text-white">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-[#8b949e] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-[#7d8590]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
