import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/data/tasks";

const STORAGE_KEY = "deep-maintenance-state-v1";

export type Completion = { at: string; by: string };
export type StoreState = {
  completed: Record<string, Completion>;
  custom: Record<string, string[]>;
  crew: string;
};

const EMPTY: StoreState = { completed: {}, custom: {}, crew: "" };

export const taskKey = (categoryId: string, task: string) => `${categoryId}::${task}`;
export const todayKey = () => new Date().toISOString().slice(0, 10);

function read(): StoreState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

export function useTaskStore() {
  const [state, setState] = useState<StoreState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(pruneDaily(read()));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

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
      const completed = { ...prev.completed };
      delete completed[taskKey(categoryId, task)];
      return {
        ...prev,
        completed,
        custom: {
          ...prev.custom,
          [categoryId]: (prev.custom[categoryId] ?? []).filter((item) => item !== task),
        },
      };
    });
  }, []);

  const setCrew = useCallback((crew: string) => setState((prev) => ({ ...prev, crew })), []);

  const tasksFor = useCallback(
    (categoryId: string) => {
      const base = CATEGORIES.find((category) => category.id === categoryId)?.tasks ?? [];
      return [...base, ...(state.custom[categoryId] ?? [])];
    },
    [state.custom],
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
    setCrew,
    tasksFor,
    isCustom,
  };
}
