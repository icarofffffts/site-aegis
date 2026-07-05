import { useEffect, useState } from "react";
import { Palette, Eye, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandingEffect } from "@/hooks/use-branding";
import { setStoredBranding } from "@/lib/branding-store";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
}

interface BrandingData {
  is_white_label: boolean;
  hide_branding: boolean;
  brand_name: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  custom_css: string | null;
  bot_prefix: string | null;
}

const DEFAULT_BRANDING: BrandingData = {
  is_white_label: false,
  hide_branding: false,
  brand_name: null,
  logo_url: null,
  banner_url: null,
  primary_color: null,
  secondary_color: null,
  accent_color: null,
  custom_css: null,
  bot_prefix: null,
};

const PRESET_COLORS = [
  { label: "Esmeralda", primary: "#1f883d", secondary: "#1f6feb", accent: "#d2a8ff" },
  { label: "Royal", primary: "#6e40c9", secondary: "#1f6feb", accent: "#f0883e" },
  { label: "Crimson", primary: "#da3633", secondary: "#1f6feb", accent: "#d2a8ff" },
  { label: "Ocean", primary: "#1f6feb", secondary: "#6e40c9", accent: "#3fb950" },
  { label: "Gold", primary: "#bb8009", secondary: "#1f6feb", accent: "#d2a8ff" },
  { label: "Neon", primary: "#00ff88", secondary: "#00b4d8", accent: "#ff00ff" },
];

export function BrandingSection({
  authFetch,
  guild,
}: {
  authFetch: typeof window.fetch;
  guild: Guild | null;
}) {
  const gId = guild?.id ?? null;
  const [branding, setBranding] = useState<BrandingData>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "preview">("branding");

  useBrandingEffect(branding.is_white_label ? branding : null);

  useEffect(() => {
    setStoredBranding(
      branding.is_white_label
        ? {
            brandName: branding.brand_name,
            logoUrl: branding.logo_url,
            hideBranding: branding.hide_branding,
          }
        : null,
    );
  }, [branding.is_white_label, branding.brand_name, branding.logo_url, branding.hide_branding]);

  useEffect(() => {
    if (!gId) return;
    setLoading(true);
    authFetch(`/api/guild-branding?guildId=${gId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.branding) {
          setBranding({ ...DEFAULT_BRANDING, ...d.branding });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gId]);

  const save = async () => {
    if (!gId) return;
    setSaving(true);
    await authFetch("/api/guild-branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId: gId, branding }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const reset = async () => {
    setBranding(DEFAULT_BRANDING);
    if (!gId) return;
    setSaving(true);
    await authFetch("/api/guild-branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId: gId, branding: DEFAULT_BRANDING }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const applyPreset = (colors: (typeof PRESET_COLORS)[number]) => {
    setBranding((prev) => ({
      ...prev,
      primary_color: colors.primary,
      secondary_color: colors.secondary,
      accent_color: colors.accent,
    }));
  };

  if (!guild) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in duration-500">
        <div className="p-5 rounded-full bg-[#161b22] border border-[#30363d] mb-5">
          <Palette className="h-10 w-10 text-[#7d8590]" />
        </div>
        <h2 className="text-xl font-bold text-white">Selecione um servidor</h2>
        <p className="text-[#7d8590] mt-2 max-w-sm">
          Clique no seletor no topo da sidebar para personalizar a identidade visual do Aegis.
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

  const activeColors = {
    primary: branding.primary_color || "#1f883d",
    secondary: branding.secondary_color || "#1f6feb",
    accent: branding.accent_color || "#d2a8ff",
  };

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
            <h1 className="text-2xl font-bold text-white">White-Label & Customização</h1>
            <p className="text-[#7d8590] text-sm mt-0.5">
              Personalize a identidade visual do Aegis para {guild.name}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={reset}
            variant="outline"
            className="border-[#30363d] bg-[#161b22] text-[#7d8590] hover:text-white hover:bg-[#1c2128]"
            disabled={saving || loading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Resetar
          </Button>
          <Button
            onClick={save}
            disabled={saving || loading}
            className="bg-[#1f883d] hover:bg-[#1a7a35] text-white border-none"
          >
            {saving ? (
              "Salvando..."
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Salvo!
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#30363d]">
        <button
          onClick={() => setActiveTab("branding")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "branding"
              ? "border-[#1f6feb] text-white"
              : "border-transparent text-[#7d8590] hover:text-white"
          }`}
        >
          <Palette className="h-4 w-4 inline mr-1.5" />
          Branding
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "preview"
              ? "border-[#1f6feb] text-white"
              : "border-transparent text-[#7d8590] hover:text-white"
          }`}
        >
          <Eye className="h-4 w-4 inline mr-1.5" />
          Prévia
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#161b22] border border-[#30363d] animate-pulse"
            />
          ))}
        </div>
      ) : activeTab === "branding" ? (
        <>
          {/* White-Label Toggle */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 px-6">
            <h3 className="font-semibold text-white pt-5 pb-2 text-sm uppercase tracking-wider text-[#7d8590]">
              White-Label
            </h3>
            <Field
              label="Modo White-Label"
              desc="Substitui a marca Aegis/ARX DEVS pela identidade personalizada do servidor."
            >
              <button
                onClick={() =>
                  setBranding((f) => ({
                    ...f,
                    is_white_label: !f.is_white_label,
                  }))
                }
                className="text-[#7d8590] hover:text-white transition-colors"
              >
                {branding.is_white_label ? (
                  <span className="text-green-500 text-sm font-semibold flex items-center gap-1">
                    <span className="h-7 w-7 block">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                    Ativo
                  </span>
                ) : (
                  <span className="text-[#7d8590] text-sm">Inativo</span>
                )}
              </button>
            </Field>
            <Field
              label="Ocultar 'by ARX DEVS'"
              desc="Remove o texto 'by ARX DEVS' do logo e rodapé quando white-label estiver ativo."
            >
              <button
                onClick={() =>
                  setBranding((f) => ({
                    ...f,
                    hide_branding: !f.hide_branding,
                  }))
                }
                className="text-[#7d8590] hover:text-white transition-colors"
              >
                {branding.hide_branding ? (
                  <span className="text-green-500 text-sm font-semibold">Oculto</span>
                ) : (
                  <span className="text-[#7d8590] text-sm">Visível</span>
                )}
              </button>
            </Field>
            <Field
              label="Nome personalizado"
              desc="Nome que substitui 'Aegis' no dashboard e notificações."
            >
              <input
                value={branding.brand_name ?? ""}
                onChange={(e) => setBranding((f) => ({ ...f, brand_name: e.target.value || null }))}
                placeholder={guild.name}
                className="w-52 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </Field>
          </div>

          {/* Logo & Banner */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 px-6">
            <h3 className="font-semibold text-white pt-5 pb-2 text-sm uppercase tracking-wider text-[#7d8590]">
              Logo & Banner
            </h3>
            <Field
              label="URL do Logo"
              desc="URL pública de uma imagem para substituir o logo do Aegis."
            >
              <input
                value={branding.logo_url ?? ""}
                onChange={(e) => setBranding((f) => ({ ...f, logo_url: e.target.value || null }))}
                placeholder="https://..."
                className="w-64 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </Field>
            {branding.logo_url && (
              <div className="pb-4">
                <p className="text-[10px] text-[#7d8590] mb-2">Prévia:</p>
                <img
                  src={branding.logo_url}
                  alt="Logo preview"
                  className="h-12 w-12 rounded-lg object-contain bg-[#0d1117] border border-[#30363d]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <Field
              label="URL do Banner"
              desc="URL pública de uma imagem de banner para o dashboard."
            >
              <input
                value={branding.banner_url ?? ""}
                onChange={(e) => setBranding((f) => ({ ...f, banner_url: e.target.value || null }))}
                placeholder="https://..."
                className="w-64 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </Field>
          </div>

          {/* Colors */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 px-6">
            <h3 className="font-semibold text-white pt-5 pb-2 text-sm uppercase tracking-wider text-[#7d8590]">
              Cores
            </h3>

            {/* Presets */}
            <div className="pt-2 pb-4 border-b border-[#30363d]">
              <p className="text-[10px] text-[#7d8590] uppercase font-bold mb-3">
                Paletas pré-definidas
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#30363d] bg-[#0d1117] hover:border-[#8b949e] transition-colors"
                  >
                    <div className="flex -space-x-1">
                      <div
                        className="h-4 w-4 rounded-full border border-[#30363d]"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="h-4 w-4 rounded-full border border-[#30363d]"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div
                        className="h-4 w-4 rounded-full border border-[#30363d]"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-xs text-white">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Cor primária (hex)" desc="Usada em botões e destaques principais.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeColors.primary}
                  onChange={(e) => setBranding((f) => ({ ...f, primary_color: e.target.value }))}
                  className="h-8 w-8 rounded cursor-pointer border border-[#30363d] bg-transparent"
                />
                <input
                  value={branding.primary_color ?? ""}
                  onChange={(e) =>
                    setBranding((f) => ({ ...f, primary_color: e.target.value || null }))
                  }
                  placeholder="#1f883d"
                  className="w-28 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </Field>
            <Field label="Cor secundária (hex)" desc="Usada em links e elementos secundários.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeColors.secondary}
                  onChange={(e) => setBranding((f) => ({ ...f, secondary_color: e.target.value }))}
                  className="h-8 w-8 rounded cursor-pointer border border-[#30363d] bg-transparent"
                />
                <input
                  value={branding.secondary_color ?? ""}
                  onChange={(e) =>
                    setBranding((f) => ({ ...f, secondary_color: e.target.value || null }))
                  }
                  placeholder="#1f6feb"
                  className="w-28 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </Field>
            <Field label="Cor de destaque (hex)" desc="Usada em badges e elementos de realce.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activeColors.accent}
                  onChange={(e) => setBranding((f) => ({ ...f, accent_color: e.target.value }))}
                  className="h-8 w-8 rounded cursor-pointer border border-[#30363d] bg-transparent"
                />
                <input
                  value={branding.accent_color ?? ""}
                  onChange={(e) =>
                    setBranding((f) => ({ ...f, accent_color: e.target.value || null }))
                  }
                  placeholder="#d2a8ff"
                  className="w-28 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </Field>
          </div>

          {/* Advanced */}
          <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 px-6">
            <h3 className="font-semibold text-white pt-5 pb-2 text-sm uppercase tracking-wider text-[#7d8590]">
              Avançado
            </h3>
            <Field
              label="CSS Personalizado"
              desc="CSS customizado injetado no dashboard do servidor (use com cuidado)."
            >
              <textarea
                value={branding.custom_css ?? ""}
                onChange={(e) => setBranding((f) => ({ ...f, custom_css: e.target.value || null }))}
                placeholder=":root { --custom-bg: #000; }"
                rows={4}
                className="w-72 px-3 py-2 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white font-mono focus:outline-none focus:border-blue-500 resize-none"
              />
            </Field>
            <Field
              label="Prefixo do bot"
              desc="Prefixo customizado para comandos do bot (ex: !, ?)."
            >
              <input
                value={branding.bot_prefix ?? ""}
                onChange={(e) => setBranding((f) => ({ ...f, bot_prefix: e.target.value || null }))}
                placeholder="a!"
                maxLength={5}
                className="w-20 px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-sm text-white text-center font-mono focus:outline-none focus:border-blue-500"
              />
            </Field>
          </div>
        </>
      ) : (
        /* Preview Tab */
        <div className="rounded-xl border border-[#30363d] bg-[#161b22]/50 p-8">
          <h3 className="font-semibold text-white mb-6 text-center">Prévia da Identidade Visual</h3>

          <div
            className="max-w-md mx-auto rounded-xl border p-6 space-y-4"
            style={{
              borderColor: activeColors.secondary + "40",
              background: `linear-gradient(135deg, ${activeColors.primary}15, ${activeColors.secondary}10)`,
            }}
          >
            {/* Logo + nome preview */}
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-lg border"
                style={{
                  borderColor: activeColors.secondary + "60",
                  backgroundColor: activeColors.primary + "20",
                }}
              >
                {branding.logo_url ? (
                  <img
                    src={branding.logo_url}
                    alt="Logo"
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-lg font-bold" style={{ color: activeColors.primary }}>
                    {(branding.brand_name || guild.name)[0]}
                  </span>
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <span
                  className="font-display text-xl font-bold tracking-tight"
                  style={{ color: activeColors.primary }}
                >
                  {branding.brand_name || guild.name}
                </span>
                {!branding.hide_branding && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8590]">
                    by ARX DEVS
                  </span>
                )}
              </div>
            </div>

            {/* Botão preview */}
            <button
              className="w-full py-2 rounded-lg text-white font-semibold text-sm transition-all"
              style={{
                backgroundColor: activeColors.primary,
                boxShadow: `0 0 20px ${activeColors.primary}40`,
              }}
            >
              {branding.brand_name || "Aegis"} — Botão Principal
            </button>

            {/* Link preview */}
            <p className="text-xs text-center">
              <span style={{ color: activeColors.secondary }}>Link de exemplo</span>{" "}
              <span className="text-[#7d8590]">•</span>{" "}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: activeColors.accent + "20",
                  color: activeColors.accent,
                }}
              >
                Badge
              </span>
            </p>

            {/* Banner preview */}
            {branding.banner_url && (
              <img
                src={branding.banner_url}
                alt="Banner preview"
                className="w-full h-24 object-cover rounded-lg border border-[#30363d]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>

          {/* Resumo das cores */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-[10px] text-[#7d8590] uppercase font-bold mb-3">Esquema de Cores</p>
            <div className="flex gap-4 justify-center">
              {[
                { label: "Primária", color: activeColors.primary },
                { label: "Secundária", color: activeColors.secondary },
                { label: "Destaque", color: activeColors.accent },
              ].map((c) => (
                <div key={c.label} className="text-center">
                  <div
                    className="h-10 w-10 rounded-full border-2 border-[#30363d] mx-auto mb-1"
                    style={{ backgroundColor: c.color }}
                  />
                  <p className="text-[10px] text-[#7d8590]">{c.label}</p>
                  <p className="text-[9px] text-[#484f58] font-mono">{c.color}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 flex gap-4">
        <span className="text-2xl shrink-0 mt-0.5">🎨</span>
        <div>
          <p className="text-sm font-medium text-white">Sobre White-Label</p>
          <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">
            O modo White-Label permite que você substitua toda a identidade visual do Aegis pela
            marca do seu servidor ou comunidade. Ideal para servidores empresariais, parceiros e
            comunidades que desejam uma experiência totalmente personalizada.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-[#8b949e]">
            <li className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              <span>Logo, nome e banner personalizados</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              <span>Esquema de cores completo (3 cores)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              <span>CSS customizado para ajustes finos</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              <span>As alterações refletem em tempo real no dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
