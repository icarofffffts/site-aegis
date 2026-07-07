interface BrandingState {
  brandName?: string | null;
  logoUrl?: string | null;
  hideBranding?: boolean | null;
}

const STORAGE_KEY = "aegis_active_branding";

export function getStoredBranding(): BrandingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredBranding(branding: BrandingState | null) {
  if (typeof window === "undefined") return;
  try {
    if (branding) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}
