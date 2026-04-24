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
    tagline: "Para começar a proteger seu servidor",
    monthly: 0,
    yearly: 0,
    cta: "Adicionar grátis",
    features: [
      "Comandos essenciais de moderação",
      "Anti-raid básico",
      "Logs por 7 dias",
      "Auto-mod com 3 regras",
      "Suporte na comunidade",
    ],
  },
  {
    name: "Premium",
    tagline: "Proteção completa para comunidades sérias",
    monthly: 4.99,
    yearly: 49.9,
    highlight: true,
    cta: "Assinar Premium",
    features: [
      "Tudo do Free",
      "Anti-raid avançado com IA",
      "Logs ilimitados (90 dias)",
      "Auto-mod com regras ilimitadas",
      "Verificação de membros (captcha)",
      "Sistema de tickets",
      "Suporte prioritário",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Para redes e comunidades de larga escala",
    monthly: 19.99,
    yearly: 199,
    cta: "Falar com vendas",
    features: [
      "Tudo do Premium",
      "Multi-servidor centralizado",
      "Logs ilimitados (1 ano)",
      "SLA de 99.9% garantido",
      "Onboarding dedicado",
      "Integrações personalizadas",
      "Suporte 24/7 com gerente",
    ],
  },
];
