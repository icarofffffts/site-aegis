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
  { icon: MessageCircle, title: "Servidor de suporte", desc: "Respostas rápidas da nossa equipe e da comunidade.", action: "Entrar no Discord", href: "#" },
  { icon: Mail, title: "E-mail", desc: "Para parcerias, imprensa e questões formais.", action: "support@aegisbot.app", href: "mailto:support@aegisbot.app" },
  { icon: Activity, title: "Status", desc: "Acompanhe a disponibilidade em tempo real.", action: "Ver status", href: "#" },
  { icon: BookOpen, title: "Documentação", desc: "Guias passo-a-passo de configuração.", action: "Abrir docs", href: "#" },
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
      <section className="border-b border-border/60 bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <LifeBuoy className="h-3.5 w-3.5" /> Estamos aqui para ajudar
          </span>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">Suporte do <span className="text-gradient-primary">Aegis</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Encontre respostas, fale com nossa equipe ou abra um chamado. A maioria das dúvidas é resolvida em minutos.
          </p>
        </div>
      </section>

      {/* Contacts */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACTS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-3 inline-block text-xs font-medium text-primary group-hover:underline">{c.action} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ + Form */}
      <section className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
              {FAQ.map((item) => (
                <details key={item.q} className="group p-5">
                  <summary className="cursor-pointer list-none text-base font-medium">
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

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold">Fale com a equipe</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nome</label>
                <Input required placeholder="Seu nome" className="border-border bg-surface/60" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-mail</label>
                <Input required type="email" placeholder="voce@email.com" className="border-border bg-surface/60" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mensagem</label>
                <Textarea required rows={5} placeholder="Como podemos ajudar?" className="border-border bg-surface/60" />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-glow"
              >
                {sending ? "Enviando…" : (<>Enviar mensagem <Send className="h-4 w-4" /></>)}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
