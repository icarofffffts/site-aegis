export type CommandCategory =
  | "Moderação"
  | "Anti-Raid"
  | "Configuração"
  | "Logs"
  | "Utilidade";

export interface BotCommand {
  name: string;
  description: string;
  syntax: string;
  permission: string;
  category: CommandCategory;
  platforms: ("Discord" | "Telegram" | "Slack")[];
}

export const COMMAND_CATEGORIES: CommandCategory[] = [
  "Moderação",
  "Anti-Raid",
  "Configuração",
  "Logs",
  "Utilidade",
];

export const COMMANDS: BotCommand[] = [
  {
    name: "ban",
    description: "Bane um membro do servidor permanentemente.",
    syntax: "/ban <usuário> [motivo]",
    permission: "Banir Membros",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "kick",
    description: "Expulsa um membro do servidor.",
    syntax: "/kick <usuário> [motivo]",
    permission: "Expulsar Membros",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "mute",
    description: "Silencia um membro por um tempo determinado.",
    syntax: "/mute <usuário> <duração> [motivo]",
    permission: "Moderar Membros",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "warn",
    description: "Aplica uma advertência registrada ao membro.",
    syntax: "/warn <usuário> <motivo>",
    permission: "Moderar Membros",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "warnings",
    description: "Lista todas as advertências de um membro.",
    syntax: "/warnings <usuário>",
    permission: "Moderar Membros",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "clear",
    description: "Apaga uma quantidade de mensagens do canal atual.",
    syntax: "/clear <quantidade>",
    permission: "Gerenciar Mensagens",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "antiraid",
    description: "Ativa ou desativa o sistema de anti-raid em tempo real.",
    syntax: "/antiraid <on|off> [nível]",
    permission: "Administrador",
    category: "Anti-Raid",
    platforms: ["Discord"],
  },
  {
    name: "lockdown",
    description: "Tranca todos os canais durante um ataque.",
    syntax: "/lockdown [duração]",
    permission: "Administrador",
    category: "Anti-Raid",
    platforms: ["Discord"],
  },
  {
    name: "verify",
    description: "Configura a verificação obrigatória para novos membros.",
    syntax: "/verify setup",
    permission: "Administrador",
    category: "Anti-Raid",
    platforms: ["Discord"],
  },
  {
    name: "automod",
    description: "Configura filtros automáticos contra spam, links e palavrões.",
    syntax: "/automod <regra> <ação>",
    permission: "Administrador",
    category: "Configuração",
    platforms: ["Discord"],
  },
  {
    name: "logchannel",
    description: "Define o canal de logs do servidor.",
    syntax: "/logchannel <canal>",
    permission: "Administrador",
    category: "Configuração",
    platforms: ["Discord"],
  },
  {
    name: "modlog",
    description: "Mostra o histórico recente de ações de moderação.",
    syntax: "/modlog [usuário]",
    permission: "Moderar Membros",
    category: "Logs",
    platforms: ["Discord"],
  },
  {
    name: "userinfo",
    description: "Mostra informações detalhadas de um usuário.",
    syntax: "/userinfo [usuário]",
    permission: "Nenhuma",
    category: "Utilidade",
    platforms: ["Discord"],
  },
  {
    name: "serverinfo",
    description: "Mostra informações e estatísticas do servidor.",
    syntax: "/serverinfo",
    permission: "Nenhuma",
    category: "Utilidade",
    platforms: ["Discord"],
  },
  {
    name: "ping",
    description: "Mostra a latência atual do bot.",
    syntax: "/ping",
    permission: "Nenhuma",
    category: "Utilidade",
    platforms: ["Discord"],
  },
];
