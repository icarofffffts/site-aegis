export type CommandCategory =
  | "Moderação"
  | "Anti-Raid"
  | "Configuração"
  | "Logs"
  | "Utilidade"
  | "Segurança";

export interface BotCommand {
  name: string;
  description: string;
  syntax: string;
  permission: string;
  category: CommandCategory;
  platforms: ("Discord" | "Telegram" | "Slack")[];
  new?: boolean;
}

export const COMMAND_CATEGORIES: CommandCategory[] = [
  "Moderação",
  "Anti-Raid",
  "Segurança",
  "Configuração",
  "Logs",
  "Utilidade",
];

export const COMMANDS: BotCommand[] = [
  // ── Moderação ──────────────────────────────────────────────────
  {
    name: "ban",
    description: "Bane um usuário do servidor com motivo registrado no log de ações.",
    syntax: "/ban <usuário> [motivo] [deletar_mensagens]",
    permission: "Banir Membros",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "kick",
    description: "Expulsa um usuário do servidor com motivo registrado.",
    syntax: "/kick <usuário> [motivo]",
    permission: "Expulsar Membros",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "mute",
    description: "Silencia um usuário por um período determinado.",
    syntax: "/mute <usuário> <duração> [motivo]",
    permission: "Moderar Membros",
    category: "Moderação",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "warn",
    description: "Aplica um aviso formal a um usuário, registrado no banco de dados.",
    syntax: "/warn <usuário> <motivo> [severidade]",
    permission: "Moderar Membros",
    category: "Moderação",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "purge",
    description: "Apaga mensagens em massa de um canal ou de um usuário específico.",
    syntax: "/purge <quantidade> [usuário]",
    permission: "Gerenciar Mensagens",
    category: "Moderação",
    platforms: ["Discord"],
  },
  {
    name: "unban",
    description: "Remove o banimento de um usuário pelo ID do Discord.",
    syntax: "/unban <id> [motivo]",
    permission: "Banir Membros",
    category: "Moderação",
    platforms: ["Discord"],
    new: true,
  },

  // ── Anti-Raid ──────────────────────────────────────────────────
  {
    name: "lockdown",
    description: "Ativa o modo lockdown: bloqueia envio de mensagens em todos os canais.",
    syntax: "/lockdown [motivo] [duração]",
    permission: "Gerenciar Servidor",
    category: "Anti-Raid",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "blacklist",
    description: "Gerencia os termos e padrões bloqueados dinamicamente pelo detector.",
    syntax: "/blacklist <add|remove|list> <termo>",
    permission: "Administrador",
    category: "Anti-Raid",
    platforms: ["Discord"],
  },
  {
    name: "whitelist",
    description: "Isenta usuários, cargos ou domínios dos filtros de segurança.",
    syntax: "/whitelist <add|remove|list> <valor> <tipo>",
    permission: "Administrador",
    category: "Anti-Raid",
    platforms: ["Discord"],
  },
  {
    name: "raidmode",
    description: "Ativa/desativa o modo anti-raid manual com threshold customizado.",
    syntax: "/raidmode <on|off> [threshold]",
    permission: "Gerenciar Servidor",
    category: "Anti-Raid",
    platforms: ["Discord"],
    new: true,
  },

  // ── Segurança ──────────────────────────────────────────────────
  {
    name: "consultar",
    description: "Consulta avisos e reputação global de um usuário no ecossistema ArxDevs.",
    syntax: "/consultar <usuário|id>",
    permission: "Moderar Membros",
    category: "Segurança",
    platforms: ["Discord"],
  },
  {
    name: "scan",
    description: "Testa o sistema de OCR em uma imagem sem punir o autor.",
    syntax: "/scan <imagem>",
    permission: "Gerenciar Servidor",
    category: "Segurança",
    platforms: ["Discord"],
  },
  {
    name: "alerta",
    description: "Cria manualmente um alerta para um usuário no banco de dados ArxDevs.",
    syntax: "/alerta <usuário> <tipo> <severidade> <motivo>",
    permission: "Gerenciar Servidor",
    category: "Segurança",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "historico",
    description: "Exibe o histórico completo de ações tomadas contra um usuário.",
    syntax: "/historico <usuário|id>",
    permission: "Moderar Membros",
    category: "Segurança",
    platforms: ["Discord"],
    new: true,
  },

  // ── Configuração ───────────────────────────────────────────────
  {
    name: "admin",
    description: "Abre o painel de controle interativo completo do Aegis.",
    syntax: "/admin",
    permission: "Gerenciar Servidor",
    category: "Configuração",
    platforms: ["Discord"],
  },
  {
    name: "config log",
    description: "Define o canal onde o Aegis enviará logs de moderação.",
    syntax: "/config log <canal>",
    permission: "Gerenciar Servidor",
    category: "Configuração",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "config welcome",
    description: "Configura a mensagem de boas-vindas enviada por DM a novos membros.",
    syntax: "/config welcome <mensagem>",
    permission: "Gerenciar Servidor",
    category: "Configuração",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "config threshold",
    description: "Ajusta o limite de entradas simultâneas para ativar o anti-raid.",
    syntax: "/config threshold <número>",
    permission: "Administrador",
    category: "Configuração",
    platforms: ["Discord"],
    new: true,
  },

  // ── Logs ───────────────────────────────────────────────────────
  {
    name: "painel",
    description: "Exibe o status técnico do bot: uptime, latência e saúde das APIs.",
    syntax: "/painel",
    permission: "Gerenciar Servidor",
    category: "Logs",
    platforms: ["Discord"],
  },
  {
    name: "logs",
    description: "Exibe os últimos N logs de moderação do servidor.",
    syntax: "/logs [quantidade] [usuário]",
    permission: "Moderar Membros",
    category: "Logs",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "stats",
    description: "Mostra estatísticas de moderação do servidor: bans, warns, ações por dia.",
    syntax: "/stats [período]",
    permission: "Moderar Membros",
    category: "Logs",
    platforms: ["Discord"],
    new: true,
  },

  // ── Utilidade ──────────────────────────────────────────────────
  {
    name: "ping",
    description: "Mostra a latência atual entre o bot e o Discord.",
    syntax: "/ping",
    permission: "Nenhuma",
    category: "Utilidade",
    platforms: ["Discord"],
  },
  {
    name: "userinfo",
    description: "Exibe informações detalhadas de um usuário: conta, cargos e histórico.",
    syntax: "/userinfo [usuário]",
    permission: "Nenhuma",
    category: "Utilidade",
    platforms: ["Discord"],
    new: true,
  },
  {
    name: "serverinfo",
    description: "Exibe informações do servidor: membros, canais, cargos e data de criação.",
    syntax: "/serverinfo",
    permission: "Nenhuma",
    category: "Utilidade",
    platforms: ["Discord"],
    new: true,
  },
];
