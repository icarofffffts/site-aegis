import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { name, email, message } = await request.json();
          if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: "Campos obrigatorios" }), { status: 400 });
          }

          console.log("[Contact]", { name, email, message });

          const RESEND_API_KEY = process.env.RESEND_API_KEY;
          const DISCORD_CONTACT_WEBHOOK_URL = process.env.DISCORD_CONTACT_WEBHOOK_URL;
          const CONTACT_EMAIL = "suporte@arxdevs.xyz";

          // Envia para webhook do Discord se configurado
          if (DISCORD_CONTACT_WEBHOOK_URL) {
            try {
              await fetch(DISCORD_CONTACT_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  content: `**Novo contato site Aegis**
**Nome:** ${name}
**Email:** ${email}
**Mensagem:**
${message}`
                }),
              });
            } catch (webhookErr) {
              console.error("[Contact] Erro ao enviar para webhook Discord:", webhookErr);
            }
          } else {
            console.log("[Contact] DISCORD_CONTACT_WEBHOOK_URL nao configurado, pulando webhook.");
          }

          // Tenta Resend como alternativa/complemento
          if (RESEND_API_KEY) {
            try {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${RESEND_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "Contato Aegis <onboarding@resend.dev>",
                  to: CONTACT_EMAIL,
                  reply_to: email,
                  subject: `[Contato Aegis] ${name} entrou em contato`,
                  text: `Nome: ${name}\nEmail: ${email}\nMensagem:\n${message}`,
                }),
              });
            } catch (resendErr) {
              console.error("[Contact] Erro ao enviar via Resend:", resendErr);
            }
          }

          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        } catch (err) {
          console.error("[Contact] Erro interno:", err);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
      },
    },
  },
});
