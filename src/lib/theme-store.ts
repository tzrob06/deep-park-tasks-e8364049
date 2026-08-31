import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemeId = "pine" | "field" | "dark" | "coastal" | "autumn";

export type ThemeInfo = {
  id: ThemeId;
  name: string;
  badge: string;
  description: string;
  swatches: {
    primary: string;
    bg: string;
    accent: string;
  };
};

export const THEMES: ThemeInfo[] = [
  {
    id: "dark",
    name: "Deep Forest Night",
    badge: "Default",
    description: "Charcoal moss background, glowing emerald green & anti-glare cards",
    swatches: {
      primary: "#10b981",
      bg: "#131f1c",
      accent: "#34d399",
    },
  },
  {
    id: "pine",
    name: "Classic Pine & Topo",
    badge: "Natural",
    description: "Deep evergreen pine, warm stone background & subtle trail accents",
    swatches: {
      primary: "#225c38",
      bg: "#f8f7f2",
      accent: "#d97706",
    },
  },
  {
    id: "field",
    name: "High-Vis Field Crew",
    badge: "High Contrast",
    description: "Industrial safety amber, high-contrast white cards & dark steel borders",
    swatches: {
      primary: "#d97706",
      bg: "#f1f5f9",
      accent: "#ea580c",
    },
  },
  {
    id: "coastal",
    name: "Sound & River Blue",
    badge: "Maritime",
    description: "Connecticut coastal navy, ice mist background & marine teal accents",
    swatches: {
      primary: "#1e40af",
      bg: "#f0fdfa",
      accent: "#0d9488",
    },
  },
  {
    id: "autumn",
    name: "New England Autumn",
    badge: "Warm Heritage",
    description: "Rustic terracotta, golden maple highlights & cedar wood tones",
    swatches: {
      primary: "#b45309",
      bg: "#faf5ef",
      accent: "#c2410c",
    },
  },
];

const THEME_STORAGE_KEY = "deep-theme-v2";
const DEFAULT_THEME: ThemeId = "dark";

let currentTheme: ThemeId = DEFAULT_THEME;
const themeListeners = new Set<() => void>();

function applyThemeToDOM(theme: ThemeId) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
  if (stored && THEMES.some((t) => t.id === stored)) {
    return stored;
  }
  return DEFAULT_THEME;
}

if (typeof window !== "undefined") {
  currentTheme = readStoredTheme();
  applyThemeToDOM(currentTheme);
}

function notify() {
  for (const listener of themeListeners) {
    listener();
  }
}

export function useTheme() {
  const subscribe = useCallback((listener: () => void) => {
    themeListeners.add(listener);
    return () => {
      themeListeners.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => currentTheme, []);
  const getServerSnapshot = useCallback(() => DEFAULT_THEME, []);

  const activeTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyThemeToDOM(activeTheme);
  }, [activeTheme]);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    currentTheme = nextTheme;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
    applyThemeToDOM(nextTheme);
    notify();
  }, []);

  const activeThemeInfo = THEMES.find((t) => t.id === activeTheme) ?? THEMES[0]!;

  return {
    theme: activeTheme,
    themeInfo: activeThemeInfo,
    themes: THEMES,
    setTheme,
  };
}
