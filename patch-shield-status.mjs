// Script que injeta o status ARX no dist/index.js do Shield Bot
import { readFileSync, writeFileSync } from 'node:fs';

const file = '/var/www/shield-radar/bot/dist/index.js';
const content = readFileSync(file, 'utf-8');

// Verifica se já foi patchado
if (content.includes('ARX_STATUS_PATCH')) {
  console.log('Já patchado.');
  process.exit(0);
}

// Código a injetar após setupWeeklyCron()
const patch = `
// ARX_STATUS_PATCH
const ARX_GUILD_ID_PATCH = '1498329855690014861';
const ARX_STATUS_CH_ID_PATCH = '1499642379185946737';
let arxStatusMsgId = null;

async function updateArxStatus() {
  try {
    const guild = c.guilds.cache.get(ARX_GUILD_ID_PATCH);
    if (!guild) return;
    const channel = guild.channels.cache.get(ARX_STATUS_CH_ID_PATCH);
    if (!channel || !channel.isTextBased()) return;

    const health = await getSiteStats();
    const stats = await getStats();
    const now = Math.floor(Date.now() / 1000);
    const allOk = health.online;

    const { EmbedBuilder } = await import('discord.js');
    const embed = new EmbedBuilder()
      .setColor(allOk ? 0xef4444 : 0x4b5563)
      .setAuthor({ name: 'Shield — Monitor de Status', iconURL: 'https://shield.arxdevs.xyz/logo.png', url: 'https://shield.arxdevs.xyz' })
      .setTitle(allOk ? '🟢  Todos os sistemas operacionais' : '🔴  Degradação detectada')
      .setDescription(allOk ? '> Todos os sistemas operando normalmente.' : '> ⚠️ Degradação detectada em um ou mais serviços.')
      .addFields(
        { name: '🌐  Site', value: health.online ? '🟢 Online' : '🔴 Offline', inline: true },
        { name: '🤖  Bot', value: '🟢 Online', inline: true },
        { name: '🗄️  Banco de Dados', value: '🟢 Conectado', inline: true },
        { name: '📊  Denúncias aprovadas', value: \`\\\`\${(stats?.approved_reports ?? 0).toLocaleString('pt-BR')}\\\`\`, inline: true },
        { name: '👤  Usuários mapeados', value: \`\\\`\${(stats?.reported_users ?? 0).toLocaleString('pt-BR')}\\\`\`, inline: true },
        { name: '\\u200b', value: \`🕐 Última verificação: <t:\${now}:R>\`, inline: false },
      )
      .setFooter({ text: 'ArxDevs • Shield  •  Atualiza a cada 5 minutos' })
      .setTimestamp();

    if (arxStatusMsgId) {
      try {
        const msg = await channel.messages.fetch(arxStatusMsgId);
        await msg.edit({ embeds: [embed] });
        return;
      } catch { arxStatusMsgId = null; }
    }
    const msg = await channel.send({ embeds: [embed] });
    arxStatusMsgId = msg.id;
    console.log('[Shield] Status ARX postado no #status');
  } catch (e) {
    console.error('[Shield] Erro status ARX:', e.message);
  }
}

setTimeout(() => updateArxStatus(), 8000);
setInterval(() => updateArxStatus(), 5 * 60 * 1000);
`;

// Injeta após "setupWeeklyCron();"
const target = 'setupWeeklyCron();';
if (!content.includes(target)) {
  console.error('Target não encontrado no arquivo.');
  process.exit(1);
}

const patched = content.replace(target, target + patch);
writeFileSync(file, patched, 'utf-8');
console.log('Patch aplicado com sucesso!');
