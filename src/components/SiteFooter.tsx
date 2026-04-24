import { Link } from "@tanstack/react-router";
import { ShieldLogo } from "./ShieldLogo";
import { PLATFORMS, PlatformBadge } from "./PlatformBadge";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <ShieldLogo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Proteção avançada e moderação inteligente para a sua comunidade — pensada para escalar entre múltiplas plataformas.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <PlatformBadge key={p.name} platform={p} size="sm" />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Produto</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/comandos" className="hover:text-foreground">Comandos</Link></li>
              <li><Link to="/precos" className="hover:text-foreground">Preços</Link></li>
              <li><Link to="/suporte" className="hover:text-foreground">Suporte</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Comunidade</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Servidor de suporte</a></li>
              <li><a href="#" className="hover:text-foreground">Status</a></li>
              <li><a href="#" className="hover:text-foreground">Documentação</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Aegis. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Termos</a>
            <a href="#" className="hover:text-foreground">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
