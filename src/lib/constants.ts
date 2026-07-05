const DISCORD_CLIENT_ID = "1485085619280679145";
const DISCORD_REDIRECT_URI = encodeURIComponent("https://aegis.arxdevs.xyz/auth/callback");
const ARX_CALLBACK_URI = encodeURIComponent("https://aegis.arxdevs.xyz/auth/arx-callback");

export const SITE_URLS = {
  discordInvite: "https://discord.gg/arxdevs",
  supportServer: "https://discord.gg/gr93e7rQc4",
  botInvite: "https://discord.com/oauth2/authorize?client_id=1485085619280679145&permissions=8&scope=bot%20applications.commands",
  // OAuth2 login — scope=identify+guilds para autenticar o usuário (não adicionar bot)
  discordLogin: `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${DISCORD_REDIRECT_URI}&scope=identify%20guilds`,
  // ARX centralized auth
  arxLogin: `https://auth.arxdevs.xyz/?redirectUri=${ARX_CALLBACK_URI}&state=/dashboard`,
  statusPage: "https://status.arxdevs.xyz",
  documentation: "https://docs.arxdevs.xyz",
  institutional: "https://arxdevs.xyz",
  terms: "https://docs.arxdevs.xyz/legal/terms",
  privacy: "https://docs.arxdevs.xyz/legal/privacy",
} as const;
