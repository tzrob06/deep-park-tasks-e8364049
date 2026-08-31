import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/data/tasks";

const storageKey = (parkId: string) => `deep-maintenance-state-v2::${parkId}`;

export type Completion = { at: string; by: string };
export type Priority = "low" | "medium" | "high";
export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
export const DEFAULT_PRIORITY: Priority = "medium";

export type StoreState = {
  /** Master task list, grouped by category. Fully editable on the Task Library page. */
  library: Record<string, string[]>;
  /** Extra tasks pinned to a specific calendar day (YYYY-MM-DD). */
  schedule: Record<string, string[]>;
  /** Completions keyed by `${date}::${task}`. */
  completed: Record<string, Completion>;
  /** Priority per task label. */
  priorities: Record<string, Priority>;
  crew: string;
};

export const defaultLibrary = (parkId?: string): Record<string, string[]> => {
  if (parkId && parkId !== "southford") {
    return Object.fromEntries(CATEGORIES.map((category) => [category.id, []]));
  }
  return Object.fromEntries(CATEGORIES.map((category) => [category.id, [...category.tasks]]));
};

const EMPTY: StoreState = {
  library: {},
  schedule: {},
  completed: {},
  priorities: {},
  crew: "",
};

export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const todayKey = () => dateKey(new Date());
export const completionKey = (date: string, task: string) => `${date}::${task}`;

function read(parkId: string): StoreState {
  const fallbackLibrary = defaultLibrary(parkId);
  if (typeof window === "undefined") return { ...EMPTY, library: fallbackLibrary };
  try {
    const raw = window.localStorage.getItem(storageKey(parkId));
    if (!raw) return { ...EMPTY, library: fallbackLibrary };
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    let library = { ...(parsed.library ?? fallbackLibrary) };
    // Legacy state may still hold the removed "Daily Tasks" category — drop it.
    delete library["daily"];

    // If this is not Southford, and the library is identical to Southford's default list, clear it to start clean.
    if (parkId !== "southford" && parsed.library) {
      const southfordTasks = defaultLibrary("southford");
      const isExactDefault = Object.keys(southfordTasks).every((cat) => {
        const current = parsed.library?.[cat] ?? [];
        const original = southfordTasks[cat] ?? [];
        return current.length === original.length && current.every((t, i) => t === original[i]);
      });
      if (isExactDefault) {
        library = defaultLibrary(parkId);
      }
    }

    return {
      ...EMPTY,
      ...parsed,
      library,
    };
  } catch {
    return { ...EMPTY, library: fallbackLibrary };
  }
}

export function useTaskStore(parkId: string) {
  const [state, setState] = useState<StoreState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    setState(read(parkId));
    setHydrated(true);
  }, [parkId]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(parkId), JSON.stringify(state));
  }, [state, hydrated, parkId]);

  const toggle = useCallback((date: string, task: string) => {
    setState((prev) => {
      const key = completionKey(date, task);
      const completed = { ...prev.completed };
      if (completed[key]) delete completed[key];
      else completed[key] = { at: new Date().toISOString(), by: prev.crew.trim() };
      return { ...prev, completed };
    });
  }, []);

  const clearDay = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      completed: Object.fromEntries(
        Object.entries(prev.completed).filter(([key]) => !key.startsWith(`${date}::`)),
      ),
    }));
  }, []);

  /** Pin a task to a specific day. */
  const scheduleTask = useCallback((date: string, task: string, priority?: Priority) => {
    const value = task.trim();
    if (!value) return;
    setState((prev) => {
      const existing = prev.schedule[date] ?? [];
      if (existing.includes(value)) return prev;
      return {
        ...prev,
        schedule: { ...prev.schedule, [date]: [...existing, value] },
        priorities: priority ? { ...prev.priorities, [value]: priority } : prev.priorities,
      };
    });
  }, []);

  const unscheduleTask = useCallback((date: string, task: string) => {
    setState((prev) => {
      const completed = { ...prev.completed };
      delete completed[completionKey(date, task)];
      return {
        ...prev,
        completed,
        schedule: {
          ...prev.schedule,
          [date]: (prev.schedule[date] ?? []).filter((item) => item !== task),
        },
      };
    });
  }, []);

  const setPriority = useCallback((task: string, priority: Priority) => {
    setState((prev) => ({ ...prev, priorities: { ...prev.priorities, [task]: priority } }));
  }, []);

  const priorityOf = useCallback(
    (task: string): Priority => state.priorities[task] ?? DEFAULT_PRIORITY,
    [state.priorities],
  );

  const setCrew = useCallback((crew: string) => setState((prev) => ({ ...prev, crew })), []);

  // --- Library editing -----------------------------------------------------

  const libraryFor = useCallback(
    (categoryId: string) => state.library[categoryId] ?? [],
    [state.library],
  );

  const addLibraryTask = useCallback((categoryId: string, task: string, priority?: Priority) => {
    const value = task.trim();
    if (!value) return;
    setState((prev) => {
      const existing = prev.library[categoryId] ?? [];
      if (existing.includes(value)) return prev;
      return {
        ...prev,
        library: { ...prev.library, [categoryId]: [...existing, value] },
        priorities: priority ? { ...prev.priorities, [value]: priority } : prev.priorities,
      };
    });
  }, []);

  const removeLibraryTask = useCallback((categoryId: string, task: string) => {
    setState((prev) => ({
      ...prev,
      library: {
        ...prev.library,
        [categoryId]: (prev.library[categoryId] ?? []).filter((item) => item !== task),
      },
    }));
  }, []);

  const renameLibraryTask = useCallback((categoryId: string, task: string, next: string) => {
    const value = next.trim();
    if (!value || value === task) return;
    setState((prev) => ({
      ...prev,
      library: {
        ...prev.library,
        [categoryId]: (prev.library[categoryId] ?? []).map((item) =>
          item === task ? value : item,
        ),
      },
      priorities: prev.priorities[task]
        ? { ...prev.priorities, [value]: prev.priorities[task]! }
        : prev.priorities,
    }));
  }, []);

  const resetLibrary = useCallback(() => {
    setState((prev) => ({ ...prev, library: defaultLibrary(parkId) }));
  }, [parkId]);

  // --- Day view ------------------------------------------------------------

  /** Tasks show on the day they are scheduled. */
  const tasksForDay = useCallback(
    (date: string) => {
      const pinned = state.schedule[date] ?? [];
      const seen = new Set<string>();
      const all = pinned.filter((task) => {
        if (seen.has(task)) return false;
        seen.add(task);
        return true;
      });
      return all.sort(
        (a, b) =>
          PRIORITY_ORDER[state.priorities[a] ?? DEFAULT_PRIORITY] -
          PRIORITY_ORDER[state.priorities[b] ?? DEFAULT_PRIORITY],
      );
    },
    [state.schedule, state.priorities],
  );

  const dayStats = useCallback(
    (date: string) => {
      const all = tasksForDay(date);
      const done = all.filter((task) => state.completed[completionKey(date, task)]).length;
      return { total: all.length, done };
    },
    [tasksForDay, state.completed],
  );

  return {
    state,
    hydrated,
    toggle,
    clearDay,
    scheduleTask,
    unscheduleTask,
    setPriority,
    priorityOf,
    setCrew,
    libraryFor,
    addLibraryTask,
    removeLibraryTask,
    renameLibraryTask,
    resetLibrary,
    tasksForDay,
    dayStats,
  };
}
