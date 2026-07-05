import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, MessageCircle, Mail, Activity, Send, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte — Aegis" },
      {
        name: "description",
        content: "Precisa de ajuda com o Aegis? Acesse a FAQ, entre no servidor de suporte ou envie uma mensagem para nossa equipe.",
      },
      { property: "og:title", content: "Suporte — Aegis" },
      { property: "og:description", content: "FAQ, contato e canais de suporte para o bot Aegis." },
    ],
  }),
  component: SupportPage,
});

const FAQ = [
  { q: "Como adicionar o Aegis no meu servidor?", a: "Clique em 'Adicionar ao Discord' no topo do site, escolha o servidor e autorize as permissões necessárias. Tudo em menos de 1 minuto." },
  { q: "Quais permissões o Aegis pede?", a: "Apenas as necessárias para moderar: ver canais, enviar mensagens, gerenciar mensagens, expulsar/banir membros e moderar membros. Você pode revisar tudo antes de autorizar." },
  { q: "O bot está offline, e agora?", a: "Verifique nossa página de status. Se o problema persistir, entre no servidor de suporte e nossa equipe vai te ajudar em minutos." },
  { q: "Os dados do meu servidor estão seguros?", a: "Sim. Armazenamos apenas o estritamente necessário (IDs, configurações e logs) e nunca vendemos ou compartilhamos dados com terceiros." },
  { q: "Posso usar em outras plataformas?", a: "Hoje o Aegis está totalmente operacional no Discord. Telegram, Slack e Revolt estão em desenvolvimento — assinantes Premium ganham acesso antecipado." },
];

const CONTACTS = [
  { icon: MessageCircle, title: "Servidor de suporte", desc: "Respostas rápidas da nossa equipe e da comunidade.", action: "Entrar no Discord", href: "https://discord.gg/gr93e7rQc4" },
  { icon: Mail, title: "E-mail", desc: "Para parcerias, imprensa e questões formais.", action: "suporte@arxdevs.xyz", href: "mailto:suporte@arxdevs.xyz" },
  { icon: Activity, title: "Status", desc: "Acompanhe a disponibilidade em tempo real.", action: "Ver status", href: "https://status.arxdevs.xyz" },
  { icon: BookOpen, title: "Documentação", desc: "Guias passo-a-passo de configuração.", action: "Abrir docs", href: "https://docs.arxdevs.xyz" },
];

function SupportPage() {
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Mensagem enviada! Vamos responder em até 24h.");
      (e.target as HTMLFormElement).reset();
    }, 800);
  }

  return (
    <SiteLayout>
      <section className="bg-[#0d1117] border-b border-[#30363d]">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-semibold text-[#7d8590]">
            <LifeBuoy className="h-3.5 w-3.5 text-blue-500" /> Estamos aqui para ajudar
          </span>
          <h1 className="mt-6 text-4xl font-bold text-white sm:text-6xl">Suporte do <span className="text-blue-500">Aegis</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#7d8590]">
            Encontre respostas, fale com nossa equipe ou abra um chamado.
          </p>
        </div>
      </section>

      {/* Contacts */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-[#0d1117]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACTS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group rounded-xl border border-[#30363d] bg-[#161b22] p-6 transition-all hover:border-[#8b949e]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d1117] text-white border border-[#30363d] group-hover:border-blue-500/50">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{c.title}</h3>
              <p className="mt-1 text-sm text-[#7d8590]">{c.desc}</p>
              <span className="mt-4 inline-block text-xs font-bold text-blue-500 group-hover:text-blue-400">{c.action} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ + Form */}
      <section className="bg-[#0d1117] border-t border-[#30363d]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold text-white">Perguntas frequentes</h2>
            <div className="mt-8 divide-y divide-[#30363d] overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22]">
              {FAQ.map((item) => (
                <details key={item.q} className="group p-6 hover:bg-[#1c2128] transition-colors">
                  <summary className="cursor-pointer list-none text-base font-semibold text-white">
                    <div className="flex items-center justify-between gap-4">
                      <span>{item.q}</span>
                      <span className="text-[#8b949e] transition-transform group-open:rotate-45">+</span>
                    </div>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-[#7d8590]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white">Fale conosco</h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-[#30363d] bg-[#161b22] p-8">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7d8590]">Nome</label>
                <Input required placeholder="Seu nome" className="h-10 border-[#30363d] bg-[#0d1117] text-white placeholder:text-[#484f58] focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7d8590]">E-mail</label>
                <Input required type="email" placeholder="voce@email.com" className="h-10 border-[#30363d] bg-[#0d1117] text-white placeholder:text-[#484f58] focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7d8590]">Mensagem</label>
                <Textarea required rows={4} placeholder="Como podemos ajudar?" className="border-[#30363d] bg-[#0d1117] text-white placeholder:text-[#484f58] focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full h-11 bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-none"
              >
                {sending ? "Enviando…" : (<>Enviar mensagem <Send className="ml-2 h-4 w-4" /></>)}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
