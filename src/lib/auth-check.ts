import { verifyArxJwt } from "./arx-auth";

const ADMIN_IDS = (process.env.ADMIN_DISCORD_IDS ?? "")
  .split(",")
  .map((id) => id.trim());

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  username?: string;
  authMethod?: "arx" | "discord";
  reason?: string;
}

export function clearSessionHeaders(): Record<string, string> {
  return {
    "Set-Cookie":
      "arx_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0, aegis_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
  };
}

export async function checkAuth(
  request: Request
): Promise<{ result: AuthResult; clearHeaders?: Record<string, string> }> {
  const cookieHeader = request.headers.get("cookie") ?? "";

  // 1. Check ArxAuthPortal JWT token
  const arxMatch = cookieHeader.match(/arx_token=([^;]+)/);
  if (arxMatch) {
    const user = await verifyArxJwt(arxMatch[1]);
    if (user) {
      return {
        result: {
          authenticated: true,
          userId: user.openId,
          username: user.name || user.email,
          authMethod: "arx",
        },
      };
    }
    return {
      result: { authenticated: false, reason: "expired" },
      clearHeaders: clearSessionHeaders(),
    };
  }

  // 2. Legacy Discord session (base64 cookie)
  const legacyMatch = cookieHeader.match(/aegis_session=([^;]+)/);
  if (!legacyMatch) {
    return {
      result: { authenticated: false, reason: "no_session" },
    };
  }

  try {
    const session = JSON.parse(
      Buffer.from(legacyMatch[1], "base64").toString("utf-8")
    );

    if (Date.now() > session.expiresAt) {
      return {
        result: { authenticated: false, reason: "expired" },
        clearHeaders: clearSessionHeaders(),
      };
    }

    return {
      result: {
        authenticated: true,
        userId: session.id,
        username: session.username,
        authMethod: "discord",
      },
    };
  } catch {
    return {
      result: { authenticated: false, reason: "invalid_session" },
      clearHeaders: clearSessionHeaders(),
    };
  }
}
