import { useCallback, useEffect, useState } from "react";

const ADMIN_STORAGE_KEY = "deep-admin-config-v1";
const ADMIN_AUTH_KEY = "deep-admin-session-v1";

export type AdminConfig = {
  passwordHash: string;
  siteTitle: string;
  siteSubtitle: string;
  districtTitle: string;
  categoryTitles: Record<string, string>;
  parkMetadata: Record<string, { subtitle: string; tag?: string }>;
};

export const DEFAULT_CONFIG: AdminConfig = {
  passwordHash: "deepadmin",
  siteTitle: "DEEP Park Maintenance",
  siteSubtitle: "Select your park work site",
  districtTitle: "Connecticut DEEP · Western District Parks Maintenance",
  categoryTitles: {
    weekly: "Weekly Tasks",
    monthly: "Monthly Tasks",
    seasonal: "Seasonal Tasks",
  },
  parkMetadata: {
    southford: {
      subtitle: "A Connecticut State Park",
      tag: "Southbury / Oxford, CT",
    },
    putnam: {
      subtitle: "A Connecticut State Park",
      tag: "Redding, CT",
    },
  },
};

function readConfig(): AdminConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AdminConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      categoryTitles: {
        ...DEFAULT_CONFIG.categoryTitles,
        ...(parsed.categoryTitles ?? {}),
      },
      parkMetadata: {
        ...DEFAULT_CONFIG.parkMetadata,
        ...(parsed.parkMetadata ?? {}),
      },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useAdmin() {
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setConfig(readConfig());
    const authSession = window.localStorage.getItem(ADMIN_AUTH_KEY);
    if (authSession === "true") {
      setIsAdmin(true);
    }
    setHydrated(true);
  }, []);

  const persistConfig = useCallback((newConfig: AdminConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(newConfig));
    }
  }, []);

  const login = useCallback((password: string): boolean => {
    const current = readConfig();
    if (password.trim() === current.passwordHash) {
      setIsAdmin(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  }, []);

  const changePassword = useCallback(
    (newPassword: string) => {
      const trimmed = newPassword.trim();
      if (!trimmed) return false;
      const updated = { ...config, passwordHash: trimmed };
      persistConfig(updated);
      return true;
    },
    [config, persistConfig],
  );

  const updateSiteTitle = useCallback(
    (siteTitle: string, siteSubtitle?: string, districtTitle?: string) => {
      const updated: AdminConfig = {
        ...config,
        siteTitle: siteTitle.trim() || DEFAULT_CONFIG.siteTitle,
        siteSubtitle: siteSubtitle !== undefined ? siteSubtitle.trim() : config.siteSubtitle,
        districtTitle: districtTitle?.trim() || DEFAULT_CONFIG.districtTitle,
      };
      persistConfig(updated);
    },
    [config, persistConfig],
  );

  const updateCategoryTitle = useCallback(
    (categoryId: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      const updated: AdminConfig = {
        ...config,
        categoryTitles: {
          ...config.categoryTitles,
          [categoryId]: trimmed,
        },
      };
      persistConfig(updated);
    },
    [config, persistConfig],
  );

  const updateParkMetadata = useCallback(
    (parkId: string, metadata: { subtitle: string; tag?: string }) => {
      const updated: AdminConfig = {
        ...config,
        parkMetadata: {
          ...config.parkMetadata,
          [parkId]: metadata,
        },
      };
      persistConfig(updated);
    },
    [config, persistConfig],
  );

  const resetToDefaults = useCallback(() => {
    persistConfig(DEFAULT_CONFIG);
  }, [persistConfig]);

  return {
    config,
    isAdmin,
    hydrated,
    login,
    logout,
    changePassword,
    updateSiteTitle,
    updateCategoryTitle,
    updateParkMetadata,
    resetToDefaults,
  };
}
