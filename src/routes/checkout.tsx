import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, Check, ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const PLAN_DETAILS: Record<string, { name: string; price: number; desc: string }> = {
  premium: { name: "Premium", price: 19.9, desc: "O poder total do Aegis no seu servidor" },
  partner: { name: "Partner", price: 49.9, desc: "Ecossistema completo para grandes redes" },
};

function CheckoutPage() {
  const navigate = useNavigate();
  const [planKey, setPlanKey] = useState("premium");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plan");
    if (p === "partner" || p === "premium") setPlanKey(p);
  }, []);
  const plan = PLAN_DETAILS[planKey];
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const price = yearly ? (planKey === "premium" ? 199 : 499) : plan.price;

  async function handlePayment(method: "stripe" | "mercadopago") {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, interval: yearly ? "year" : "month", method }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erro ao iniciar pagamento. Tente novamente.");
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="bg-[#0d1117] min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate({ to: "/precos" })}
            className="mb-8 flex items-center gap-2 text-sm text-[#7d8590] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para planos
          </button>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Resumo do plano */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 sticky top-24">
                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500">
                  <Sparkles className="h-3.5 w-3.5" /> {plan.name}
                </span>
                <p className="mt-4 text-sm text-[#7d8590]">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">R$ {price.toFixed(2).replace(".", ",")}</span>
                  <span className="text-sm text-[#7d8590]">/{yearly ? "ano" : "mês"}</span>
                </div>

                <div className="mt-4 inline-flex items-center gap-1 rounded-lg border border-[#30363d] bg-[#010409] p-1 text-xs">
                  <button
                    onClick={() => setYearly(false)}
                    className={`rounded-md px-4 py-1.5 font-semibold transition-all ${!yearly ? "bg-[#30363d] text-white" : "text-[#7d8590]"}`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setYearly(true)}
                    className={`rounded-md px-4 py-1.5 font-semibold transition-all ${yearly ? "bg-[#30363d] text-white" : "text-[#7d8590]"}`}
                  >
                    Anual <span className="text-yellow-500">−17%</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Métodos de pagamento */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-bold text-white mb-6">Escolha o método de pagamento</h2>

              <div className="space-y-4">
                <button
                  onClick={() => handlePayment("stripe")}
                  disabled={loading}
                  className="w-full flex items-center gap-4 rounded-xl border border-[#30363d] bg-[#161b22] p-5 hover:border-[#8b949e] transition-all disabled:opacity-50"
                >
                  <div className="h-12 w-12 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-bold text-white">Cartão de Crédito (Stripe)</span>
                    <span className="block text-xs text-[#7d8590] mt-0.5">Pagamento seguro via Stripe • Visa, Mastercard, Elo</span>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-[#3fb950]" />
                </button>

                <button
                  onClick={() => handlePayment("mercadopago")}
                  disabled={loading}
                  className="w-full flex items-center gap-4 rounded-xl border border-[#30363d] bg-[#161b22] p-5 hover:border-[#8b949e] transition-all disabled:opacity-50"
                >
                  <div className="h-12 w-12 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center">
                    <svg className="h-6 w-6 text-[#00b5e2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-bold text-white">Mercado Pago</span>
                    <span className="block text-xs text-[#7d8590] mt-0.5">Pix, boleto, cartão • Parcelamento sem juros</span>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-[#3fb950]" />
                </button>

                <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    <ShieldCheck className="h-4 w-4 inline mr-1 text-[#3fb950]" /> Garantia Aegis
                  </h3>
                  <ul className="space-y-2 text-xs text-[#7d8590]">
                    <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5 text-[#3fb950] shrink-0" /> Pagamento 100% seguro processado por Stripe ou Mercado Pago</li>
                    <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5 text-[#3fb950] shrink-0" /> Cancele quando quiser, sem multa</li>
                    <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5 text-[#3fb950] shrink-0" /> Reembolso integral em até 14 dias</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
