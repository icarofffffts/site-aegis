import { useEffect } from "react";

interface BrandingColors {
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  custom_css?: string | null;
}

const STORAGE_KEY = "aegis_branding_style";

export function useBrandingEffect(branding: BrandingColors | null) {
  useEffect(() => {
    const root = document.documentElement;
    const existingStyle = document.getElementById(STORAGE_KEY);

    if (
      !branding?.primary_color &&
      !branding?.secondary_color &&
      !branding?.accent_color &&
      !branding?.custom_css
    ) {
      if (existingStyle) existingStyle.remove();
      return;
    }

    let css = "";
    if (branding.primary_color) {
      css += `--brand-primary: ${branding.primary_color};`;
      css += `--primary: ${branding.primary_color};`;
    }
    if (branding.secondary_color) {
      css += `--brand-secondary: ${branding.secondary_color};`;
      css += `--secondary: ${branding.secondary_color};`;
    }
    if (branding.accent_color) {
      css += `--brand-accent: ${branding.accent_color};`;
      css += `--ring: ${branding.accent_color};`;
    }
    if (branding.custom_css) {
      css += branding.custom_css;
    }

    if (existingStyle) {
      existingStyle.textContent = `:root { ${css} }`;
    } else {
      const style = document.createElement("style");
      style.id = STORAGE_KEY;
      style.textContent = `:root { ${css} }`;
      document.head.appendChild(style);
    }

    return () => {
      const s = document.getElementById(STORAGE_KEY);
      if (s) s.remove();
    };
  }, [branding]);
}
