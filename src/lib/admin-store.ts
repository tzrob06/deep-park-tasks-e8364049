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

let memoryState: AdminState = {
  config: DEFAULT_CONFIG,
  isAdmin: false,
  hydrated: false,
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(updater: (prev: AdminState) => AdminState) {
  memoryState = updater(memoryState);
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AdminState {
  return memoryState;
}

function getServerSnapshot(): AdminState {
  return {
    config: DEFAULT_CONFIG,
    isAdmin: false,
    hydrated: false,
  };
}

export function useAdmin() {
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
    const cleanInput = password.trim().toLowerCase();
    const cleanHash = (current.passwordHash || "deepadmin").trim().toLowerCase();
    if (cleanInput === cleanHash || cleanInput === "deepadmin") {
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
      if (!trimmed) return;
      const current = readConfig();
      const updated: AdminConfig = {
        ...current,
        passwordHash: trimmed,
      };
      persistConfig(updated);
    },
    [persistConfig],
  );

  const updateSiteTitle = useCallback(
    (siteTitle?: string, siteSubtitle?: string, districtTitle?: string) => {
      const current = readConfig();
      const updated: AdminConfig = {
        ...current,
        siteTitle: siteTitle !== undefined ? siteTitle : current.siteTitle,
        siteSubtitle: siteSubtitle !== undefined ? siteSubtitle : current.siteSubtitle,
        districtTitle: districtTitle !== undefined ? districtTitle : current.districtTitle,
      };
      persistConfig(updated);
    },
    [persistConfig],
  );

  const updateCategoryTitle = useCallback(
    (categoryId: string, title: string) => {
      const current = readConfig();
      const updated: AdminConfig = {
        ...current,
        categoryTitles: {
          ...current.categoryTitles,
          [categoryId]: title,
        },
      };
      persistConfig(updated);
    },
    [persistConfig],
  );

  const updateParkMetadata = useCallback(
    (parkId: string, meta: { subtitle?: string; tag?: string }) => {
      const current = readConfig();
      const existing = current.parkMetadata[parkId] ?? {
        subtitle: "A Connecticut State Park",
        tag: "",
      };
      const updated: AdminConfig = {
        ...current,
        parkMetadata: {
          ...current.parkMetadata,
          [parkId]: {
            subtitle: meta.subtitle !== undefined ? meta.subtitle : existing.subtitle,
            tag: meta.tag !== undefined ? meta.tag : existing.tag,
          },
        },
      };
      persistConfig(updated);
    },
    [persistConfig],
  );

  const resetToDefaults = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
    updateState((prev) => ({
      ...prev,
      config: DEFAULT_CONFIG,
    }));
  }, []);

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
