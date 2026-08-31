import { useCallback, useEffect, useSyncExternalStore } from "react";

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

function readAuth(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

type AdminState = {
  config: AdminConfig;
  isAdmin: boolean;
  hydrated: boolean;
};

let currentState: AdminState = {
  config: DEFAULT_CONFIG,
  isAdmin: false,
  hydrated: false,
};

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(updater: (prev: AdminState) => AdminState) {
  currentState = updater(currentState);
  notify();
}

if (typeof window !== "undefined") {
  currentState = {
    config: readConfig(),
    isAdmin: readAuth(),
    hydrated: true,
  };
}

export function useAdmin() {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => currentState, []);
  const getServerSnapshot = useCallback(
    () => ({
      config: DEFAULT_CONFIG,
      isAdmin: false,
      hydrated: false,
    }),
    [],
  );

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!state.hydrated) {
      updateState((prev) => ({
        ...prev,
        config: readConfig(),
        isAdmin: readAuth(),
        hydrated: true,
      }));
    }
  }, [state.hydrated]);

  const persistConfig = useCallback((newConfig: AdminConfig) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(newConfig));
    }
    updateState((prev) => ({
      ...prev,
      config: newConfig,
    }));
  }, []);

  const login = useCallback((password: string): boolean => {
    const current = readConfig();
    if (password.trim() === current.passwordHash) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_AUTH_KEY, "true");
      }
      updateState((prev) => ({
        ...prev,
        isAdmin: true,
      }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
    }
    updateState((prev) => ({
      ...prev,
      isAdmin: false,
    }));
  }, []);

  const changePassword = useCallback(
    (newPassword: string) => {
      const trimmed = newPassword.trim();
      if (!trimmed) return false;
      const updated = { ...state.config, passwordHash: trimmed };
      persistConfig(updated);
      return true;
    },
    [state.config, persistConfig],
  );

  const updateSiteTitle = useCallback(
    (siteTitle: string, siteSubtitle?: string, districtTitle?: string) => {
      const updated: AdminConfig = {
        ...state.config,
        siteTitle: siteTitle.trim() || DEFAULT_CONFIG.siteTitle,
        siteSubtitle: siteSubtitle !== undefined ? siteSubtitle.trim() : state.config.siteSubtitle,
        districtTitle: districtTitle?.trim() || DEFAULT_CONFIG.districtTitle,
      };
      persistConfig(updated);
    },
    [state.config, persistConfig],
  );

  const updateCategoryTitle = useCallback(
    (categoryId: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      const updated: AdminConfig = {
        ...state.config,
        categoryTitles: {
          ...state.config.categoryTitles,
          [categoryId]: trimmed,
        },
      };
      persistConfig(updated);
    },
    [state.config, persistConfig],
  );

  const updateParkMetadata = useCallback(
    (parkId: string, metadata: { subtitle: string; tag?: string }) => {
      const updated: AdminConfig = {
        ...state.config,
        parkMetadata: {
          ...state.config.parkMetadata,
          [parkId]: metadata,
        },
      };
      persistConfig(updated);
    },
    [state.config, persistConfig],
  );

  const resetToDefaults = useCallback(() => {
    persistConfig(DEFAULT_CONFIG);
  }, [persistConfig]);

  return {
    config: state.config,
    isAdmin: state.isAdmin,
    hydrated: state.hydrated,
    login,
    logout,
    changePassword,
    updateSiteTitle,
    updateCategoryTitle,
    updateParkMetadata,
    resetToDefaults,
  };
}
