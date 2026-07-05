import { Link } from "@tanstack/react-router";
import { AegisLogo } from "./AegisLogo";
import { PLATFORMS, PlatformBadge } from "./PlatformBadge";
import { SITE_URLS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <AegisLogo />
            <p className="mt-4 max-w-sm text-sm text-[#7d8590]">
              Plataforma de governança de segurança comunitária distribuída para o Discord. Um produto <span className="font-semibold text-white">ARX DEVS</span>.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Produto</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#7d8590]">
              <li><Link to="/comandos" className="hover:text-blue-500">Comandos</Link></li>
              <li><Link to="/precos" className="hover:text-blue-500">Preços</Link></li>
              <li><Link to="/suporte" className="hover:text-blue-500">Suporte</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">ARX DEVS</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#7d8590]">
              <li><a href={SITE_URLS.institutional} className="hover:text-blue-500">Contexto</a></li>
              <li><a href={SITE_URLS.supportServer} className="hover:text-blue-500">Servidor de suporte</a></li>
              <li><a href={SITE_URLS.statusPage} className="hover:text-blue-500">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-[#30363d] pt-8 text-[11px] text-[#7d8590] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ARX DEVS — Aegis. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href={SITE_URLS.terms} className="hover:text-white">Termos</a>
            <a href={SITE_URLS.privacy} className="hover:text-white">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
