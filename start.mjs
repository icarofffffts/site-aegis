import { createServer } from "node:http";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_CLIENT = join(__dirname, "dist", "client");

const port = parseInt(process.env.PORT || "3004", 10);
const VITE_PREVIEW_PORT = parseInt(process.env.VITE_PREVIEW_PORT || "3002", 10);

// ── Supabase ──────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ── Config ────────────────────────────────────────────────────────
const DISCORD_CLIENT_ID     = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI          = "https://aegis.arxdevs.xyz/auth/callback";
const ADMIN_IDS             = (process.env.ADMIN_DISCORD_IDS ?? "").split(",").map(s => s.trim());

// ── Helpers ───────────────────────────────────────────────────────
function parseCookies(header = "") {
  const out = {};
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) out[k.trim()] = decodeURIComponent(v.join("="));
  }
  return out;
}

function getSession(cookies) {
  const raw = cookies["aegis_session"];
  if (!raw) return null;
  try {
    const s = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
    return Date.now() > s.expiresAt ? null : s;
  } catch { return null; }
}

function sessionCookie(payload, maxAge = 7 * 24 * 3600) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `aegis_session=${encoded}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function redirect(res, location, cookie) {
  const headers = { Location: location };
  if (cookie) headers["Set-Cookie"] = cookie;
  res.writeHead(302, headers);
  res.end();
}

// Converte req do Node para Web Request e passa para o handler SSR
async function passToSSR(req, res) {
  // Proxy para o vite preview na porta interna
  const vitePort = parseInt(process.env.VITE_PREVIEW_PORT || "3002", 10);
  try {
    const headers = { ...req.headers };
    delete headers["host"];
    delete headers["connection"];

    const proxyRes = await fetch(`http://127.0.0.1:${vitePort}${req.url}`, {
      method: req.method,
      headers,
      redirect: "manual",
    });

    const resHeaders = {};
    proxyRes.headers.forEach((v, k) => {
      if (k !== "transfer-encoding") resHeaders[k] = v;
    });
    res.writeHead(proxyRes.status, resHeaders);

    if (proxyRes.body) {
      const reader = proxyRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("[aegis-ssr] Proxy error:", err.message);
    if (!INDEX_HTML) { res.writeHead(503); res.end("Site em manutenção."); return; }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(INDEX_HTML);
  }
}

// Gera o index.html dinamicamente baseado nos assets do build
function buildIndexHtml() {
  try {
    const assetsDir = join(DIST_CLIENT, "assets");
    if (!existsSync(assetsDir)) return null;
    const files = readdirSync(assetsDir);
    const cssFile = files.find(f => f.startsWith("styles-") && f.endsWith(".css"));
    // Pega o maior arquivo index- (o bundle principal do React)
    const indexFiles = files.filter(f => f.startsWith("index-") && f.endsWith(".js"));
    const mainJs = indexFiles.sort((a, b) =>
      statSync(join(assetsDir, b)).size - statSync(join(assetsDir, a)).size
    )[0];

    return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Aegis — Proteção Avançada para sua comunidade</title>
  <meta name="description" content="Bot de moderação e segurança premium para Discord." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" />
  ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
</head>
<body>
  <div id="root"></div>
  ${mainJs ? `<script type="module" src="/assets/${mainJs}"></script>` : ""}
</body>
</html>`;
  } catch (e) {
    console.error("[aegis-ssr] buildIndexHtml error:", e.message);
    return null;
  }
}

const INDEX_HTML = buildIndexHtml();
console.log("[aegis-ssr] index.html built:", INDEX_HTML ? "OK" : "FAILED");
const MIME = {
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
};

function tryServeStatic(pathname, res) {
  // Só serve arquivos dentro de /assets/ ou arquivos conhecidos na raiz
  if (!pathname.startsWith("/assets/") && !pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2)$/)) {
    return false;
  }
  const filePath = join(DIST_CLIENT, pathname);
  if (!existsSync(filePath)) return false;
  const ext = extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  const content = readFileSync(filePath);
  const isImmutable = pathname.startsWith("/assets/"); // assets têm hash no nome
  res.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": content.length,
    "Cache-Control": isImmutable ? "public, max-age=31536000, immutable" : "public, max-age=3600",
  });
  res.end(content);
  return true;
}

// ── Server ────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  const url     = new URL(req.url, `http://${req.headers.host}`);
  const path    = url.pathname;
  const method  = req.method.toUpperCase();
  const cookies = parseCookies(req.headers.cookie);
  const session = getSession(cookies);

  try {
    // ── Assets estáticos — SEMPRE primeiro ──────────────────────
    if (tryServeStatic(path, res)) return;

    // ── Auth: callback ──────────────────────────────────────────
    if (path === "/auth/callback" && method === "GET") {
      const code  = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      console.log(`[callback] ${new Date().toISOString()} code=${!!code} error=${error}`);
      if (error || !code) return redirect(res, "/login?error=access_denied");

      // Responde IMEDIATAMENTE com uma página de loading que faz o processamento via fetch
      const processingHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Autenticando...</title>
<style>body{background:#0d1117;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.spinner{width:40px;height:40px;border:3px solid #30363d;border-top-color:#1f883d;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}</style></head>
<body><div style="text-align:center"><div class="spinner" style="margin:0 auto 16px"></div><p>Autenticando com Discord...</p></div>
<script>
fetch('/api/auth/process', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({code: ${JSON.stringify(code)}})
})
.then(r => r.json())
.then(d => {
  if (d.token) {
    try { localStorage.setItem('aegis_session', d.token); } catch(e) {}
    window.location.replace('/dashboard');
  } else {
    window.location.replace('/login?error=' + (d.error || 'server_error'));
  }
})
.catch(() => window.location.replace('/login?error=server_error'));
</script></body></html>`;

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(processingHtml);
      return;
    }

    // ── Auth: process (chamado pelo browser via fetch) ──────────
    if (path === "/api/auth/process" && method === "POST") {
      let body = "";
      await new Promise((resolve, reject) => {
        req.on("data", c => body += c);
        req.on("end", resolve);
        req.on("error", reject);
      });
      let code;
      try { code = JSON.parse(body).code; } catch { return json(res, 400, { error: "invalid_body" }); }
      if (!code) return json(res, 400, { error: "missing_code" });

      console.log(`[auth/process] ${new Date().toISOString()} processing code...`);

      // Troca code por token
      let tokenData;
      try {
        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), 15000);
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ client_id: DISCORD_CLIENT_ID, client_secret: DISCORD_CLIENT_SECRET, grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
          signal: ac.signal,
        });
        clearTimeout(t);
        if (!tokenRes.ok) {
          const errText = await tokenRes.text();
          console.error("[auth/process] token failed:", tokenRes.status, errText);
          return json(res, 400, { error: "token_exchange" });
        }
        tokenData = await tokenRes.json();
      } catch (err) {
        console.error("[auth/process] token error:", err.message);
        return json(res, 500, { error: "token_exchange" });
      }

      // Busca user e guilds em paralelo
      const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
      let discordUser, userGuilds = [];
      try {
        const [userRes, guildsRes] = await Promise.all([
          withTimeout(fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${tokenData.access_token}` } }), 10000),
          withTimeout(fetch("https://discord.com/api/users/@me/guilds", { headers: { Authorization: `Bearer ${tokenData.access_token}` } }), 10000),
        ]);
        if (!userRes.ok) return json(res, 400, { error: "user_fetch" });
        discordUser = await userRes.json();
        if (!ADMIN_IDS.includes(discordUser.id)) return json(res, 403, { error: "unauthorized" });
        if (guildsRes.ok) {
          const allGuilds = await guildsRes.json();
          userGuilds = allGuilds
            .filter(g => { try { return (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8); } catch { return false; } })
            .map(g => ({ id: g.id, name: g.name, icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null, owner: g.owner }));
        }
      } catch (err) {
        console.error("[auth/process] user/guilds error:", err.message);
        return json(res, 500, { error: "server_error" });
      }

      const payload = {
        id: discordUser.id, username: discordUser.username,
        discriminator: discordUser.discriminator, avatar: discordUser.avatar,
        accessToken: tokenData.access_token, guilds: userGuilds,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      const sessionToken = Buffer.from(JSON.stringify(payload)).toString("base64");
      console.log("[auth/process] success for user:", discordUser.id);
      return json(res, 200, { token: sessionToken });
    }

    // ── Auth: done (salva sessão no localStorage e redireciona) ─
    if (path === "/auth/done" && method === "GET") {
      const t = url.searchParams.get("t");
      if (!t) return redirect(res, "/login?error=missing_token");
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Aegis</title></head><body><script>
        try {
          localStorage.setItem('aegis_session', decodeURIComponent('${encodeURIComponent(t)}'));
        } catch(e) {}
        window.location.replace('/dashboard');
      </script></body></html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // ── Auth: logout-server (expira cookie via POST) ────────────
    if (path === "/auth/logout-server" && method === "POST") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": "aegis_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    // ── Auth: logout (legado — redireciona para /logout) ────────
    if (path === "/auth/logout" && method === "GET") {
      return redirect(res, "/logout");
    }

    // ── API: /api/me ────────────────────────────────────────────
    if (path === "/api/me" && method === "GET") {
      // Aceita token via Authorization header (localStorage) ou cookie
      let session = null;
      const authHeader = req.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        try {
          const s = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString("utf-8"));
          if (Date.now() < s.expiresAt) session = s;
        } catch {}
      }
      if (!session) session = getSession(cookies);

      if (!session) return json(res, 401, { authenticated: false });
      return json(res, 200, {
        authenticated: true,
        user: {
          id: session.id, username: session.username,
          discriminator: session.discriminator,
          avatar: session.avatar
            ? `https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/0.png`,
        },
      });
    }

    // ── API: /api/dashboard ─────────────────────────────────────
    if (path === "/api/dashboard" && method === "GET") {
      let sess = session;
      const authHeader = req.headers["authorization"];
      if (!sess && authHeader?.startsWith("Bearer ")) {
        try { const s = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString("utf-8")); if (Date.now() < s.expiresAt) sess = s; } catch {}
      }
      if (!sess) return json(res, 401, { error: "unauthorized" });

      const since24h = new Date(Date.now() - 86400000).toISOString();
      const [
        { count: totalAlerts },
        { count: criticalAlerts },
        { data: flaggedData },
        { count: alertsToday },
        { data: recentActions },
        { data: pendingReports },
      ] = await Promise.all([
        supabase.from("arx_alerts").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("arx_alerts").select("*", { count: "exact", head: true }).eq("is_active", true).eq("severity", "critical"),
        supabase.from("arx_alerts").select("discord_user_id").eq("is_active", true),
        supabase.from("arx_alerts").select("*", { count: "exact", head: true }).gte("created_at", since24h),
        supabase.from("arx_action_log").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("reports").select("id,target_discord_id,reason,severity,created_at").eq("status", "pending").order("created_at", { ascending: true }).limit(20),
      ]);

      const flaggedUsers = new Set((flaggedData ?? []).map(r => r.discord_user_id)).size;
      return json(res, 200, {
        stats: { totalAlerts: totalAlerts ?? 0, criticalAlerts: criticalAlerts ?? 0, flaggedUsers, alertsToday: alertsToday ?? 0, botOnline: true, botLastSeen: new Date().toISOString() },
        recentActions: recentActions ?? [],
        pendingReports: pendingReports ?? [],
      });
    }

    // ── API: /api/reports ───────────────────────────────────────
    if (path === "/api/reports" && method === "PATCH") {
      let sess = session;
      const authHeader = req.headers["authorization"];
      if (!sess && authHeader?.startsWith("Bearer ")) {
        try { const s = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString("utf-8")); if (Date.now() < s.expiresAt) sess = s; } catch {}
      }
      if (!sess) return json(res, 401, { error: "unauthorized" });
      const id     = url.searchParams.get("id");
      const action = url.searchParams.get("action");
      if (!id || !["approve","reject"].includes(action)) return json(res, 400, { error: "invalid_params" });
      const { error } = await supabase.from("reports").update({ status: action === "approve" ? "approved" : "rejected", reviewed_by: sess.id, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { ok: true });
    }

    // ── API: /api/guilds ────────────────────────────────────────
    if (path === "/api/guilds" && method === "GET") {
      let sess = session;
      const authHeader = req.headers["authorization"];
      if (!sess && authHeader?.startsWith("Bearer ")) {
        try { const s = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString("utf-8")); if (Date.now() < s.expiresAt) sess = s; } catch {}
      }
      if (!sess) return json(res, 401, { error: "unauthorized" });

      const userGuilds = sess.guilds ?? [];

      // Busca os servidores onde o bot está via Discord API (bot token)
      let botGuilds = [];
      try {
        const botRes = await fetch("https://discord.com/api/users/@me/guilds", {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
        });
        if (botRes.ok) {
          const data = await botRes.json();
          botGuilds = data.map(g => g.id);
        }
      } catch {}

      // Intersecção: servidores onde o usuário é admin E o bot está
      const mutual = userGuilds.filter(g => botGuilds.includes(g.id));
      // Servidores onde o usuário é admin mas o bot não está
      const notAdded = userGuilds.filter(g => !botGuilds.includes(g.id));

      return json(res, 200, { mutual, notAdded });
    }

    // ── API: /api/guild-config ──────────────────────────────────
    if (path === "/api/guild-config" && method === "GET") {
      let sess = session;
      const authHeader = req.headers["authorization"];
      if (!sess && authHeader?.startsWith("Bearer ")) {
        try { const s = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString("utf-8")); if (Date.now() < s.expiresAt) sess = s; } catch {}
      }
      if (!sess) return json(res, 401, { error: "unauthorized" });

      const guildId = url.searchParams.get("guildId");
      if (!guildId) return json(res, 400, { error: "guildId required" });

      const { data: config } = await supabase.from("arx_server_config").select("*").eq("discord_guild_id", guildId).single();
      const { data: patterns } = await supabase.from("arx_detection_patterns").select("*").eq("discord_guild_id", guildId).eq("is_active", true);

      return json(res, 200, { config: config ?? null, patterns: patterns ?? [] });
    }

    if (path === "/api/guild-config" && method === "PATCH") {
      let sess = session;
      const authHeader = req.headers["authorization"];
      if (!sess && authHeader?.startsWith("Bearer ")) {
        try { const s = JSON.parse(Buffer.from(authHeader.slice(7), "base64").toString("utf-8")); if (Date.now() < s.expiresAt) sess = s; } catch {}
      }
      if (!sess) return json(res, 401, { error: "unauthorized" });

      const chunks = [];
      await new Promise((resolve, reject) => { req.on("data", c => chunks.push(c)); req.on("end", resolve); req.on("error", reject); });
      const body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
      const { guildId, config } = body;
      if (!guildId) return json(res, 400, { error: "guildId required" });

      const { data: existing } = await supabase.from("arx_server_config").select("id").eq("discord_guild_id", guildId).single();
      let result;
      if (existing) {
        result = await supabase.from("arx_server_config").update({ ...config, updated_at: new Date().toISOString() }).eq("discord_guild_id", guildId).select().single();
      } else {
        result = await supabase.from("arx_server_config").insert({ discord_guild_id: guildId, ...config }).select().single();
      }
      if (result.error) return json(res, 500, { error: result.error.message });
      return json(res, 200, { ok: true, config: result.data });
    }

    // ── API: /api/health-check ──────────────────────────────────
    if (path === "/api/health-check" && method === "GET") {
      return json(res, 200, { status: "operational", timestamp: new Date().toISOString(), service: "aegis-site" });
    }

    // ── Tudo mais → SSR handler (páginas React) ─────────────────
    await passToSSR(req, res);

  } catch (err) {
    console.error("[aegis-ssr] Error on", path, "-", err.message);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[aegis-ssr] Server running on port ${port}`);
});

// Evita que erros não capturados matem o processo
process.on("uncaughtException", (err) => {
  console.error("[aegis-ssr] Uncaught exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[aegis-ssr] Unhandled rejection:", reason);
});
