import { createFileRoute, useSearch } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AegisLogo } from "@/components/AegisLogo";
import { Lock, ShieldCheck, Users, AlertCircle } from "lucide-react";
import { SITE_URLS } from "@/lib/constants";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Aegis" },
      { name: "description", content: "Acesse o painel do Aegis com sua conta Discord para gerenciar sua comunidade." },
      { property: "og:title", content: "Login — Aegis" },
      { property: "og:description", content: "Autenticação segura via Discord OAuth2." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" && search.error !== "null" ? search.error : undefined,
  }),
  component: LoginPage,
});

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Você cancelou o login. Tente novamente.",
  unauthorized: "Seu Discord ID não tem acesso autorizado ao painel.",
  token_exchange: "Erro ao autenticar com o Discord. Tente novamente.",
  user_fetch: "Não foi possível obter seus dados do Discord. Tente novamente.",
  server_error: "Erro interno do servidor. Tente novamente em instantes.",
};

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.2a.07.07 0 0 0-.073.035c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.51 12.51 0 0 0-.617-1.25A.077.077 0 0 0 9.7 3.2 19.736 19.736 0 0 0 5.94 4.369a.07.07 0 0 0-.032.027C2.533 9.043 1.61 13.58 2.063 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.027c.462-.63.873-1.295 1.226-1.994a.076.076 0 0 0-.041-.105 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.106c.36.699.772 1.364 1.225 1.994a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function LoginPage() {
  const { error } = useSearch({ from: "/login" });
  const errorMessage = error && error !== "null" ? (ERROR_MESSAGES[error] ?? "Ocorreu um erro inesperado.") : null;

  return (
    <SiteLayout>
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8 bg-[#0d1117]">
        <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <AegisLogo />
            <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Acesse o painel do <span className="text-blue-500">Aegis</span>
            </h1>
            <p className="mt-4 text-lg text-[#7d8590]">
              Plataforma de governança de segurança comunitária distribuída para o ecossistema Discord. Autentique-se com sua conta para revisar denúncias, gerenciar servidores e consultar reputações.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-[#7d8590]">
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-500" />
                <span>Blacklist colaborativa com validação HMAC-SHA256.</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-blue-500" />
                <span>RBAC restrito a moderadores autorizados via Discord ID.</span>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 text-blue-500" />
                <span>Sessão protegida por OAuth2 oficial do Discord.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-xl border border-[#30363d] bg-[#161b22] p-8 shadow-2xl shadow-black/20">
              <h2 className="font-display text-2xl font-semibold text-white">Entrar</h2>
              <p className="mt-2 text-sm text-[#7d8590]">
                Use sua conta Discord para acessar o dashboard administrativo.
              </p>

              {errorMessage && (
                <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <a
                href={SITE_URLS.arxLogin}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <span className="font-bold text-base">AX</span>
                Entrar com ARX
              </a>

              <div className="my-6 flex items-center gap-3 text-xs text-[#7d8590]">
                <div className="h-px flex-1 bg-[#30363d]" />
                <span>ou continue com</span>
                <div className="h-px flex-1 bg-[#30363d]" />
              </div>

              <a
                href={SITE_URLS.discordLogin}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#5865F2] text-sm font-semibold text-white transition-colors hover:bg-[#4752C4]"
              >
                <DiscordIcon className="h-5 w-5" />
                Continuar com Discord
              </a>

              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 mt-6 text-xs text-[#7d8590]">
                <p className="font-medium text-white">Apenas moderadores autorizados</p>
                <p className="mt-1">
                  O acesso ao painel é restrito a IDs Discord pré-aprovados pela equipe ARX DEVS. Solicite acesso no servidor de suporte.
                </p>
              </div>

              <p className="mt-6 text-center text-[11px] text-[#7d8590]">
                Ao continuar, você concorda com os Termos e a Política de Privacidade da ARX DEVS.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
