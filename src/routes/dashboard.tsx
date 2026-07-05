import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Shield,
  Users,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  AlertTriangle,
  LogOut,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Bell,
  Search,
  Palette,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { SITE_URLS } from "@/lib/constants";
import { BrandingSection } from "@/components/BrandingSection";

const ADMIN_DISCORD_IDS = ["858698544822353951"];

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

interface SessionUser {
  id: string;
  username: string;
  avatar: string;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
}

interface DashboardData {
  stats: {
    totalAlerts: number;
    criticalAlerts: number;
    flaggedUsers: number;
    alertsToday: number;
    botOnline: boolean;
    botLastSeen: string | null;
  };
  recentActions: Array<{
    id: string;
    action_type: string;
    discord_user_id: string;
    count?: number;
    reason: string;
    created_at: string;
  }>;
  pendingReports: Array<{
    id: string;
    target_discord_id: string;
    reason: string;
    severity: string;
    created_at: string;
  }>;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aegis_session");
}

function authFetch(input: RequestInfo | URL, options: RequestInit = {}) {
  const token = getToken();
  return fetch(input, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [serverSelected, setServerSelected] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [guilds, setGuilds] = useState<{ mutual: Guild[]; notAdded: Guild[] } | null>(null);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [showGuildPicker, setShowGuildPicker] = useState(false);
  const isPremium = !!(user && ADMIN_DISCORD_IDS.includes(user.id));
  const PREMIUM_TABS = ["alerts", "protection", "stats", "settings", "whitelabel"];
  const isTabLocked = (tab: string) => !isPremium && PREMIUM_TABS.includes(tab);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    authFetch("/api/me", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        clearTimeout(timeout);
        if (d?.authenticated) setUser(d.user);
        else window.location.href = "/login";
      })
      .catch((err) => {
        clearTimeout(timeout);
        if (err?.name !== "AbortError") window.location.href = "/login";
      })
      .finally(() => setLoadingUser(false));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const fetchDashboard = useCallback(() => {
    authFetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && !d.error) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // Busca servidores do usu??rio
  useEffect(() => {
    authFetch("/api/guilds")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setGuilds(d);
      })
      .catch(() => {});
  }, []);

  if (loadingUser) {
    return (
      <SiteLayout>
        <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-[#0d1117]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#30363d] border-t-blue-500" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="flex h-[calc(100vh-64px)] bg-[#0d1117] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#30363d] bg-[#010409] flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            {/* Seletor de servidor */}
            <div className="relative">
              <button
                onClick={() => setShowGuildPicker((v) => !v)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-[#30363d] bg-[#0d1117] hover:border-[#8b949e] hover:bg-[#161b22] transition-all cursor-pointer"
              >
                {selectedGuild ? (
                  <>
                    {selectedGuild.icon ? (
                      <img
                        src={selectedGuild.icon}
                        alt={selectedGuild.name}
                        className="h-6 w-6 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {selectedGuild.name[0]}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-white truncate flex-1 text-left">
                      {selectedGuild.name}
                    </span>
                  </>
                ) : (
                  <>
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="h-6 w-6 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {user?.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-white truncate flex-1 text-left">
                      {user?.username ?? "..."}
                    </span>
                  </>
                )}
                <span className="text-[#7d8590] text-xs shrink-0">
                  {showGuildPicker ? "???" : "???"}
                </span>
              </button>

              {/* Overlay para fechar ao clicar fora */}
              {showGuildPicker && (
                <div className="fixed inset-0 z-40" onClick={() => setShowGuildPicker(false)} />
              )}

              {/* Dropdown de servidores */}
              {showGuildPicker && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[#30363d] bg-[#161b22] shadow-2xl z-50 max-h-72 overflow-y-auto">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#7d8590] border-b border-[#30363d]">
                    {guilds === null
                      ? "Carregando..."
                      : `${guilds.mutual.length} servidor${guilds.mutual.length !== 1 ? "es" : ""} com Aegis`}
                  </div>
                  {guilds?.mutual.length === 0 && (
                    <div className="px-3 py-4 text-xs text-[#7d8590] text-center">
                      Nenhum servidor encontrado.
                      <br />
                      <span className="text-[10px]">Adicione o Aegis a um servidor primeiro.</span>
                    </div>
                  )}
                  {guilds?.mutual.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGuild(g);
                        setShowGuildPicker(false);
                        setActiveTab("overview");
                        setServerSelected(true);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#0d1117] transition-colors ${selectedGuild?.id === g.id ? "bg-[#0d1117]" : ""}`}
                    >
                      {g.icon ? (
                        <img src={g.icon} alt={g.name} className="h-7 w-7 rounded-full shrink-0" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-[#30363d] flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {g.name[0]}
                        </div>
                      )}
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{g.name}</p>
                        {g.owner && <p className="text-[10px] text-[#7d8590]">Dono</p>}
                      </div>
                      {selectedGuild?.id === g.id && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                  {(guilds?.notAdded?.length ?? 0) > 0 && (
                    <>
                      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#7d8590] border-t border-[#30363d]">
                        Adicionar Aegis
                      </div>
                      {guilds?.notAdded.map((g) => (
                        <a
                          key={g.id}
                          href={`https://discord.com/oauth2/authorize?client_id=1485085619280679145&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`}
                          target="_blank"
                          rel="noopener"
                          onClick={() => setShowGuildPicker(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#0d1117] transition-colors opacity-60 hover:opacity-100"
                        >
                          {g.icon ? (
                            <img
                              src={g.icon}
                              alt={g.name}
                              className="h-7 w-7 rounded-full shrink-0 grayscale"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-[#30363d] flex items-center justify-center text-xs font-bold text-[#7d8590] shrink-0">
                              {g.name[0]}
                            </div>
                          )}
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#7d8590] truncate">{g.name}</p>
                          </div>
                          <Plus className="h-4 w-4 text-[#7d8590] shrink-0" />
                        </a>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="pt-2 pb-2 px-3 text-[10px] font-bold text-[#7d8590] uppercase tracking-wider">
              Geral
            </div>
            <SidebarLink
              icon={LayoutDashboard}
              label="Overview"
              active={activeTab === "overview"}
              locked={!serverSelected}
              onClick={() => {
                if (serverSelected) setActiveTab("overview");
              }}
            />
            <SidebarLink
              icon={BarChart3}
              label="Estat?sticas"
              active={activeTab === "stats"}
              locked={!serverSelected || isTabLocked("stats")}
              onClick={() => {
                if (serverSelected && !isTabLocked("stats")) setActiveTab("stats");
                else if (serverSelected) setActiveTab("premium");
              }}
            />

            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-[#7d8590] uppercase tracking-wider">
              Ferramentas
            </div>
            <SidebarLink
              icon={AlertTriangle}
              label="AutoMod AI"
              active={activeTab === "automod"}
              locked={!serverSelected || !isPremium}
              onClick={() => {
                if (serverSelected && isPremium) setActiveTab("automod");
                else if (serverSelected) setActiveTab("premium");
              }}
            />
            <SidebarLink
              icon={Bell}
              label="Alertas"
              active={activeTab === "alerts"}
              locked={!serverSelected || isTabLocked("alerts")}
              onClick={() => {
                if (serverSelected && !isTabLocked("alerts")) setActiveTab("alerts");
                else if (serverSelected) setActiveTab("premium");
              }}
            />
            <SidebarLink
              icon={Shield}
              label="Prote??o"
              active={activeTab === "protection"}
              locked={!serverSelected || isTabLocked("protection")}
              onClick={() => {
                if (serverSelected && !isTabLocked("protection")) setActiveTab("protection");
                else if (serverSelected) setActiveTab("premium");
              }}
            />
            <SidebarLink
              icon={Search}
              label="Comandos"
              active={activeTab === "commands"}
              locked={!serverSelected || !isPremium}
              onClick={() => {
                if (serverSelected && isPremium) setActiveTab("commands");
                else if (serverSelected) setActiveTab("premium");
              }}
            />

            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-[#7d8590] uppercase tracking-wider">
              Configura??es
            </div>
            <SidebarLink
              icon={Settings}
              label="Meu Servidor"
              active={activeTab === "settings"}
              locked={!serverSelected || isTabLocked("settings")}
              onClick={() => {
                if (serverSelected && !isTabLocked("settings")) setActiveTab("settings");
                else if (serverSelected) setActiveTab("premium");
              }}
            />
            <SidebarLink
              icon={Palette}
              label="White-Label"
              active={activeTab === "whitelabel"}
              locked={!serverSelected || isTabLocked("whitelabel")}
              onClick={() => {
                if (serverSelected && !isTabLocked("whitelabel")) setActiveTab("whitelabel");
                else if (serverSelected) setActiveTab("premium");
              }}
            />
          </nav>

          <div className="p-4 border-t border-[#30363d]">
            {!isPremium && (
              <div className="mb-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border border-[#2a2a4e]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-yellow-500 text-xs">???</span>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Premium
                  </span>
                </div>
                <p className="text-[10px] text-[#8b949e] leading-relaxed mb-2">
                  Desbloqueie Alertas, Prote????o, Estat??sticas e configura????es avan??adas.
                </p>
                <button
                  onClick={() => setActiveTab("premium")}
                  className="w-full text-[10px] font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded py-1.5 transition-colors"
                >
                  Assine o Premium
                </button>
              </div>
            )}
            {isPremium && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-[#132b1a] border border-[#1f4a2e]">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xs">???</span>
                  <span className="text-[11px] font-bold text-[#3fb950] uppercase tracking-wider">
                    Premium Ativo
                  </span>
                </div>
                <p className="text-[10px] text-[#7d8590] mt-0.5">
                  Todos os recursos desbloqueados.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-[#7d8590] hover:text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  try {
                    localStorage.removeItem("aegis_session");
                  } catch {}
                  window.location.replace("/");
                }}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-[#30363d] bg-[#161b22] text-white hover:bg-[#1c2128]"
              >
                <a href={SITE_URLS.supportServer} rel="noopener">
                  Suporte T??cnico
                </a>
              </Button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            {!serverSelected ? (
              <div className="animate-in fade-in duration-500">
                <h1 className="text-2xl font-bold text-white mb-2">Escolha um Servidor</h1>
                <p className="text-[#8b949e] mb-8">
                  Selecione um servidor abaixo para gerenciar ou adicione o Aegis a um novo
                  servidor.
                </p>

                <h2 className="text-sm font-bold text-[#7d8590] uppercase tracking-wider mb-4">
                  Servidores com Aegis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {guilds?.mutual.length === 0 && (
                    <p className="text-[#7d8590] text-sm">Nenhum servidor encontrado.</p>
                  )}
                  {guilds?.mutual.map((g) => (
                    <div
                      key={g.id}
                      className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col items-center text-center hover:border-[#8b949e] transition-colors"
                    >
                      {g.icon ? (
                        <img src={g.icon} alt={g.name} className="h-16 w-16 rounded-full mb-4" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-[#30363d] flex items-center justify-center text-2xl font-bold text-white mb-4">
                          {g.name[0]}
                        </div>
                      )}
                      <h3 className="font-bold text-white mb-1 truncate w-full">{g.name}</h3>
                      <span className="text-xs text-[#7d8590] mb-4">
                        Dono: {g.owner ? "Sim" : "N?o"}
                      </span>
                      <Button
                        className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border-none"
                        onClick={() => {
                          setSelectedGuild(g);
                          setActiveTab("overview");
                          setServerSelected(true);
                        }}
                      >
                        Configurar
                      </Button>
                    </div>
                  ))}
                </div>

                <h2 className="text-sm font-bold text-[#7d8590] uppercase tracking-wider mb-4">
                  Adicionar Aegis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guilds?.notAdded?.length === 0 && (
                    <p className="text-[#7d8590] text-sm">
                      Voc? n?o gerencia nenhum outro servidor.
                    </p>
                  )}
                  {guilds?.notAdded?.map((g) => (
                    <div
                      key={g.id}
                      className="bg-[#161b22]/50 border border-[#30363d] rounded-xl p-6 flex flex-col items-center text-center opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {g.icon ? (
                        <img
                          src={g.icon}
                          alt={g.name}
                          className="h-16 w-16 rounded-full mb-4 grayscale"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-[#30363d] flex items-center justify-center text-2xl font-bold text-[#7d8590] mb-4">
                          {g.name[0]}
                        </div>
                      )}
                      <h3 className="font-bold text-[#7d8590] mb-1 truncate w-full">{g.name}</h3>
                      <div className="flex-1" />
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mt-4 border-[#30363d] text-[#7d8590] hover:text-white hover:bg-[#30363d] bg-transparent"
                      >
                        <a
                          href={`https://discord.com/oauth2/authorize?client_id=1485085619280679145&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}`}
                          target="_blank"
                          rel="noopener"
                        >
                          Adicionar Aegis
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {!isPremium && activeTab !== "premium" && (
                  <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">??</span>
                      <div>
                        <h3 className="text-white font-bold text-sm">
                          An?ncio: Remova os an?ncios e desbloqueie todos os recursos com o Aegis
                          Premium
                        </h3>
                        <p className="text-[#8b949e] text-xs mt-0.5">
                          Apoie o desenvolvimento e tenha acesso a estat?sticas e alertas em tempo
                          real.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveTab("premium")}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap border-none"
                    >
                      Fazer Upgrade
                    </Button>
                  </div>
                )}
                {activeTab === "premium" && (
                  <PremiumPage isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
                )}
                {activeTab === "overview" && <OverviewSection data={data} loading={loadingData} />}
                {activeTab === "alerts" &&
                  (isPremium ? (
                    <AlertsSection authFetch={authFetch} />
                  ) : (
                    <PremiumPage isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
                  ))}
                {activeTab === "protection" &&
                  (isPremium ? (
                    <ProtectionSection authFetch={authFetch} guildId={selectedGuild?.id} />
                  ) : (
                    <PremiumPage isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
                  ))}
                {activeTab === "stats" &&
                  (isPremium ? (
                    <StatsSection authFetch={authFetch} />
                  ) : (
                    <PremiumPage isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
                  ))}
                {activeTab === "settings" &&
                  (isPremium ? (
                    <ServerConfigSection authFetch={authFetch} guild={selectedGuild} />
                  ) : (
                    <PremiumPage isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
                  ))}
                {activeTab === "whitelabel" &&
                  (isPremium ? (
                    <BrandingSection authFetch={authFetch} guild={selectedGuild} />
                  ) : (
                    <PremiumPage isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
                  ))}
                {(activeTab === "automod" || activeTab === "commands") && (
                  <PremiumPage isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </SiteLayout>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick, badge, locked }: any) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-[#1f6feb] text-white"
          : locked
            ? "text-[#484f58] cursor-not-allowed"
            : "text-[#7d8590] hover:bg-[#161b22] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {locked ? (
          <svg
            className="h-4 w-4 text-[#484f58]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span className={`text-sm font-medium ${locked ? "text-[#484f58]" : ""}`}>{label}</span>
      </div>
      {badge && !locked && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? "bg-white/20 text-white" : "bg-[#30363d] text-[#7d8590]"
          }`}
        >
          {badge}
        </span>
      )}
      {locked && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1c1333] text-[#d2a8ff]">
          PRO
        </span>
      )}
    </button>
  );
}

function PremiumPage({ isPremium, onUpgrade }: { isPremium: boolean; onUpgrade: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isPremium ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">??????</div>
          <h2 className="text-2xl font-bold text-white mb-2">Premium Ativo</h2>
          <p className="text-[#8b949e] mb-4 max-w-md">
            Todos os recursos do AegisBot est??o desbloqueados para a sua conta.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-lg w-full mt-4">
            {[
              { icon: "???????", title: "Anti-Raid ML", desc: "Detec????o inteligente de ataques" },
              {
                icon: "????",
                title: "Relat??rios Semanais",
                desc: "Insights completos do servidor",
              },
              { icon: "????", title: "Whitelist Regex", desc: "Padr??es avan??ados de isen????o" },
              {
                icon: "????",
                title: "AutoMod AI",
                desc: "Modera????o com intelig??ncia artificial",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#21262d] border border-[#30363d] rounded-lg p-4 text-left"
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold text-[#e6edf3]">{f.title}</h3>
                <p className="text-xs text-[#8b949e] mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">???</div>
          <h2 className="text-2xl font-bold text-white mb-2">AegisBot Premium</h2>
          <p className="text-[#8b949e] mb-8 max-w-md">
            Desbloqueie todos os recursos avan??ados de prote????o para seu servidor.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-lg w-full mb-8">
            {[
              { icon: "???????", title: "Anti-Raid ML", desc: "Machine learning contra ataques" },
              { icon: "????", title: "Relat??rios Semanais", desc: "An??lise detalhada" },
              { icon: "????", title: "Whitelist Regex", desc: "Padr??es avan??ados" },
              { icon: "????", title: "AutoMod AI", desc: "Modera????o autom??tica" },
              { icon: "????", title: "Blacklist Ilimitada", desc: "Sem limites de termos" },
              { icon: "???", title: "Prioridade", desc: "Suporte priorit??rio" },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg p-4 text-left"
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold text-[#e6edf3]">{f.title}</h3>
                <p className="text-xs text-[#8b949e] mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => alert("Em breve: sistema de assinatura via Mercado Pago.")}
            className="px-6 py-2.5 bg-gradient-to-r from-[#238636] to-[#2ea043] text-white font-semibold rounded-lg hover:from-[#2ea043] hover:to-[#3fb950] transition-all"
          >
            Assinar Premium
          </button>
          <p className="text-[10px] text-[#484f58] mt-3">
            Em breve: sistema de assinatura via Mercado Pago
          </p>
        </div>
      )}
    </div>
  );
}

function OverviewSection({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const s = data?.stats;

  const STATS = [
    {
      label: "Usu??rios Flagados",
      value: s?.flaggedUsers ?? "???",
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Alertas Hoje",
      value: s?.alertsToday ?? "???",
      icon: Shield,
      color: "text-green-500",
    },
    {
      label: "Alertas Cr??ticos",
      value: s?.criticalAlerts ?? "???",
      icon: AlertTriangle,
      color: "text-orange-500",
    },
    {
      label: "Total de Alertas",
      value: s?.totalAlerts ?? "???",
      icon: Clock,
      color: "text-purple-500",
    },
  ];

  const actionLabel: Record<string, string> = {
    warned: "Advert??ncia Aplicada",
    kicked: "Usu??rio Expulso",
    banned: "Usu??rio Banido",
    muted: "Usu??rio Silenciado",
    purge: "Mensagens Apagadas",
  };

  const actionColor: Record<string, string> = {
    warned: "bg-yellow-500/10 text-yellow-500",
    kicked: "bg-orange-500/10 text-orange-500",
    banned: "bg-red-500/10 text-red-500",
    muted: "bg-purple-500/10 text-purple-500",
    purge: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard do Servidor</h1>
          <p className="text-[#7d8590] mt-1">Vis??o geral da seguran??a e atividades do Aegis.</p>
        </div>
        <div className="flex items-center gap-2">
          {s?.botOnline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-[#3fb950] text-xs font-semibold">
              <Wifi className="h-3.5 w-3.5" />
              Bot Online
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-red-400 text-xs font-semibold">
              <WifiOff className="h-3.5 w-3.5" />
              Bot Offline
            </div>
          )}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl border border-[#30363d] bg-[#161b22]/50">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-[#0d1117] border border-[#30363d] ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <span className="inline-block h-7 w-16 rounded bg-[#30363d] animate-pulse" />
              ) : (
                stat.value
              )}
            </div>
            <div className="text-sm text-[#7d8590] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-[#30363d] bg-[#161b22]/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
            <h3 className="font-semibold text-white">Atividade Recente</h3>
            <span className="text-xs text-[#7d8590]">Atualiza a cada 30s</span>
          </div>
          <div className="divide-y divide-[#30363d]">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#30363d] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-[#30363d] animate-pulse" />
                    <div className="h-3 w-48 rounded bg-[#30363d] animate-pulse" />
                  </div>
                </div>
              ))
            ) : data?.recentActions.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-[#7d8590]">
                Nenhuma a????o registrada ainda.
              </div>
            ) : (
              data?.recentActions.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${actionColor[item.action_type] ?? "bg-[#30363d] text-[#7d8590]"}`}
                    >
                      {item.action_type === "banned" && <XCircle className="h-4 w-4" />}
                      {item.action_type === "warned" && <AlertTriangle className="h-4 w-4" />}
                      {(item.action_type === "kicked" || item.action_type === "muted") && (
                        <Shield className="h-4 w-4" />
                      )}
                      {item.action_type === "purge" && <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {actionLabel[item.action_type] ?? item.action_type}
                        {item.count && item.count > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#30363d] text-[10x] text-[#7d8590]">
                            {item.count}x
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#7d8590]">
                        ID: {item.discord_user_id} ??? {item.reason}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#7d8590]">{timeAgo(item.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bot Status */}
        <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 p-6 flex flex-col items-center justify-center text-center">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 border-4 ${s?.botOnline ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
          >
            {s?.botOnline ? (
              <Wifi className="h-8 w-8 text-green-500" />
            ) : (
              <WifiOff className="h-8 w-8 text-red-400" />
            )}
          </div>
          <h3 className="font-semibold text-white">AegisBot</h3>
          <p
            className={`text-sm mt-1 font-medium ${s?.botOnline ? "text-green-500" : "text-red-400"}`}
          >
            {s?.botOnline ? "Online e operacional" : "Offline"}
          </p>
          {s?.botLastSeen && (
            <p className="text-xs text-[#7d8590] mt-2">??ltimo sinal: {timeAgo(s.botLastSeen)}</p>
          )}
          <div className="mt-4 w-full space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-[#7d8590]">Alertas ativos</span>
              <span className="text-white font-medium">{s?.totalAlerts ?? "???"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#7d8590]">Cr??ticos</span>
              <span className="text-red-400 font-medium">{s?.criticalAlerts ?? "???"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#7d8590]">Usu??rios flagados</span>
              <span className="text-white font-medium">{s?.flaggedUsers ?? "???"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ?????? Alertas ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function AlertsSection({ authFetch }: { authFetch: typeof window.fetch }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    authFetch("/api/botconfig")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.flaggedUsers) {
          // Converte o mapa de usu??rios em lista de alertas
          const list = Object.entries(d.flaggedUsers).map(([id, info]: [string, any]) => ({
            userId: id,
            ...info,
          }));
          setAlerts(
            list.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const SEV_COLOR: Record<string, string> = {
    critical: "text-red-400 bg-red-500/10 border-red-500/30",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    low: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };

  const filtered = alerts.filter((a) => {
    const matchSearch =
      !search || a.userId.includes(search) || a.types.join(",").includes(search.toLowerCase());
    const matchSev = severityFilter === "all" || a.maxSeverity === severityFilter;
    return matchSearch && matchSev;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertas Ativos</h1>
          <p className="text-[#7d8590] mt-1">
            Usu??rios com alertas registrados no sistema AegisBot.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#7d8590]">{alerts.length} total</span>
          <span className="text-red-400 font-medium">
            {alerts.filter((a) => a.maxSeverity === "critical").length} cr??ticos
          </span>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8590]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID ou tipo..."
            className="pl-9 pr-4 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-sm text-white placeholder:text-[#7d8590] focus:outline-none focus:border-blue-500 w-56"
          />
        </div>
        {["all", "critical", "high", "medium", "low"].map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
              severityFilter === s
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-[#30363d] bg-[#161b22] text-[#7d8590] hover:text-white"
            }`}
          >
            {s === "all" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-[#30363d] bg-[#0d1117] text-[10px] font-bold uppercase tracking-wider text-[#7d8590]">
          <span>Usu??rio</span>
          <span>Tipos</span>
          <span>Alertas</span>
          <span>Severidade</span>
        </div>
        <div className="divide-y divide-[#30363d]">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-4 w-40 rounded bg-[#30363d] animate-pulse" />
                <div className="h-4 w-20 rounded bg-[#30363d] animate-pulse ml-auto" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="text-white font-medium">Nenhum alerta encontrado</p>
            </div>
          ) : (
            filtered.map((alert) => (
              <div
                key={alert.userId}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-[#161b22] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-[#30363d] flex items-center justify-center text-xs text-[#7d8590] font-bold shrink-0">
                    {alert.userId.slice(-2)}
                  </div>
                  <span className="text-sm font-mono text-white truncate">{alert.userId}</span>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {alert.types.slice(0, 3).map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#30363d] text-[#7d8590]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-bold text-white text-center">{alert.count}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${SEV_COLOR[alert.maxSeverity]}`}
                >
                  {alert.maxSeverity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ?????? Prote????o ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function ProtectionSection({
  authFetch,
  guildId,
}: {
  authFetch: typeof window.fetch;
  guildId?: string;
}) {
  const GUILD_ID = guildId ?? "placeholder"; // sem guild selecionada ainda
  const [patterns, setPatterns] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newPattern, setNewPattern] = useState({
    value: "",
    type: "keyword",
    severity: "high",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [blacklistData, setBlacklistData] = useState<any[] | null>(null);
  const [whitelistData, setWhitelistData] = useState<any[] | null>(null);

  useEffect(() => {
    authFetch(`/api/protection?guildId=${GUILD_ID}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setPatterns(d.patterns ?? []);
          setConfig(d.config);
        }
      })
      .catch(() => {});
  }, [guildId]);

  const loadBlacklist = useCallback(async () => {
    try {
      const [bl, wl] = await Promise.all([
        authFetch("/api/blacklist?guildId=" + (guildId ?? "")),
        authFetch("/api/whitelist?guildId=" + (guildId ?? "")),
      ]);
      const blData = await bl.json();
      const wlData = await wl.json();
      setBlacklistData(blData.data ?? []);
      setWhitelistData(wlData.data ?? []);
    } catch {
      setBlacklistData([]);
      setWhitelistData([]);
    }
  }, [guildId]);

  useEffect(() => {
    loadBlacklist();
  }, [loadBlacklist]);

  async function removeBlacklistItem(id: number) {
    await authFetch("/api/blacklist?id=" + id, { method: "DELETE" });
    setBlacklistData((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
  }

  async function removeWhitelistItem(id: number) {
    await authFetch("/api/whitelist?id=" + id, { method: "DELETE" });
    setWhitelistData((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
  }

  const addPattern = async () => {
    if (!newPattern.value.trim()) return;
    setSaving(true);
    await authFetch("/api/protection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guildId: GUILD_ID,
        patternType: newPattern.type,
        patternValue: newPattern.value,
        severity: newPattern.severity,
        description: newPattern.description,
      }),
    });
    setNewPattern({ value: "", type: "keyword", severity: "high", description: "" });
    const d = await authFetch(`/api/protection?guildId=${GUILD_ID}`).then((r) => r.json());
    setPatterns(d.patterns ?? []);
    setSaving(false);
  };

  const removePattern = async (id: string) => {
    await authFetch(`/api/protection?id=${id}`, { method: "DELETE" });
    setPatterns((p) => p.filter((x) => x.id !== id));
  };

  const toggleConfig = async (key: string, val: boolean) => {
    const updated = { ...config, [key]: val };
    setConfig(updated);
    await authFetch("/api/protection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId: GUILD_ID, config: { [key]: val } }),
    });
  };

  const SEV_COLOR: Record<string, string> = {
    critical: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-blue-400",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold text-white">Prote????o</h1>
        <p className="text-[#7d8590] mt-1">
          Configura????es de detec????o e padr??es customizados do AegisBot.
        </p>
      </header>

      <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-[#e6edf3] mb-2">
          ??????? Prote????o Inteligente com OCR
        </h3>
        <p className="text-xs text-[#8b949e] leading-relaxed">
          O <strong className="text-[#e6edf3]">AegisBot</strong> utiliza{" "}
          <strong className="text-[#e6edf3]">OCR (Optical Character Recognition)</strong> para
          escanear imagens enviadas nos servidores monitorados. Isso significa que mesmo que um
          usu??rio tente evitar a detec????o postando conte??do proibido como imagem, o bot consegue
          extrair o texto e aplicar as regras de prote????o.
        </p>
        <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
          Al??m disso, o bot escaneia <strong className="text-[#e6edf3]">dom??nios em links</strong>
          ,<strong className="text-[#e6edf3]"> palavras-chave</strong> em mensagens de texto, e
          <strong className="text-[#e6edf3]"> express??es regulares</strong> para detectar golpes,
          fraudes e conte??do malicioso.
        </p>
      </div>

      <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">???? Blacklist de Termos</h3>
        <p className="text-xs text-[#8b949e] mb-3">
          Gerencie os termos, palavras-chave e express??es regulares que o bot bloqueia
          automaticamente. Use os comandos <code className="text-[#58a6ff]">/blacklist add</code>{" "}
          and <code className="text-[#58a6ff]">/blacklist remove</code> no Discord, ou gerencie
          aqui.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
          {blacklistData === null ? (
            <div className="text-xs text-[#8b949e]">Carregando...</div>
          ) : blacklistData.length === 0 ? (
            <div className="text-xs text-[#8b949e]">
              Nenhum termo na blacklist. Use /blacklist add no Discord para adicionar.
            </div>
          ) : (
            blacklistData.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#161b22] rounded px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {item.is_regex ? (
                    <span className="text-[10px] font-mono text-[#d2a8ff] bg-[#1c1333] px-1.5 py-0.5 rounded">
                      Regex
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#58a6ff] bg-[#0d2b45] px-1.5 py-0.5 rounded">
                      Texto
                    </span>
                  )}
                  <code className="text-xs text-[#e6edf3]">{item.value}</code>
                </div>
                <button
                  onClick={() => removeBlacklistItem(item.id)}
                  className="text-[#f85149] hover:text-[#ff7b72] text-xs"
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[#21262d] border border-[#30363d] rounded-lg p-4 mb-4">
        <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">??? Whitelist (Isentos)</h3>
        <p className="text-xs text-[#8b949e] mb-3">
          Usu??rios, cargos (roles) ou dom??nios isentos de verifica????o. Use{" "}
          <code className="text-[#58a6ff]">/whitelist add</code> no Discord ou gerencie aqui.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {whitelistData === null ? (
            <div className="text-xs text-[#8b949e]">Carregando...</div>
          ) : whitelistData.length === 0 ? (
            <div className="text-xs text-[#8b949e]">Nenhum item na whitelist.</div>
          ) : (
            whitelistData.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#161b22] rounded px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#3fb950] bg-[#132b1a] px-1.5 py-0.5 rounded">
                    {item.type === "user"
                      ? "???? User"
                      : item.type === "role"
                        ? "???? Role"
                        : "???? Dom??nio"}
                  </span>
                  <code className="text-xs text-[#e6edf3]">{item.value}</code>
                </div>
                <button
                  onClick={() => removeWhitelistItem(item.id)}
                  className="text-[#f85149] hover:text-[#ff7b72] text-xs"
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toggles de config */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 p-6 space-y-4">
        <h3 className="font-semibold text-white mb-2">Configura????es do Servidor</h3>
        {[
          {
            key: "disclosure_detection_enabled",
            label: "Detec????o silenciosa ativa",
            desc: "Analisa mensagens em background sem resposta p??blica",
          },
          {
            key: "auto_kick_on_critical",
            label: "A????o autom??tica em cr??ticos",
            desc: "Reage e loga automaticamente quando severidade cr??tica ?? detectada",
          },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b border-[#30363d] last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-xs text-[#7d8590] mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => toggleConfig(key, !config?.[key])}
              className="text-[#7d8590] hover:text-white transition-colors"
            >
              {config?.[key] ? (
                <ToggleRight className="h-7 w-7 text-green-500" />
              ) : (
                <ToggleLeft className="h-7 w-7" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Padr??es de detec????o */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <h3 className="font-semibold text-white">Padr??es de Detec????o Customizados</h3>
          <span className="text-xs text-[#7d8590]">
            {patterns.length} padr??o{patterns.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Adicionar novo */}
        <div className="px-6 py-4 border-b border-[#30363d] bg-[#0d1117] flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-[10px] text-[#7d8590] uppercase font-bold mb-1 block">
              Valor
            </label>
            <input
              value={newPattern.value}
              onChange={(e) => setNewPattern((p) => ({ ...p, value: e.target.value }))}
              placeholder="ex: betano, /cassino/i"
              className="w-full px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#7d8590] uppercase font-bold mb-1 block">
              Tipo
            </label>
            <select
              value={newPattern.type}
              onChange={(e) => setNewPattern((p) => ({ ...p, type: e.target.value }))}
              className="px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-sm text-white focus:outline-none"
            >
              <option value="keyword">Keyword</option>
              <option value="regex">Regex</option>
              <option value="url">URL</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#7d8590] uppercase font-bold mb-1 block">
              Severidade
            </label>
            <select
              value={newPattern.severity}
              onChange={(e) => setNewPattern((p) => ({ ...p, severity: e.target.value }))}
              className="px-3 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] text-sm text-white focus:outline-none"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Button
            onClick={addPattern}
            disabled={saving || !newPattern.value.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-none h-9"
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>

        <div className="divide-y divide-[#30363d]">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-3">
                <div className="h-3 w-48 rounded bg-[#30363d] animate-pulse" />
              </div>
            ))
          ) : patterns.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-[#7d8590]">
              Nenhum padr??o customizado. Os padr??es globais do AegisBot continuam ativos.
            </div>
          ) : (
            patterns.map((p) => (
              <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#30363d] ${SEV_COLOR[p.severity]}`}
                  >
                    {p.severity}
                  </span>
                  <span className="text-xs text-[#7d8590] bg-[#0d1117] px-2 py-0.5 rounded">
                    {p.pattern_type}
                  </span>
                  <span className="text-sm text-white font-mono">{p.pattern_value}</span>
                </div>
                <button
                  onClick={() => removePattern(p.id)}
                  className="text-[#7d8590] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ?????? Estat??sticas ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function StatsSection({ authFetch }: { authFetch: typeof window.fetch }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setStats(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const days = stats ? Object.keys(stats.alertsByDay).sort().slice(-14) : [];
  const maxAlerts = days.length
    ? Math.max(...days.map((d) => stats.alertsByDay[d]?.total ?? 0), 1)
    : 1;

  const SEV_COLOR: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  };
  const TYPE_LABEL: Record<string, string> = {
    disclosure: "Divulga????o",
    spam: "Spam",
    scam: "Golpe",
    custom: "Customizado",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold text-white">Estat??sticas</h1>
        <p className="text-[#7d8590] mt-1">Hist??rico de alertas e a????es dos ??ltimos 14 dias.</p>
      </header>

      {/* Gr??fico de barras ??? alertas por dia */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 p-6">
        <h3 className="font-semibold text-white mb-6">Alertas por Dia</h3>
        {loading ? (
          <div className="h-32 flex items-end gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-[#30363d] animate-pulse"
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        ) : days.length === 0 ? (
          <p className="text-sm text-[#7d8590] text-center py-8">
            Nenhum dado nos ??ltimos 14 dias.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {days.map((day) => {
              const total = stats.alertsByDay[day]?.total ?? 0;
              const height = Math.max((total / maxAlerts) * 100, 4);
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white bg-[#30363d] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {total} alertas
                    </div>
                    <div
                      className="w-full rounded-t bg-blue-500/70 hover:bg-blue-500 transition-colors"
                      style={{ height: `${height * 1.28}px` }}
                    />
                  </div>
                  <span className="text-[9px] text-[#7d8590] rotate-45 origin-left mt-1">
                    {day.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por severidade */}
        <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 p-6">
          <h3 className="font-semibold text-white mb-4">Por Severidade</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded bg-[#30363d] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {["critical", "high", "medium", "low"].map((sev) => {
                const count = stats?.bySeverity?.[sev] ?? 0;
                const total = Object.values(stats?.bySeverity ?? {}).reduce(
                  (a: number, b: any) => a + b,
                  0,
                ) as number;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={sev}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white capitalize">{sev}</span>
                      <span className="text-[#7d8590]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#30363d]">
                      <div
                        className={`h-2 rounded-full ${SEV_COLOR[sev]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Por tipo */}
        <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 p-6">
          <h3 className="font-semibold text-white mb-4">Por Tipo</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 rounded bg-[#30363d] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats?.byType ?? {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between py-2 border-b border-[#30363d] last:border-0"
                  >
                    <span className="text-sm text-white">{TYPE_LABEL[type] ?? type}</span>
                    <span className="text-sm font-bold text-[#7d8590]">{count as number}</span>
                  </div>
                ))}
              {Object.keys(stats?.byType ?? {}).length === 0 && (
                <p className="text-sm text-[#7d8590] text-center py-4">Nenhum dado dispon??vel.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ?????? Meu Servidor ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function ServerConfigSection({
  authFetch,
  guild,
}: {
  authFetch: typeof window.fetch;
  guild: Guild | null;
}) {
  const gId = guild?.id ?? null;
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    alert_log_channel_id: "",
    welcome_channel_id: "",
    welcome_message: "",
    auto_kick_on_critical: false,
    disclosure_detection_enabled: true,
    raid_threshold: "5",
    account_min_age_days: "7",
  });

  useEffect(() => {
    if (!gId) return;
    setLoading(true);
    authFetch(`/api/guild-config?guildId=${gId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.config) {
          setConfig(d.config);
          setForm((f) => ({
            ...f,
            alert_log_channel_id: d.config.alert_log_channel_id ?? "",
            welcome_channel_id: d.config.welcome_channel_id ?? "",
            welcome_message: d.config.welcome_message ?? "",
            auto_kick_on_critical: d.config.auto_kick_on_critical ?? false,
            disclosure_detection_enabled: d.config.disclosure_detection_enabled ?? true,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gId]);

  const save = async () => {
    if (!gId) return;
    setSaving(true);
    await authFetch("/api/guild-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId: gId, config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Sem servidor selecionado
  if (!guild) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in duration-500">
        <div className="p-5 rounded-full bg-[#161b22] border border-[#30363d] mb-5">
          <Settings className="h-10 w-10 text-[#7d8590]" />
        </div>
        <h2 className="text-xl font-bold text-white">Selecione um servidor</h2>
        <p className="text-[#7d8590] mt-2 max-w-sm">
          Clique no seletor no topo da sidebar para escolher qual servidor configurar.
        </p>
      </div>
    );
  }

  const Field = ({
    label,
    desc,
    children,
  }: {
    label: string;
    desc?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-[#30363d] last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-[#7d8590] mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {guild.icon ? (
            <img src={guild.icon} alt={guild.name} className="h-12 w-12 rounded-xl" />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-[#30363d] flex items-center justify-center text-lg font-bold text-white">
              {guild.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{guild.name}</h1>
            <p className="text-[#7d8590] text-sm mt-0.5">
              Configura????es do Aegis neste servidor.
            </p>
          </div>
        </div>
        <Button
          onClick={save}
          disabled={saving || loading}
          className="bg-[#1f883d] hover:bg-[#1a7a35] text-white border-none"
        >
          {saving ? "Salvando..." : saved ? "??? Salvo!" : "Salvar altera????es"}
        </Button>
      </header>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#161b22] border border-[#30363d] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 px-6">
            <h3 className="font-semibold text-white pt-5 pb-2 text-sm uppercase tracking-wider text-[#7d8590]">
              Canais
            </h3>
            <Field
              label="Canal de logs"
              desc="ID do canal onde o Aegis envia logs de modera????o e alertas."
            >
              <input
                value={form.alert_log_channel_id}
                onChange={(e) => setForm((f) => ({ ...f, alert_log_channel_id: e.target.value }))}
                placeholder="ID do canal"
                className="w-52 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </Field>
            <Field
              label="Canal de boas-vindas"
              desc="ID do canal onde o Aegis posta mensagens de boas-vindas p??blicas."
            >
              <input
                value={form.welcome_channel_id}
                onChange={(e) => setForm((f) => ({ ...f, welcome_channel_id: e.target.value }))}
                placeholder="ID do canal"
                className="w-52 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 px-6">
            <h3 className="font-semibold text-white pt-5 pb-2 text-sm uppercase tracking-wider text-[#7d8590]">
              Boas-vindas
            </h3>
            <Field
              label="Mensagem de boas-vindas"
              desc="Enviada por DM ao novo membro. Use {user} para o nome."
            >
              <textarea
                value={form.welcome_message}
                onChange={(e) => setForm((f) => ({ ...f, welcome_message: e.target.value }))}
                placeholder="Bem-vindo ao servidor, {user}! ..."
                rows={3}
                className="w-72 px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 px-6">
            <h3 className="font-semibold text-white pt-5 pb-2 text-sm uppercase tracking-wider text-[#7d8590]">
              Prote????o
            </h3>
            <Field
              label="Detec????o silenciosa"
              desc="Analisa mensagens em background e registra alertas sem resposta p??blica."
            >
              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    disclosure_detection_enabled: !f.disclosure_detection_enabled,
                  }))
                }
                className="text-[#7d8590] hover:text-white transition-colors"
              >
                {form.disclosure_detection_enabled ? (
                  <ToggleRight className="h-7 w-7 text-green-500" />
                ) : (
                  <ToggleLeft className="h-7 w-7" />
                )}
              </button>
            </Field>
            <Field
              label="A????o autom??tica em cr??ticos"
              desc="Reage e loga automaticamente quando uma amea??a cr??tica ?? detectada."
            >
              <button
                onClick={() =>
                  setForm((f) => ({ ...f, auto_kick_on_critical: !f.auto_kick_on_critical }))
                }
                className="text-[#7d8590] hover:text-white transition-colors"
              >
                {form.auto_kick_on_critical ? (
                  <ToggleRight className="h-7 w-7 text-green-500" />
                ) : (
                  <ToggleLeft className="h-7 w-7" />
                )}
              </button>
            </Field>
            <Field
              label="Threshold de raid"
              desc="N??mero de entradas simult??neas para ativar o anti-raid autom??tico."
            >
              <input
                type="number"
                min="2"
                max="50"
                value={form.raid_threshold}
                onChange={(e) => setForm((f) => ({ ...f, raid_threshold: e.target.value }))}
                className="w-20 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white text-center focus:outline-none focus:border-blue-500"
              />
            </Field>
            <Field
              label="Idade m??nima da conta (dias)"
              desc="Contas mais novas que este valor s??o monitoradas ao enviar links."
            >
              <input
                type="number"
                min="0"
                max="365"
                value={form.account_min_age_days}
                onChange={(e) => setForm((f) => ({ ...f, account_min_age_days: e.target.value }))}
                className="w-20 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white text-center focus:outline-none focus:border-blue-500"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 flex gap-4">
            <span className="text-2xl shrink-0 mt-0.5">????</span>
            <div>
              <p className="text-sm font-medium text-white">Benef??cios Premium</p>
              <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">
                Desbloqueie funcionalidades inteligentes exclusivas para seu servidor:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-[#8b949e]">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">???</span>
                  <span>
                    <strong className="text-[#e6edf3]">Anti-raid inteligente</strong> com machine
                    learning ??? detecta padr??es de ataque em tempo real
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">???</span>
                  <span>
                    <strong className="text-[#e6edf3]">Relat??rios semanais</strong> autom??ticos
                    com an??lises de seguran??a
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">???</span>
                  <span>
                    <strong className="text-[#e6edf3]">Whitelist avan??ada</strong> com dom??nios
                    regex e multi-n??vel
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">???</span>
                  <span>
                    <strong className="text-[#e6edf3]">Comandos customizados</strong> com a????es
                    automatizadas (AutoMod AI)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">???</span>
                  <span>
                    <strong className="text-[#e6edf3]">Suporte priorit??rio</strong> ??? configure
                    regras exclusivas com nossa equipe
                  </span>
                </li>
              </ul>
              <p className="text-xs text-[#e6edf3] mt-3 font-medium">
                Em breve: sistema de assinatura para desbloquear todos os recursos premium.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
