import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { PricingSkeleton } from "@/components/skeletons/PricingSkeleton";
import { PLANS } from "@/data/pricing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/precos")({
  head: () => ({
    meta: [
      { title: "Preços — Aegis" },
      {
        name: "description",
        content: "Planos do Aegis: Free, Premium e Enterprise. Comece grátis e desbloqueie proteção avançada quando precisar.",
      },
      { property: "og:title", content: "Preços — Aegis" },
      { property: "og:description", content: "Planos transparentes para proteger comunidades de qualquer tamanho." },
    ],
  }),
  component: PricingPage,
});

const FAQ = [
  { q: "Posso usar grátis para sempre?", a: "Sim. O plano Free tem todos os comandos essenciais de moderação e nunca expira." },
  { q: "Como funciona a cobrança?", a: "Mensal ou anual, com desconto no anual. Cancele quando quiser, sem multa." },
  { q: "Vocês oferecem reembolso?", a: "Sim — reembolso integral em até 14 dias após a primeira cobrança." },
  { q: "O Aegis vai funcionar em outras plataformas?", a: "Sim. Estamos expandindo para Telegram, Slack e Revolt. Assinantes Premium e Enterprise terão acesso prioritário." },
];

function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <Sparkles className="h-3.5 w-3.5" /> Comece grátis, escale quando precisar
          </span>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">Planos para qualquer <span className="text-gradient-gold">comunidade</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Sem pegadinhas. Sem cobrança por servidor. Pague apenas pelos recursos avançados que sua comunidade realmente usa.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Anual <span className="ml-1 text-xs text-gold">−17%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-3xl border bg-card p-7 transition-all",
                  plan.highlight
                    ? "border-primary/60 shadow-glow"
                    : "border-border hover:border-primary/30",
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-3 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                    Mais popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">
                    {price === 0 ? "Grátis" : `R$ ${price.toFixed(2).replace(".", ",")}`}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-muted-foreground">/{yearly ? "ano" : "mês"}</span>
                  )}
                </div>

                <Button
                  className={cn(
                    "mt-6",
                    plan.highlight
                      ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
                      : "bg-surface text-foreground hover:bg-surface-elevated",
                  )}
                >
                  {plan.cta}
                </Button>

                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="cursor-pointer list-none text-base font-medium text-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <span>{item.q}</span>
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                  </div>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
