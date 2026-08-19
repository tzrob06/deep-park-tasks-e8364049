import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/data/tasks";

const storageKey = (parkId: string) => `deep-maintenance-state-v1::${parkId}`;

export type Completion = { at: string; by: string };
export type StoreState = {
  completed: Record<string, Completion>;
  custom: Record<string, string[]>;
  /** Keys of built-in tasks the crew has removed from the list. */
  removed: string[];
  crew: string;
};

const EMPTY: StoreState = { completed: {}, custom: {}, removed: [], crew: "" };

export const taskKey = (categoryId: string, task: string) => `${categoryId}::${task}`;
export const todayKey = () => new Date().toISOString().slice(0, 10);

function read(parkId: string): StoreState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(parkId));
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<StoreState>) };
  } catch {
    return EMPTY;
  }
}

/** Daily tasks clear themselves automatically at the start of a new day. */
function pruneDaily(state: StoreState): StoreState {
  const today = todayKey();
  const completed: Record<string, Completion> = {};
  for (const [key, value] of Object.entries(state.completed)) {
    const isDaily = key.startsWith("daily::");
    if (isDaily && value.at.slice(0, 10) !== today) continue;
    completed[key] = value;
  }
  return { ...state, completed };
}

export function useTaskStore(parkId: string) {
  const [state, setState] = useState<StoreState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    setState(pruneDaily(read(parkId)));
    setHydrated(true);
  }, [parkId]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(parkId), JSON.stringify(state));
  }, [state, hydrated, parkId]);

  const toggle = useCallback((categoryId: string, task: string) => {
    setState((prev) => {
      const key = taskKey(categoryId, task);
      const completed = { ...prev.completed };
      if (completed[key]) delete completed[key];
      else completed[key] = { at: new Date().toISOString(), by: prev.crew.trim() };
      return { ...prev, completed };
    });
  }, []);

  const resetCategory = useCallback((categoryId: string) => {
    setState((prev) => {
      const completed = Object.fromEntries(
        Object.entries(prev.completed).filter(([key]) => !key.startsWith(`${categoryId}::`)),
      );
      return { ...prev, completed };
    });
  }, []);

  const addTask = useCallback((categoryId: string, task: string) => {
    const value = task.trim();
    if (!value) return;
    setState((prev) => ({
      ...prev,
      custom: { ...prev.custom, [categoryId]: [...(prev.custom[categoryId] ?? []), value] },
    }));
  }, []);

  const removeTask = useCallback((categoryId: string, task: string) => {
    setState((prev) => {
      const key = taskKey(categoryId, task);
      const completed = { ...prev.completed };
      delete completed[key];
      const isCustom = (prev.custom[categoryId] ?? []).includes(task);
      return {
        ...prev,
        completed,
        custom: isCustom
          ? {
              ...prev.custom,
              [categoryId]: (prev.custom[categoryId] ?? []).filter((item) => item !== task),
            }
          : prev.custom,
        removed: isCustom || prev.removed.includes(key) ? prev.removed : [...prev.removed, key],
      };
    });
  }, []);

  const restoreRemoved = useCallback((categoryId: string) => {
    setState((prev) => ({
      ...prev,
      removed: prev.removed.filter((key) => !key.startsWith(`${categoryId}::`)),
    }));
  }, []);

  const setCrew = useCallback((crew: string) => setState((prev) => ({ ...prev, crew })), []);

  const tasksFor = useCallback(
    (categoryId: string) => {
      // Southford Falls ships with the full built-in checklist; every other park starts blank.
      const builtIn = parkId === "southford" ? CATEGORIES.find((c) => c.id === categoryId)?.tasks ?? [] : [];
      const base = builtIn.filter((task) => !state.removed.includes(taskKey(categoryId, task)));
      return [...base, ...(state.custom[categoryId] ?? [])];
    },
    [state.custom, state.removed, parkId],
  );


  const isCustom = useCallback(
    (categoryId: string, task: string) => (state.custom[categoryId] ?? []).includes(task),
    [state.custom],
  );

  return {
    state,
    hydrated,
    toggle,
    resetCategory,
    addTask,
    removeTask,
    restoreRemoved,
    setCrew,
    tasksFor,
    isCustom,
  };
}
