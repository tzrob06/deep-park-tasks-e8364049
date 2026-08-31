import { useCallback, useEffect, useSyncExternalStore } from "react";
import { PARKS, type Park } from "@/data/parks";

const PARKS_KEY = "deep-parks-v1";
const SELECTED_KEY = "deep-selected-park-v1";

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function readParks(): Park[] {
  if (typeof window === "undefined") return PARKS;
  try {
    const raw = window.localStorage.getItem(PARKS_KEY);
    if (!raw) return PARKS;
    const parsed = JSON.parse(raw) as Park[];
    return Array.isArray(parsed) && parsed.length ? parsed : PARKS;
  } catch {
    return PARKS;
  }
}

function readSelected(): string | null {
  if (typeof window === "undefined") return null;
  const list = readParks();
  const stored = window.localStorage.getItem(SELECTED_KEY);
  return stored && list.some((p) => p.id === stored) ? stored : null;
}

type ParksState = {
  parks: Park[];
  selected: string | null;
  hydrated: boolean;
};

let currentParksState: ParksState = {
  parks: PARKS,
  selected: null,
  hydrated: false,
};

const parkListeners = new Set<() => void>();

function notifyParks() {
  for (const listener of parkListeners) {
    listener();
  }
}

function updateParksState(updater: (prev: ParksState) => ParksState) {
  currentParksState = updater(currentParksState);
  notifyParks();
}

if (typeof window !== "undefined") {
  currentParksState = {
    parks: readParks(),
    selected: readSelected(),
    hydrated: true,
  };
}

export function useParks() {
  const subscribe = useCallback((listener: () => void) => {
    parkListeners.add(listener);
    return () => {
      parkListeners.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => currentParksState, []);
  const getServerSnapshot = useCallback(
    () => ({
      parks: PARKS,
      selected: null,
      hydrated: false,
    }),
    [],
  );

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!state.hydrated) {
      updateParksState((prev) => ({
        ...prev,
        parks: readParks(),
        selected: readSelected(),
        hydrated: true,
      }));
    }
  }, [state.hydrated]);

  const persist = useCallback((list: Park[]) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PARKS_KEY, JSON.stringify(list));
    }
    updateParksState((prev) => ({
      ...prev,
      parks: list,
    }));
  }, []);

  const select = useCallback((id: string | null) => {
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem(SELECTED_KEY, id);
      else window.localStorage.removeItem(SELECTED_KEY);
    }
    updateParksState((prev) => ({
      ...prev,
      selected: id,
    }));
  }, []);

  const addPark = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const id = slugify(trimmed) || `park-${Date.now()}`;
      const list = readParks();
      if (list.some((park) => park.id === id)) return id;
      const updated = [...list, { id, name: trimmed }];
      persist(updated);
      return id;
    },
    [persist],
  );

  const removePark = useCallback(
    (id: string) => {
      const list = readParks().filter((park) => park.id !== id);
      const updated = list.length ? list : PARKS;
      persist(updated);
      if (state.selected === id) select(null);
    },
    [persist, select, state.selected],
  );

  const renamePark = useCallback(
    (id: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      const list = readParks().map((park) =>
        park.id === id ? { ...park, name: trimmed } : park,
      );
      persist(list);
    },
    [persist],
  );

  const nameFor = useCallback(
    (id: string) => state.parks.find((park) => park.id === id)?.name ?? id,
    [state.parks],
  );

  return {
    parks: state.parks,
    selected: state.selected,
    hydrated: state.hydrated,
    select,
    addPark,
    removePark,
    renamePark,
    nameFor,
  };
}
