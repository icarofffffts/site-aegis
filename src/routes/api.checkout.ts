import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { plan, interval, method } = await request.json();
          if (!plan || !["stripe", "mercadopago"].includes(method)) {
            return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400 });
          }

          const PRICES: Record<string, { monthly: number; year: number }> = {
            premium: { monthly: 1990, year: 19900 },
            partner: { monthly: 4990, year: 49900 },
          };

          const amount = PRICES[plan]?.[interval as "monthly" | "year"];
          if (!amount) {
            return new Response(JSON.stringify({ error: "Plano inválido" }), { status: 400 });
          }

          if (method === "stripe") {
            const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
            if (!STRIPE_SECRET_KEY) {
              // Stripe não configurado - retorna link placeholder
              return new Response(JSON.stringify({ url: "#", error: "Stripe não configurado" }), {
                status: 200,
              });
            }
            const stripe = require("stripe")(STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.create({
              mode: "subscription",
              payment_method_types: ["card"],
              line_items: [
                {
                  price_data: {
                    currency: "brl",
                    product_data: {
                      name: `Aegis ${plan} - ${interval === "year" ? "Anual" : "Mensal"}`,
                    },
                    unit_amount: amount,
                  },
                  quantity: 1,
                },
              ],
              success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
              cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?plan=${plan}`,
            });
            return new Response(JSON.stringify({ url: session.url }), { status: 200 });
          }

          if (method === "mercadopago") {
            const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
            if (!MP_ACCESS_TOKEN) {
              return new Response(
                JSON.stringify({ url: "#", error: "Mercado Pago não configurado" }),
                { status: 200 },
              );
            }
            // MercadoPago preference creation
            const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                items: [
                  {
                    title: `Aegis ${plan} - ${interval === "year" ? "Anual" : "Mensal"}`,
                    quantity: 1,
                    currency_id: "BRL",
                    unit_price: amount / 100,
                  },
                ],
                back_urls: {
                  success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
                  failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?plan=${plan}`,
                },
                auto_return: "approved",
              }),
            });
            const data = await resp.json();
            if (data.init_point) {
              return new Response(JSON.stringify({ url: data.init_point }), { status: 200 });
            }
            return new Response(
              JSON.stringify({ url: "#", error: "Erro ao criar preferência MP" }),
              { status: 200 },
            );
          }

          return new Response(JSON.stringify({ error: "Método inválido" }), { status: 400 });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
        }
      },
    },
  },
});
