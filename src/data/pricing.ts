export interface PricingPlan {
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  cta: string;
  features: string[];
}

export const PLANS: PricingPlan[] = [
  {
    name: "Free",
    tagline: "Proteção comunitária essencial",
    monthly: 0,
    yearly: 0,
    cta: "Adicionar ao Discord",
    features: [
      "Integração Lotters Radar (Básico)",
      "Comandos de Moderação (/purge, /painel)",
      "Anti-Raid Baseado em Idade de Conta",
      "Blacklist Global Compartilhada",
      "Suporte via Servidor de Suporte",
    ],
  },
  {
    name: "Premium",
    tagline: "O poder total do Aegis no seu servidor",
    monthly: 19.9,
    yearly: 199,
    highlight: true,
    cta: "Garantir Proteção",
    features: [
      "Tudo do Plano Free",
      "IA Vision: OCR para detecção em imagens",
      "Safe Browsing: Análise de links em tempo real",
      "Fila de Moderação (Queue) no Dashboard",
      "Blacklist & Whitelist Customizáveis",
      "Logs Avançados de Segurança",
      "Filtros de Anti-Spam Inteligentes",
    ],
  },
  {
    name: "Partner",
    tagline: "Ecossistema completo para grandes redes",
    monthly: 49.9,
    yearly: 499,
    cta: "Seja um Parceiro",
    features: [
      "Tudo do Plano Premium",
      "Whitelist Global ArxDevs",
      "API Access para integrações customizadas",
      "Painel Multi-servidor Unificado",
      "Suporte Prioritário 24/7",
      "Gerente de Contas Dedicado",
      "Personalização de Mensagens (Vanish)",
    ],
  },
];
