import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { name, email, message } = await request.json();
          if (!name || !email || !message) {
            return new Response(JSON.stringify({ error: "Campos obrigatórios" }), { status: 400 });
          }

          // Envia email via SMTP ou serviço de email
          // Por enquanto, loga e retorna sucesso
          console.log("[Contact]", { name, email, message });

          const RESEND_API_KEY = process.env.RESEND_API_KEY;
          const CONTACT_EMAIL = "suporte@arxdevs.xyz";

          if (RESEND_API_KEY) {
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
          }

          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
        }
      },
    },
  },
});
