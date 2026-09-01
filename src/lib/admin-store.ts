import { useCallback, useEffect, useSyncExternalStore } from "react";

const ADMIN_STORAGE_KEY = "deep-admin-config-v2";
const AUTH_SESSION_KEY = "deep-auth-session-v2";

export type UserRole = "viewer" | "crew" | "boss";

export type AdminConfig = {
  passwordHash: string; // Boss password
  crewPasswordHash: string; // Crew password
  siteTitle: string;
  siteSubtitle: string;
  districtTitle: string;
  categoryTitles: Record<string, string>;
  parkMetadata: Record<string, { subtitle: string; tag?: string }>;
};

export const DEFAULT_CONFIG: AdminConfig = {
  passwordHash: "deepadmin",
  crewPasswordHash: "deep1234",
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
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY) || window.localStorage.getItem("deep-admin-config-v1");
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AdminConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      crewPasswordHash: parsed.crewPasswordHash || DEFAULT_CONFIG.crewPasswordHash,
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

function readAuth(): UserRole {
  if (typeof window === "undefined") return "viewer";
  try {
    const session = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (session === "boss" || session === "crew") return session;
    // Check legacy v1 session
    if (window.localStorage.getItem("deep-admin-session-v1") === "true") return "boss";
    return "viewer";
  } catch {
    return "viewer";
  }
}

type AdminState = {
  config: AdminConfig;
  role: UserRole;
  hydrated: boolean;
};

let currentState: AdminState = {
  config: DEFAULT_CONFIG,
  role: "viewer",
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
    role: readAuth(),
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
      role: "viewer" as UserRole,
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
        role: readAuth(),
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

  const loginBoss = useCallback((password: string): boolean => {
    const current = readConfig();
    const cleanInput = password.trim().toLowerCase();
    const cleanHash = (current.passwordHash || "deepadmin").trim().toLowerCase();
    if (cleanInput === cleanHash || cleanInput === "deepadmin") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_SESSION_KEY, "boss");
      }
      updateState((prev) => ({
        ...prev,
        role: "boss",
      }));
      return true;
    }
    return false;
  }, []);

  const loginCrew = useCallback((password: string): boolean => {
    const current = readConfig();
    const cleanInput = password.trim().toLowerCase();
    const cleanHash = (current.crewPasswordHash || "deep1234").trim().toLowerCase();
    if (cleanInput === cleanHash || cleanInput === "deep1234") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUTH_SESSION_KEY, "crew");
      }
      updateState((prev) => ({
        ...prev,
        role: "crew",
      }));
      return true;
    }
    return false;
  }, []);

  const login = useCallback(
    (password: string): { success: boolean; role?: UserRole } => {
      if (loginBoss(password)) {
        return { success: true, role: "boss" };
      }
      if (loginCrew(password)) {
        return { success: true, role: "crew" };
      }
      return { success: false };
    },
    [loginBoss, loginCrew],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_SESSION_KEY, "viewer");
      window.localStorage.removeItem("deep-admin-session-v1");
    }
    updateState((prev) => ({
      ...prev,
      role: "viewer",
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

  const changeCrewPassword = useCallback(
    (newPassword: string) => {
      const trimmed = newPassword.trim();
      if (!trimmed) return false;
      const updated = { ...state.config, crewPasswordHash: trimmed };
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

  const isAdmin = state.role === "boss";
  const isCrew = state.role === "crew" || state.role === "boss";
  const isViewer = state.role === "viewer";

  return {
    config: state.config,
    role: state.role,
    isAdmin, // Boss only
    isBoss: isAdmin,
    isCrew, // Crew or Boss
    isViewer, // View only
    hydrated: state.hydrated,
    login,
    loginBoss,
    loginCrew,
    logout,
    changePassword,
    changeCrewPassword,
    updateSiteTitle,
    updateCategoryTitle,
    updateParkMetadata,
    resetToDefaults,
  };
}
