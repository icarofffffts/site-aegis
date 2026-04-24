import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "shield-theme";
const DEFAULT_THEME: Theme = "dark";

function resolveClientTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always start with the same value on server and first client render
  // to avoid hydration mismatches. Real theme is resolved in useEffect.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const userChanged = useRef(false);

  // Resolve persisted/system theme once after hydration
  useEffect(() => {
    const resolved = resolveClientTheme();
    if (resolved !== theme) setThemeState(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme to <html> and persist only when user-initiated changes occur
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (!userChanged.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    userChanged.current = true;
    setThemeState(t);
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
