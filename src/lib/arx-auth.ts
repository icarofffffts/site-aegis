import { jwtVerify } from "jose";

const ARX_AUTH_PORTAL = process.env.ARX_AUTH_PORTAL_URL || "https://auth.arxdevs.xyz";
const ARX_JWT_SECRET = new TextEncoder().encode(
  process.env.ARX_JWT_SECRET || "super_secret_arx_auth_key_2026",
);
const SITE_URL = process.env.NEXTAUTH_URL || "https://aegis.arxdevs.xyz";

export interface ArxUserInfo {
  openId: string;
  name: string;
  email: string;
  platform: string;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${ARX_AUTH_PORTAL}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri, clientId: "aegis" }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.accessToken || null;
  } catch {
    return null;
  }
}

export async function verifyArxJwt(token: string): Promise<ArxUserInfo | null> {
  try {
    const { payload } = await jwtVerify(token, ARX_JWT_SECRET);
    return {
      openId: payload.openId as string,
      name: (payload.name as string) || "",
      email: (payload.email as string) || "",
      platform: (payload.platform as string) || "email",
    };
  } catch {
    return null;
  }
}

export function getArxLoginUrl(redirectPath?: string): string {
  const callbackUrl = `${SITE_URL}/auth/arx-callback`;
  const params = new URLSearchParams({ redirectUri: callbackUrl });
  if (redirectPath) params.set("state", redirectPath);
  return `${ARX_AUTH_PORTAL}/?${params.toString()}`;
}

export function buildArxSessionCookie(token: string, maxAgeSeconds = 86400): string {
  return `arx_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}
