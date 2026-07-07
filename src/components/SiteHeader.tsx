import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { AegisLogo } from "./AegisLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_URLS } from "@/lib/constants";
import { getStoredBranding } from "@/lib/branding-store";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/comandos", label: "Comandos" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/precos", label: "Preços" },
  { to: "/suporte", label: "Suporte" },
] as const;

interface SessionUser {
  id: string;
  username: string;
  avatar: string;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [branding, setBranding] = useState(getStoredBranding());

  useEffect(() => {
    const onStorage = () => setBranding(getStoredBranding());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("aegis_session") : null;
    fetch("/api/me", {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.authenticated) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-[#010409]/80 backdrop-blur-md"
          : "bg-[#010409]/40 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link
          to="/"
          className="flex items-center transition-transform duration-300 hover:scale-[1.02]"
          onClick={() => setOpen(false)}
        >
          <AegisLogo
            brandName={branding?.brandName}
            logoUrl={branding?.logoUrl}
            hideBranding={branding?.hideBranding}
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="nav-link rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                <img src={user.avatar} alt={user.username} className="h-6 w-6 rounded-full" />
                <span>{user.username}</span>
                <ChevronDown className="h-3 w-3" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => {
                  try {
                    localStorage.removeItem("aegis_session");
                  } catch {
                    /* ignore */
                  }
                  window.location.replace("/");
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Link to="/login" search={{ error: undefined }}>
                Login
              </Link>
            </Button>
          )}
          <Button
            asChild
            className="bg-[#1f883d] text-white hover:bg-[#1a7a35] shadow-none border border-[#1f883d]"
          >
            <a href={SITE_URLS.botInvite} rel="noopener">
              Adicionar ao Discord
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground data-[status=active]:bg-surface data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <img src={user.avatar} alt={user.username} className="h-5 w-5 rounded-full" />
                {user.username}
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  try {
                    localStorage.removeItem("aegis_session");
                  } catch {
                    /* ignore */
                  }
                  window.location.replace("/");
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-400 hover:bg-surface w-full text-left"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              search={{ error: undefined }}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              Login
            </Link>
          )}
          <Button
            asChild
            className="mt-2 bg-[#1f883d] text-white hover:bg-[#1a7a35] shadow-none border border-[#1f883d]"
          >
            <a href={SITE_URLS.botInvite} rel="noopener">
              Adicionar ao Discord
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
