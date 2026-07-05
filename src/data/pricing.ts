export interface PricingPlan {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  cta: string;
  features: string[];
  limitations?: string[];
  badge?: string;
}

export const PLANS: PricingPlan[] = [
  {
    name: "Free",
    tagline: "Protecao essencial, sempre gratis",
    monthly: 0,
    yearly: 0,
    cta: "Adicionar ao Discord",
    features: [
      "Protecao basica anti-raid",
      "Blacklist com ate 20 termos",
      "Whitelist com ate 10 dominios",
      "Logs de moderacao",
      "Comandos basicos (/ban, /kick, /mute, /warn)",
      "Ate 1 servidor",
      "Suporte via servidor de suporte",
    ],
    limitations: [
      "Alertas em tempo real",
      "Relatorios semanais",
      "AutoMod AI",
      "AntiRaid com ML",
      "Suporte prioritario",
    ],
    badge: "Com anuncios",
  },
  {
    name: "Premium",
    tagline: "O poder total do Aegis no seu servidor",
    monthly: 19.9,
    yearly: 199,
    highlight: true,
    cta: "Assinar Agora",
    features: [
      "Tudo do plano Free (sem anuncios)",
      "Blacklist ILIMITADA",
      "Whitelist ILIMITADA",
      "Alertas em tempo real",
      "Relatorios semanais automaticos",
      "AutoMod AI (moderacao inteligente)",
      "AntiRaid com Machine Learning",
      "Dashboard completa desbloqueada",
      "Suporte prioritario via Discord",
      "Multiplos servidores",
    ],
    badge: "Sem anuncios",
  },
  {
    name: "Partner",
    tagline: "Ecossistema completo para grandes redes",
    monthly: 49.9,
    yearly: 499,
    cta: "Assinar Agora",
    features: [
      "Tudo do Plano Premium",
      "Whitelist Global ArxDevs",
      "API Access para integracoes customizadas",
      "Painel Multi-servidor Unificado",
      "Suporte Prioritario 24/7",
      "Gerente de Contas Dedicado",
      "Personalizacao de Mensagens (Vanish)",
    ],
  },
];
