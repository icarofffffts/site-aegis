import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { ShieldLogo } from "@/components/ShieldLogo";
import { Lock, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Shield by ARX DEVS" },
      { name: "description", content: "Acesse o painel do Shield com sua conta Discord para gerenciar denúncias e moderação." },
      { property: "og:title", content: "Login — Shield by ARX DEVS" },
      { property: "og:description", content: "Autenticação segura via Discord OAuth2." },
    ],
  }),
  component: LoginPage,
});

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.07.07 0 0 0-.073.035c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.51 12.51 0 0 0-.617-1.25A.077.077 0 0 0 9.7 3.2 19.736 19.736 0 0 0 5.94 4.369a.07.07 0 0 0-.032.027C2.533 9.043 1.61 13.58 2.063 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.105 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.106c.36.699.772 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function LoginPage() {
  const handleLogin = () => {
    toast.info("Autenticação Discord em configuração", {
      description: "Conecte o Lovable Cloud e adicione DISCORD_CLIENT_ID/SECRET para ativar o OAuth2.",
    });
  };

  return (
    <SiteLayout>
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <ShieldLogo />
            <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Acesse o painel do <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Shield</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Plataforma de governança de segurança comunitária distribuída para o ecossistema Discord. Autentique-se com sua conta para revisar denúncias, gerenciar servidores e consultar reputações.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <span>Blacklist colaborativa com validação HMAC-SHA256.</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-primary" />
                <span>RBAC restrito a moderadores autorizados via Discord ID.</span>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 text-primary" />
                <span>Sessão protegida por OAuth2 oficial do Discord.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-2xl border border-border/60 bg-surface/60 p-8 shadow-elegant backdrop-blur-xl">
              <h2 className="font-display text-2xl font-semibold text-foreground">Entrar</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use sua conta Discord para acessar o dashboard administrativo.
              </p>

              <Button
                onClick={handleLogin}
                size="lg"
                className="mt-8 w-full bg-[#5865F2] text-white hover:bg-[#4752C4]"
              >
                <DiscordIcon className="mr-2 h-5 w-5" />
                Continuar com Discord
              </Button>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>acesso restrito</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="rounded-lg border border-border/50 bg-background/40 p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Apenas moderadores autorizados</p>
                <p className="mt-1">
                  O acesso ao painel é restrito a IDs Discord pré-aprovados pela equipe ARX DEVS. Solicite acesso no servidor de suporte.
                </p>
              </div>

              <p className="mt-6 text-center text-[11px] text-muted-foreground">
                Ao continuar, você concorda com os Termos e a Política de Privacidade da ARX DEVS.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
